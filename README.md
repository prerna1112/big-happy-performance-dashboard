# Big Happy Performance Dashboard

A responsive React and TypeScript implementation of the supplied Big Happy dashboard and Performance Analytics assessment. The application uses the bundled `sample-data.json`; the supplied recording is treated as a visual and interaction reference.

Live demo: [big-happy-performance-dashboard.vercel.app](https://big-happy-performance-dashboard.vercel.app)

## Prerequisites

- Node.js 22.13 or newer
- npm 10 or newer

No environment variables or external services are required.

## Install and run

From the project directory:

```bash
npm ci
npm start
```

Open [http://127.0.0.1:4173](http://127.0.0.1:4173) in a browser.

> Do not double-click the root `index.html` or open it with a `file://` URL. It is a Vite source entry and will appear blank unless the development server is running.

For development without automatically opening a browser, use `npm run dev`.

## Production build

```bash
npm run build
npm run preview
```

The optimized build is written to `dist/`. The preview is served at `http://127.0.0.1:4173`.

## Quality checks

```bash
npm test
npm run lint
npm run format:check
npm run build
```

The 25 unit and component tests cover analytics aggregation, weighted metrics, grouping and date boundaries, trends, formatting/CSV behavior, filter-to-chart integration, metric empty states, popover focus restoration, date validation, accessible chart tables, direct range handles, clipboard fallback, budget disclosures, KPI-summary collapse behavior, zoom/reset state, modal and expanded-chart Escape/focus restoration, editing, and skip-link focus. ESLint uses type-aware TypeScript rules, including a ban on unsafe `any` usage.

## Implemented functionality

- Fixed global header, notification panel, profile control, and collapsible desktop/mobile navigation
- Deal header with status controls, actions, editable deal details, copy feedback, and the demo-matched KPI summary collapse
- Responsive impression, performance, campaign-delivery, IO-budget, and deal-budget cards
- All five supplied filter dimensions: packages, placements, targeting, creative, and product/format
- Searchable multi-select filters and metric selector grouped by Big Happy and third-party data
- Date range and day/week/month/quarter/weekday groupings
- Mixed bar and line chart with count, percentage, and currency axes
- Derived CTR plus impression-weighted VCR and time-spent aggregation
- Hover details with multi-metric entity breakdown, accessible dual-handle range selection, zoom controls, and reset
- Empty states, responsive expanded chart mode, and CSV export
- Keyboard focus styles, semantic landmarks, labels, ARIA state, escape/outside-click dismissal, reduced-motion support, and native dialog behavior

## Data behavior

`src/data/sample-data.json` is the single analytics source. Its package, placement, creative, targeting, and format arrays represent alternative breakdowns of the same campaign data. The UI therefore switches between those dimensions instead of summing different dimensions together, which would double-count campaign activity.

Count and currency metrics are summed. CTR is recalculated from total clicks divided by total impressions. VCR and time spent are weighted by impressions. Date filters are inclusive.

The supplied JSON does not include deal metadata targets. The contracted-impression target and IO/deal budgets shown in the reference are therefore isolated as named `referenceTargets` in `SummaryCards.tsx`, rather than presented as sample-data fields. The IO delivered value uses `ssp_spend`; the reference's deal-delivery value is reproduced from the supplied revenue series.

## Project structure

```text
src/
  assets/       Supplied Big Happy and PARK brand assets
  components/   Analytics, dashboard, and shared layout components
  data/         Supplied JSON, normalization, and UI configuration
  hooks/        Analytics reducer and dismissible-layer behavior
  test/         Shared browser-test setup
  types/        Domain types and strict metric unions
  utils/        Pure aggregation, formatting, and CSV helpers
```

## Submission packaging

The assessment ZIP should include the source, configuration, lockfile, README, and Git folder structure. It must not include `node_modules`, `dist`, coverage output, or online repository links. A ready-to-submit ZIP is generated alongside the project after verification.
