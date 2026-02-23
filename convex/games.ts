import { mutation, query, internalMutation } from "./_generated/server";
import type { GenericMutationCtx } from "convex/server";
import type { DataModel, Id } from "./_generated/dataModel";
import { internal } from "./_generated/api";
import { v, ConvexError } from "convex/values";

type MutationCtx = GenericMutationCtx<DataModel>;

const COLORS = ["red", "blue", "green", "purple", "orange"] as const;
const MAX_PLAYERS = 5;
const COUNTDOWN_SECONDS = 3;

/**
 * Create a new room with its first game. Returns the roomId for the stable URL.
 *
 * Inserts the room first (without `currentGameId`), then the game (with `roomId`),
 * then patches the room. The circular reference is broken by `currentGameId` being
 * optional in the schema. Within a single transaction, no reader sees the gap.
 */
export const create = mutation({
  args: {
    hostId: v.string(),
    passage: v.string(),
  },
  returns: v.id("rooms"),
  handler: async (ctx, args) => {
    const roomId = await ctx.db.insert("rooms", {
      hostId: args.hostId,
    });

    const gameId = await ctx.db.insert("games", {
      roomId,
      passage: args.passage,
      status: "waiting",
      hostId: args.hostId,
      duration: 30,
    });

    await ctx.db.patch(roomId, { currentGameId: gameId });

    return roomId;
  },
});

/**
 * Primary subscription powering the multiplayer UI.
 * Resolves room -> current game -> players in a single query.
 * Returns null if the room or game no longer exists (e.g. after deletion).
 */
export const get = query({
  args: {
    roomId: v.id("rooms"),
  },
  returns: v.union(
    v.object({
      room: v.object({
        _id: v.id("rooms"),
        _creationTime: v.number(),
        hostId: v.string(),
        currentGameId: v.id("games"),
      }),
      game: v.object({
        _id: v.id("games"),
        _creationTime: v.number(),
        roomId: v.id("rooms"),
        passage: v.string(),
        status: v.union(
          v.literal("waiting"),
          v.literal("countdown"),
          v.literal("running"),
          v.literal("finished"),
        ),
        hostId: v.string(),
        duration: v.number(),
        countdownStartedAt: v.optional(v.number()),
        startedAt: v.optional(v.number()),
      }),
      players: v.array(
        v.object({
          _id: v.id("players"),
          _creationTime: v.number(),
          gameId: v.id("games"),
          guestId: v.string(),
          name: v.string(),
          color: v.string(),
          typedLength: v.number(),
          totalKeystrokes: v.number(),
          errors: v.number(),
          finished: v.boolean(),
          finishedAt: v.optional(v.number()),
          vote: v.optional(v.union(v.literal("replay"), v.literal("exit"))),
        }),
      ),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) return null;

    const currentGameId = room.currentGameId;
    if (!currentGameId) return null;

    const game = await ctx.db.get(currentGameId);
    if (!game) return null;

    const players = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();

    return { room: { ...room, currentGameId }, game, players };
  },
});

/** Join the current game in a room. Color is assigned by cycling the palette. */
export const join = mutation({
  args: {
    roomId: v.id("rooms"),
    guestId: v.string(),
    name: v.string(),
  },
  returns: v.id("players"),
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new ConvexError({ message: "Room not found", code: "NOT_FOUND" });
    }

    const currentGameId = room.currentGameId;
    if (!currentGameId) {
      throw new ConvexError({ message: "Room has no active game", code: "NOT_FOUND" });
    }

    const game = await ctx.db.get(currentGameId);
    if (!game) {
      throw new ConvexError({ message: "Game not found", code: "NOT_FOUND" });
    }
    if (game.status !== "waiting") {
      throw new ConvexError({
        message: "Game is not accepting players",
        code: "INVALID_STATE",
      });
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();

    if (players.length >= MAX_PLAYERS) {
      throw new ConvexError({ message: "Room is full", code: "FULL" });
    }

    const existing = players.find((p) => p.guestId === args.guestId);
    if (existing) {
      throw new ConvexError({
        message: "Already joined this game",
        code: "DUPLICATE",
      });
    }

    const color = COLORS[players.length % COLORS.length];

    return await ctx.db.insert("players", {
      gameId: game._id,
      guestId: args.guestId,
      name: args.name,
      color,
      typedLength: 0,
      totalKeystrokes: 0,
      errors: 0,
      finished: false,
    });
  },
});

