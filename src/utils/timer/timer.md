# Task: Console Timer Utility with Colorized Output

## Goal

Implement a TypeScript utility modeled after `console.time()` that provides human-readable timing measurements (like Vitest's `formatTime`), with strict linting support, ANSI color coding, and JSON output support.

---

## Requirements

### General

- Must be **ESM only** (no CommonJS).
- Must use **no external logging library** — only native `console` and ANSI escape codes.
- Must auto-detect whether running in a TTY:
  - **If TTY** → colors enabled by default.
  - **If not TTY** (e.g. Jenkins, redirected logs) → colors disabled by default.
  - Manual override possible via `.configure({ colors: true/false })`.

### Core API

- `.start(label: string)`:  
  Starts a timer for the given `label`. Prints a start message:

  - Default: `○ build: starting`
  - JSON mode: structured object with `event: "start"`.

- `.lapse(label: string)`:  
  Returns elapsed time since `.start()`, without clearing the timer. Prints a message prefixed with `⋯`.

  - Default: `⋯ build: lapse 250ms`
  - JSON mode: structured object with event, ms, formatted time, status, and timestamp.

- `.end(label: string)`:  
  Returns elapsed time since `.start()` and clears the timer. Prints a message prefixed with `✓`.
  - Default: `✓ build: complete 1.45s`
  - JSON mode: structured object with event, ms, formatted time, status, and timestamp.

---

### Formatting

- Use a `formatTime(ms: number): string` helper, compatible with Vitest style:
  - `<1000ms` → `"123ms"`
  - `<60s` → `"1.23s"`
  - `>=60s` → `"2m 15s"`

### Coloring

- Configurable thresholds:
  - `< 1s` → green
  - `1s ≤ t < 3s` → yellow
  - `≥ 3s` → red
- Style rule:
  - Numeric part bright (green/yellow/red).
  - Unit dimmed in the same color.
- Special prefixes:
  - `○` pink (start)
  - `⋯` blue (lapse)
  - `✓` bright green (end)

### Configuration

- `configure(options)` accepts:
  - `thresholds?: { green: number; yellow: number }`
  - `json?: boolean` (default `false`)
  - `colors?: boolean` (default auto-detected from TTY)
  - `messages?: { start: string; lapse: string; end: string }`

### Output

- In string mode: plain console.log strings with optional ANSI colors.
- In JSON mode: structured objects printed for **all events**:
  ```json
  {
    "label": "build",
    "ms": 245,
    "formatted": "245ms",
    "status": "green",
    "event": "lapse",
    "timestamp": "2025-09-18T20:10:12.590Z"
  }
  ```
