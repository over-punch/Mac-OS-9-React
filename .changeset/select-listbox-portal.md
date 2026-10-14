---
'@overpunch/mac-os9-ui': patch
---

`Select` now portals its listbox to `<body>`, so it opens beside its trigger
inside transformed, filtered or contained ancestors.

The listbox is placed with `position: fixed` and coordinates measured against
the viewport. Any ancestor with `transform`, `filter`, `will-change`,
`contain` or `perspective` becomes the containing block for fixed elements,
which re-based those coordinates and opened the list far from its button. On
`<body>` it is always measured against the viewport, and the flip and shift
from `useMenuPosition` keep working.

The listbox now sets its own font family, weight, colour and size (following
the `size` prop) because it no longer inherits them from the wrapper. A
`classes.listbox` that relied on inherited page typography should set it
directly.
