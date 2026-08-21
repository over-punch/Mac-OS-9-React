---
'@liiift-studio/mac-os9-ui': minor
---

Rebuild Select as a real listbox, make ListView keyboard operable, and add a
window manager.

**Breaking**

- `Select` no longer renders a native `<select>`. It is a button plus a
  `role="listbox"` popup, so the whole control is themeable — previously the
  open option list was drawn by the operating system. `onChange` is replaced by
  `onValueChange`, which receives the value rather than a DOM event and is
  generic over it. Option groups move from `<optgroup>` to a `group` field on
  each option. A hidden input preserves native form submission and `FormData`.
- `ListView` rows are now listbox options. If you were spreading
  `RowDefaultProps` onto a custom element via `renderRow`, it now carries
  `role`, `aria-selected`, `tabIndex`, `onKeyDown` and `id` as well.
- `Button` no longer sets `aria-disabled` on its `<button>` branch; the native
  `disabled` attribute is authoritative there. The anchor and `asChild`
  branches still set it.

**Added**

- `WindowManagerProvider` coordinates z-order across several windows: they
  raise on interaction and resolve `active` to "topmost in the stack".
- `Select` and `Tabs` are generic over the option value and tab id.
- `useOutsideClick` and `useMenuPosition` are exported.
- `ListView` gains `ariaLabel` / `ariaLabelledBy` and full keyboard navigation:
  arrow keys, Home/End, Shift-extend, Enter to open, Space to select.
- The icon registry helpers — `getAllIconNames`, `getIcon`, `hasIcon`,
  `iconRegistry`, `createPixelIcon` — are exported from the package root.

**Fixed**

- `ListView` was pointer-only, a WCAG 2.1.1 Level A failure. Rows and sortable
  headers are now keyboard operable.
- `RadioGroup` declared `aria-orientation` but applied no layout, so its radios
  ran together inline and `orientation` had no visible effect.
- The bundled Pixel Operator licence is published alongside the font files. It
  was lost when the font directory was renamed, so the package had been
  redistributing the typeface with no licence.
- 16 of the 21 documented per-component CSS custom properties were not read by
  any component. They are all wired now, with defaults that preserve the
  current appearance.
