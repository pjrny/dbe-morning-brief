# DBE Morning Brief (Cloudflare Pages + Worker)

Daily brief: 4 Productivity Game 1-pagers + life-sim, and a DBE research field tab.

## Deploy

```bash
npm i
npx wrangler login
npx wrangler pages project create dbe-morning-brief
npm run deploy
```

Pages Functions live in `functions/api/brief.js` → `GET /api/brief?date=YYYY-MM-DD`.

Date picker replays any past Morning Brief (deterministic seed).

## Tabs

1. **4-Page Life Sim** — four books for that date, source page numbers, article links, CSS animations, text simulator. One correctly applied page-rule still wins.
2. **DBE Research Field** — papers that support or challenge Dimensional Braid Engine claims, plus labs/GitHub/OCW.
