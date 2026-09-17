# CLAUDE.md — iuno.lol Guidelines

## Tech Stack
- **Framework**: Next.js 15 (App Router, Server Actions, Route Handlers)
- **Database**: MySQL via Drizzle ORM (`src/lib/db/schema.ts`)
- **Cache**: Redis (`src/lib/redis.ts`) for view counts and live profile feedback
- **Styling**: Tailwind CSS, Framer Motion
- **Icons / Assets**: Inline SVG icons (24x24 viewBox, stroke 1.5–2), Discord emoji CDN

## Core Commands
```bash
npm run dev           # Start Next.js development server
npm run build         # Build production bundle
npx tsc --noEmit      # Full TypeScript typecheck (run after every change)
npm run lint          # Run ESLint check
```

## Design System & UI Rules
- **Cards**: `bg-[#0c0c0c] border border-white/5 rounded-[20px] p-6 shadow-sm`
- **Inputs & Dropdowns**: `bg-[#161616] border border-white/5 rounded-xl h-10 px-3.5 text-[13px] text-white`
- **Typography**: Header text should be clean and light (`text-[14px] font-normal text-white/90 tracking-tight`). Avoid bold weights on section headers.
- **Accents**: Primary `#5b6cf5`. Buttons use `bg-[#5b6cf5]/20 hover:bg-[#5b6cf5]/30 text-white font-normal rounded-xl` or neutral dark glass `bg-white/[0.06] border border-white/10`.
- **Glows**: Avoid harsh neon box-shadows unless explicitly requested.

## Architecture & Layout Customization
- **Preview Panel Sync**: All customize pages (`/dashboard/customize/profile/*`) must:
  1. Render `DashboardProfilePreview` with `overrides` from `useCustomizeProfile()`.
  2. Set right-padding on the settings container: `pr-[calc(var(--preview-width,380px)+2rem)]`.
  3. Include `SaveBar` wired to `hasChanges` and `clearOverrides`.
- **Modular Entry Transitions**: Located in `src/components/profile/layouts/entry-transitions/`.
  - Export modular effect components (`FadeTransition`, `CurtainTransition`, `IrisTransition`, `BlurDissolveTransition`, `FadeBlackTransition`).
  - Calculate dynamic overlay tint via `getBlurOverlayOpacity(blur)` from `utils.ts`.
- **Markdown & Emoji Parser**: Use `parseInlineFormatting` in `src/components/profile/layouts/entry-transitions/parseInlineFormatting.tsx` for Markdown (`**`, `*`, `__`, `~~`) and animated/static Discord emojis (`<a:name:id>`, `<:name:id>`).

## Data Flow & Cache Invalidation
- **Profile Stats (Likes/Dislikes/Views)**:
  - Updates in Server Actions (`src/actions/feedback.ts`, `src/actions/profile.ts`) MUST:
    1. Update MySQL rows via Drizzle ORM transactions with row locks where appropriate (`.for("update")`).
    2. Invalidate Redis live cache: `await invalidateLiveStatsCache(userId)`.
    3. Trigger Next.js ISR revalidation: `revalidatePath('/<username>')`.
- **Client Live Hydration**: Public profile pages (`/[username]`) use ISR (30-day window); viewer-specific state (signed-in ID, previous feedback) is fetched client-side via `/api/profile/me` and live stats via `/api/profile/live`.

## Subagents (`.claude/agents/`)
- `ui-designer`: Builds dashboard customization sections, UI components, and preview integrations.
- `code-reviewer`: Audits security, rate limits, Drizzle transactions, cache invalidation, and TypeScript.
