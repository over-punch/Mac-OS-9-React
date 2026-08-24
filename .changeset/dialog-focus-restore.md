---
'@liiift-studio/mac-os9-ui': patch
---

Fix `Dialog` dropping focus to `<body>` on close instead of returning it to the
element that opened it.

The element to restore to was captured in a passive effect. React runs every
layout effect before any passive effect, so `initialFocus` had already moved
focus into the dialog by the time the capture ran — what got saved was the
dialog's own button, which is detached once the dialog closes. The
`isConnected` guard then correctly declined to focus a detached node, and focus
fell to `<body>`.

For a keyboard or screen-reader user this meant closing any dialog dropped them
at the top of the document with no way back to where they were. It affected
every `Dialog`, and so also `Alert`, which builds on it.

The capture now runs in a layout effect declared before the one that moves
focus. Two tests cover it — one for the default case and one for an explicit
`initialFocus`, which is the path that made the ordering matter.
