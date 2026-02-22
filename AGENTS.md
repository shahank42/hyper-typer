# AGENTS.md - AI Agent Guidelines for `jsonic`

Welcome to the `jsonic` repository! This document outlines the architectural context, tooling commands, and code style guidelines for this project. As an AI agent working in this codebase, you must adhere strictly to these rules. This repository contains a high-performance, full-stack application built with React 19, TanStack Start, Convex, Tailwind CSS v4, and Radix UI (shadcn/ui).

---

## 1. Core Commands & Tooling

We use `bun` as the package manager and runtime. Do not use `npm` or `yarn`.

### Development & Build
- **Install Dependencies**: `bun install`
- **Start Dev Server**: `bun run dev` (Starts Vite and Convex concurrently)
- **Production Build**: `bun run build` (Runs Vite build and TypeScript compiler check)
- **Type Check**: `bun run dev:ts` (Runs `tsc` in watch mode)

### Linting & Formatting (Mandatory)
Always run these commands before finalizing your tasks to ensure adherence to CI/CD standards:
- **Lint**: `bun run lint:fix` (Uses `oxlint` to automatically fix issues)
- **Format**: `bun run format` (Uses `oxfmt` to format all files)

### Testing
Testing is configured to run via Vitest (as indicated by linter settings).
- **Run all tests**: `bun test` or `bunx vitest`
- **Run a single test**: `bun test <path/to/test.ts>` or `bunx vitest <path/to/test.ts>`
- **Test Locations**: Write unit tests alongside the implementation (e.g., `feature.test.ts` or `feature.spec.ts`).

**Example Test (`src/lib/utils.test.ts`):**
```typescript
import { describe, it, expect } from "vitest";
import { cn } from "./utils";

describe("cn utility", () => {
  it("merges tailwind classes correctly", () => {
    expect(cn("bg-red-500", "bg-blue-500")).toBe("bg-blue-500");
  });
});
```

---

## 2. Code Style & Syntax Guidelines

### TypeScript & Typing
- **Strict Mode**: The `tsconfig.json` has `strict: true`. Avoid using `any`; prefer `unknown` or strictly typed generics.
- **Type Imports**: `verbatimModuleSyntax` is enabled. You *must* use explicit type imports:
  ```typescript
  import type { RouteProps } from "@tanstack/react-router";
  // NOT: import { RouteProps } from "@tanstack/react-router";
  ```
- **Type Definitions**: Export types/interfaces for shared data models. Inline simple types.

### Imports & File Paths
- **Path Aliases**: Use the `~/` alias to refer to files inside the `src/` directory. Do not use relative paths `../../` unless strictly contained within a small sub-module.
- **Import Ordering**:
  ```typescript
  // 1. Framework & React
  import * as React from "react";
  import { useQuery } from "@tanstack/react-query";

  // 2. Third-party packages
  import { Search } from "lucide-react";
  import { clsx } from "clsx";

  // 3. Internal UI components & Hooks
  import { Button } from "~/components/ui/button";
  import { useDebounce } from "~/hooks/use-debounce";

  // 4. Internal utilities
  import { cn } from "~/lib/utils";
  ```

### Naming Conventions
- **React Components**: `PascalCase` (e.g., `UserProfile.tsx`).
- **Functions/Variables/Hooks**: `camelCase` (e.g., `fetchData`, `useUser`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `MAX_RETRY_COUNT`).
- **Directories/Files**: `kebab-case` (e.g., `src/components/ui`, `src/routes/user-profile.tsx`).

### Styling & UI
- **Tailwind CSS v4**: Use utility classes inline. Do not create separate `.css` files unless absolutely necessary for global styles.
- **Dynamic Classes**: Use the `cn()` utility located at `~/lib/utils.ts` (combines `clsx` and `tailwind-merge`) when applying conditional class names.
- **UI Components**: Check `src/components/ui/` before building primitive components (like Buttons, Inputs). We use shadcn/ui.

---

## 3. Framework-Specific Guidelines

### Frontend (TanStack Start & Router)
- **File-based Routing**: Routes are located in `src/routes/`. Do not manually edit `src/routeTree.gen.ts`.
- **State Management**: 
  - Prefer URL search parameters for shareable, global state using TanStack Router's `validateSearch` and `useSearch`.
  - Use `@tanstack/react-query` for asynchronous state management.
- **React 19**: Leverage React 19 hooks and paradigms (e.g., `use`, action states) where applicable. functional components only.

### Backend (Convex)
- **Directory**: All backend logic goes in the `convex/` directory.
- **Schemas**: Define strict schemas in `convex/schema.ts` using `defineSchema` and `defineTable`.
- **Validation**: Use Convex's `v` validator (`import { v } from "convex/values"`) for all arguments and return types in queries and mutations.
- **Queries vs. Mutations**:
  - `query`: Read-only, deterministic. Must not have side effects.
  - `mutation`: Writes to the database.
  - `action`: Use only for third-party API calls, Node.js specific libraries, or when you need side-effects.
- **Error Handling**: 
  - Throw `ConvexError` for expected, client-facing errors to ensure the client can read the error `data`. 
  - Use standard `try/catch` in actions.

**Example Convex Mutation (`convex/users.ts`):**
```typescript
import { mutation } from "./_generated/server";
import { v } from "convex/values";
import { ConvexError } from "convex/values";

export const createUser = mutation({
  args: { name: v.string(), email: v.string() },
  handler: async (ctx, args) => {
    const existing = await ctx.db.query("users").filter(q => q.eq(q.field("email"), args.email)).first();
    if (existing) {
      throw new ConvexError({ message: "Email already in use", code: "CONFLICT" });
    }
    return await ctx.db.insert("users", { name: args.name, email: args.email });
  },
});
```

---

## 4. AI Agent Instructions & Workflows

As an AI working in this codebase, follow this workflow:

1. **Understand First**: Use file reading and AST parsing tools to understand existing patterns before generating code. Mimic the surrounding style.
2. **Convex Skills**: When tasked with backend modifications, load the relevant `.agents/skills/` (e.g., `convex-functions`, `convex-best-practices`, `convex-schema-validator`) via your skill tools to ensure you are following the latest Convex paradigms.
3. **Check Dependencies**: Do not install new dependencies blindly. Check `package.json` to see if a similar library (e.g., `radix-ui` vs `headlessui`) is already installed.
4. **Iterative Verification**: After making changes, run formatting (`bun run format`) and linting (`bun run lint:fix`) before completing your task. If tests are requested, verify them using `bun test <file>` or `bunx vitest <file>`.
