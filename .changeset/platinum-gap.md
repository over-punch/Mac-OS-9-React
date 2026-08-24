---
'@liiift-studio/mac-os9-ui': minor
---

Close the remaining gap against Apple's Mac OS 8/9 Control Guidelines: nine new
controls, and one correction to `Window`.

Measured against chapter 2 of Apple's own Human Interface Guidelines — the list
the Platinum appearance was actually built from — the library covered 13 of its
24 controls. It now covers all of them.

**New:** `GroupBox`, `WindowHeader`, `Slider`, `LittleArrows`, `Placard`,
`ImageWell`, `ChasingArrows`, `BevelButton`, `ClockControl`.

A few of these are more opinionated than their names suggest:

- **`GroupBox`** is a real `fieldset`/`legend`, which is what gets the grouping
  to assistive technology; a `div` with a heading looks the same and announces
  nothing. A disabled group deliberately does not disable its own fieldset — a
  checkbox title is how you switch the group back on.
- **`Slider`** treats tick marks as behaviour rather than decoration. A ticked
  slider snaps to its ticks, and its thumb is pointed rather than rounded to
  say so.
- **`Placard`** renders a `span` until you give it an `onClick`. A readout
  rendered as a button takes Tab focus, invites a press and does nothing.
- **`ImageWell`** is a button first and a drop target second, because a
  drop-only well is unusable by keyboard and by anyone who cannot drag.
- **`ChasingArrows`** claims no progress value and renders nothing when
  inactive. Under `prefers-reduced-motion` it pulses rather than freezing: the
  animation is the control, and a still spinner reads as stalled work.
- **`BevelButton`**'s `behaviour` prop picks its semantics, so a radio
  announces as a radio rather than as a button that looks pressed. For a plain
  push button with an icon, `IconButton` remains the smaller thing.

**`Window` gains `onCollapse` and `onZoom`.** `onMinimize` and `onMaximize`
still work and are deprecated for removal in 3.0. Mac OS 9 had no dock and no
taskbar, so nothing was ever minimised: the collapse box rolled a window into
its own title bar, and the zoom box fitted it to its contents. The buttons had
been announcing "Minimize" and "Maximize" to screen readers for behaviour the
system never had.
