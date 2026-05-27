# Panel Review — Project Specialists

Saved: 2026-05-27

## Specialists
1. Design Systems Engineer — detected: src/tokens/index.ts, src/styles/theme.css with 200+ CSS variables, token-driven theming
2. Deep Accessibility Specialist — detected: WCAG 2.1 AA stated goal, ARIA attributes throughout components, focus management as design principle
3. Font / Variable Font Engineer — detected: base64-inlined pixel fonts in dist/index.css, @font-face declarations, prior font-bundling fix
4. Browser Layout Engineer — detected: Window drag/resize with offsetParent calculations, document-level mousemove listeners, position tracking relative to coordinate systems
5. React Library API Engineer — detected: dual ESM/CJS exports, peer-dep constraints for React 18+19, render props, controlled/uncontrolled patterns, public package surface

## Known intentional patterns
<!-- Populated automatically after each review session -->

## Past review sessions

### 2026-05-27 — Findings + issues, no auto-fix
- 15 reviewers ran in parallel (10 core + 5 specialists)
- ~180 raw findings consolidated to 124 distinct
- Severity: 20 Critical, 70 Major, 34 Minor
- All 124 opened as GitHub issues #1–#124 in Liiift-Studio/Mac-OS-9-React with label `review`
- No fixes attempted (per user selection)
- Results report: `.agent/tmp/panel-review-results.json`
- Notable thematic clusters:
  - Dialog focus/modal correctness (issues #1–#7, #28–#31)
  - Window drag/resize correctness, mobile support, accessibility (#9–#12, #21–#27, #54–#57)
  - MenuBar / Menu accessibility + keyboard nav (#15, #32–#37)
  - Test coverage gap — 16 of 17 components untested (#77–#79)
  - Token system: TS/CSS drift, missing semantic layer, no theme provider (#17, #58–#62)
  - Build pipeline: dual font shipment, source maps published, stale `tsup` references (#63, #71–#74)
  - Docs stale: `progress.md` v0.0.0, README MenuBar example won't compile, WCAG claim unaudited (#19, #20, #80–#82)