/** Host-only. Transitions waiting -> countdown and schedules `beginRace`. */
export const start = mutation({
  args: {
    roomId: v.id("rooms"),
    guestId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new ConvexError({ message: "Room not found", code: "NOT_FOUND" });
    }

    const currentGameId = room.currentGameId;
    if (!currentGameId) {
      throw new ConvexError({ message: "Room has no active game", code: "NOT_FOUND" });
    }

    const game = await ctx.db.get(currentGameId);
    if (!game) {
      throw new ConvexError({ message: "Game not found", code: "NOT_FOUND" });
    }
    if (game.hostId !== args.guestId) {
      throw new ConvexError({
        message: "Only the host can start the game",
        code: "UNAUTHORIZED",
      });
    }
    if (game.status !== "waiting") {
      throw new ConvexError({
        message: "Game is not in waiting state",
        code: "INVALID_STATE",
      });
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();

    if (players.length === 0) {
      throw new ConvexError({
        message: "Need at least one player to start",
        code: "INVALID_STATE",
      });
    }

    await ctx.db.patch(game._id, {
      status: "countdown",
      countdownStartedAt: Date.now(),
    });

    await ctx.scheduler.runAfter(COUNTDOWN_SECONDS * 1000, internal.games.beginRace, {
      gameId: game._id,
    });

    return null;
  },
});

/** Scheduled internal mutation. Transitions countdown -> running. */
export const beginRace = internalMutation({
  args: {
    gameId: v.id("games"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "countdown") return null;

    await ctx.db.patch(args.gameId, {
      status: "running",
      startedAt: Date.now(),
    });

    return null;
  },
});

/**
 * Syncs a player's typing progress. Called ~every 300ms by the owning client.
 * Each player writes only to their own document, avoiding OCC conflicts.
 */
export const updateProgress = mutation({
  args: {
    gameId: v.id("games"),
    guestId: v.string(),
    typedLength: v.number(),
    totalKeystrokes: v.number(),
    errors: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "running") return null;

    const player = await ctx.db
      .query("players")
      .withIndex("by_gameId_and_guestId", (q) =>
        q.eq("gameId", args.gameId).eq("guestId", args.guestId),
      )
      .unique();

    if (!player) return null;

    await ctx.db.patch(player._id, {
      typedLength: args.typedLength,
      totalKeystrokes: args.totalKeystrokes,
      errors: args.errors,
    });

    return null;
  },
});

/** Marks a player as finished. Schedules game end when all players finish. */
export const finishPlayer = mutation({
  args: {
    gameId: v.id("games"),
    guestId: v.string(),
  },
  handler: async (ctx, args) => {
    const player = await ctx.db
      .query("players")
      .withIndex("by_gameId_and_guestId", (q) =>
        q.eq("gameId", args.gameId).eq("guestId", args.guestId),
      )
      .unique();

    if (!player || player.finished) return null;

    await ctx.db.patch(player._id, {
      finished: true,
      finishedAt: Date.now(),
    });

    const allPlayers = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", args.gameId))
      .collect();

    const allFinished = allPlayers.every((p) => p.finished);

    if (allFinished) {
      await ctx.scheduler.runAfter(2500, internal.games.endGame, { gameId: args.gameId });
    }

    return null;
  },
});

/** Ends the game. Called when all players finish. */
export const endGame = internalMutation({
  args: {
    gameId: v.id("games"),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const game = await ctx.db.get(args.gameId);
    if (!game || game.status !== "running") return null;

    await ctx.db.patch(args.gameId, { status: "finished" });

    return null;
  },
});

/**
 * Checks if all non-exited players want to replay. If consensus is reached,
 * creates a new game in countdown state, copies players over with reset stats,
 * swings the room pointer, and schedules `beginRace`.
 */
