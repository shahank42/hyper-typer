import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  todos: defineTable({
    text: v.string(),
    completed: v.boolean(),
  }).index("by_completed", ["completed"]),

  /**
   * A room is the stable URL target (`/room/<roomId>`) that survives replays.
   * `currentGameId` is optional to break the circular insert dependency with `games`.
   */
  rooms: defineTable({
    hostId: v.string(),
    currentGameId: v.optional(v.id("games")),
  }),

  /** A single typing game within a room. Status drives the entire UI lifecycle. */
  games: defineTable({
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
  }).index("by_roomId", ["roomId"]),

  /** Each player document belongs to one game. One document per player per game. */
  players: defineTable({
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
  })
    .index("by_gameId", ["gameId"])
    .index("by_gameId_and_guestId", ["gameId", "guestId"]),
});
