---
'@overpunch/mac-os9-ui': patch
---

Opening a `Select` no longer scrolls the page to the bottom.

2.6.1 portalled the listbox to `<body>`. On its first render, before
`useMenuPosition` had measured it, the listbox sat in normal flow at the end
of the document, and the effect that keeps the active option visible called
`scrollIntoView`, which scrolls every ancestor including the window. The
active option is now kept visible by scrolling the listbox alone, and the
listbox is `position: fixed` at the viewport origin until it is measured.