async function checkReplayConsensus(
  ctx: MutationCtx,
  roomId: Id<"rooms">,
  gameId: Id<"games">,
  passage: string,
) {
  const players = await ctx.db
    .query("players")
    .withIndex("by_gameId", (q) => q.eq("gameId", gameId))
    .collect();

  const nonExited = players.filter((p) => p.vote !== "exit");
  if (nonExited.length === 0) return;

  const allWantReplay = nonExited.every((p) => p.vote === "replay");
  if (!allWantReplay) return;

  const room = await ctx.db.get(roomId);
  if (!room) return;

  const newGameId = await ctx.db.insert("games", {
    roomId,
    passage,
    status: "countdown" as const,
    hostId: room.hostId,
    duration: 30,
    countdownStartedAt: Date.now(),
  });

  for (const p of nonExited) {
    await ctx.db.insert("players", {
      gameId: newGameId,
      guestId: p.guestId,
      name: p.name,
      color: p.color,
      typedLength: 0,
      totalKeystrokes: 0,
      errors: 0,
      finished: false,
    });
  }

  await ctx.db.patch(roomId, { currentGameId: newGameId });

  await ctx.scheduler.runAfter(COUNTDOWN_SECONDS * 1000, internal.games.beginRace, {
    gameId: newGameId,
  });
}

/**
 * Cast a replay vote. Final — cannot be changed.
 * The passage for the next game is sent by the voter; the server uses
 * whichever voter's passage triggers consensus.
 */
export const voteReplay = mutation({
  args: {
    roomId: v.id("rooms"),
    guestId: v.string(),
    passage: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new ConvexError({ message: "Room not found", code: "NOT_FOUND" });
    }

    const currentGameId = room.currentGameId;
    if (!currentGameId) {
      throw new ConvexError({ message: "Room has no active game", code: "NOT_FOUND" });
    }

    const game = await ctx.db.get(currentGameId);
    if (!game || game.status !== "finished") {
      throw new ConvexError({
        message: "Game is not finished",
        code: "INVALID_STATE",
      });
    }

    const player = await ctx.db
      .query("players")
      .withIndex("by_gameId_and_guestId", (q) =>
        q.eq("gameId", game._id).eq("guestId", args.guestId),
      )
      .unique();

    if (!player) {
      throw new ConvexError({ message: "Player not found", code: "NOT_FOUND" });
    }
    if (player.vote) {
      throw new ConvexError({
        message: "Already voted",
        code: "DUPLICATE",
      });
    }

    await ctx.db.patch(player._id, { vote: "replay" });
    await checkReplayConsensus(ctx, args.roomId, game._id, args.passage);

    return null;
  },
});

/**
 * Cast an exit vote. Final — cannot be changed.
 * If only 1 (or 0) players remain after this exit, the room is deleted entirely.
 * Otherwise, the exit may tip replay consensus for the remaining players.
 */
export const voteExit = mutation({
  args: {
    roomId: v.id("rooms"),
    guestId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    const room = await ctx.db.get(args.roomId);
    if (!room) {
      throw new ConvexError({ message: "Room not found", code: "NOT_FOUND" });
    }

    const currentGameId = room.currentGameId;
    if (!currentGameId) {
      throw new ConvexError({ message: "Room has no active game", code: "NOT_FOUND" });
    }

    const game = await ctx.db.get(currentGameId);
    if (!game || game.status !== "finished") {
      throw new ConvexError({
        message: "Game is not finished",
        code: "INVALID_STATE",
      });
    }

    const player = await ctx.db
      .query("players")
      .withIndex("by_gameId_and_guestId", (q) =>
        q.eq("gameId", game._id).eq("guestId", args.guestId),
      )
      .unique();

    if (!player) {
      throw new ConvexError({ message: "Player not found", code: "NOT_FOUND" });
    }
    if (player.vote) {
      throw new ConvexError({
        message: "Already voted",
        code: "DUPLICATE",
      });
    }

    await ctx.db.patch(player._id, { vote: "exit" });

    const allPlayers = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", game._id))
      .collect();

    const nonExited = allPlayers.filter((p) => p.vote !== "exit");

    if (nonExited.length === 0) {
      await deleteRoom(ctx, args.roomId);
      return null;
    }

    await checkReplayConsensus(ctx, args.roomId, game._id, game.passage);

    return null;
  },
});

/** Deletes a room and all its games and players. */
async function deleteRoom(ctx: MutationCtx, roomId: Id<"rooms">) {
  const games = await ctx.db
    .query("games")
    .withIndex("by_roomId", (q) => q.eq("roomId", roomId))
    .collect();

  for (const g of games) {
    const players = await ctx.db
      .query("players")
      .withIndex("by_gameId", (q) => q.eq("gameId", g._id))
      .collect();

    for (const p of players) {
      await ctx.db.delete(p._id);
    }
    await ctx.db.delete(g._id);
  }

  await ctx.db.delete(roomId);
}
