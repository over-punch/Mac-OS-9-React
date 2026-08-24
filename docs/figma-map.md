# Figma design map — the source kit

This maps the **community Mac OS 9 UI Kit by Michael Feeney**, which is what
this library was originally built from. It is a reference for where a value
came from, not a description of anything this project maintains.

File: `vy2T5MCXFz7QWf4Ba86eqN` ([on Figma Community](https://www.figma.com/design/vy2T5MCXFz7QWf4Ba86eqN/Mac-OS-9--UI-Kit--Community-),
CC BY 4.0). Read from that file on 2026-01-08.

> **This is not the project's own kit.** There is a separate, private Figma
> library generated from this codebase — three-tier variables, component pages
> with variants, and effect and text styles, all bound rather than hardcoded.
> It is not linked here because it is a private file; ask the maintainer for
> access.
>
> Where the two disagree, **the code is the source of truth.** Tokens live in
> `src/styles/tokens.css`, and the component behaviour follows Apple's
> [Control Guidelines](https://dev.os9.ca/techpubs/mac/HIGOS8Guide/thig-9.html)
> rather than this file — see [Where this comes from](../README.md#where-this-comes-from).

---

## Pages Structure

1. **macOS 9 — Cover** (`417:173757`) - Cover/introduction page
2. **macOS 9 — Library** (`0:1`) - Component library (PRIMARY SOURCE)
3. **macOS 9 — Examples** (`45:184468`) - Example implementations

---

## Design Tokens Extracted

### Colors

#### Grayscale Palette

- **Gray 100 / White** (`18:47`): `rgb(255, 255, 255)` - #FFFFFF
- **Gray 200** (`19:2507`): `rgb(238, 238, 238)` - #EEEEEE (Base UI background)
- **Gray 300** (`18:60`): Not specified in visible components
- **Gray 400** (`18:1970`): Not specified in visible components
- **Gray 500** (`20:7306`): Not specified in visible components
- **Gray 600** (`18:52`): Not specified in visible components
- **Gray 700** (`18:46`): Not specified in visible components
- **Gray 800** (`45:184845`): Not specified in visible components
- **Gray 900 / Black** (`18:48`): `rgb(38, 38, 38)` - #262626 (Strokes, borders, text)

#### Accent Colors

- **Lavender** (`60:134029`): `rgb(204, 204, 255)` - #CCCCFF (Cover background)
- **Azul** (`49:36229`): Not visible in extracted data
- **Link Red** (`102:398`, `102:3935`): Not visible in extracted data

### Typography

#### Text Styles

1. **Headlines** (`18:5`)
   - Font: Apple Garamond Light
   - Size: 224px
   - Letter spacing: -4.48px
   - Line height: 256.256px (100% intrinsic)

2. **Editorial Headlines** (`20:110322`)
   - Font: Apple Garamond Light
   - (Same specs as Headlines)

3. **Body Text** (`18:6`)
   - Not extracted with specific values

4. **Small Headlines** (`50:12406`)
   - Not extracted with specific values

5. **Small Body Text** (`96:2306`)
   - Not extracted with specific values

### Effects / Shadows

#### Window Shadow (`67:95038`)

Three-layer bevel effect:

1. **DROP_SHADOW**
   - Color: `rgba(38, 38, 38, 1.0)`
   - Offset: `x: 2px, y: 2px`
   - Radius: `0px`
   - Show behind node: `true`

2. **INNER_SHADOW** (Highlight)
   - Color: `rgba(255, 255, 255, 0.6)`
   - Offset: `x: 2px, y: 2px`
   - Radius: `0px`

3. **INNER_SHADOW** (Shadow)
   - Color: `rgba(38, 38, 38, 0.4)`
   - Offset: `x: -2px, y: -2px`
   - Radius: `0px`

#### Control Shadow (`127:14`)

- Not extracted with specific values

#### Icon Shadow (`127:103`)

- Not extracted with specific values

### Base Component Properties

All components in the Library share these consistent properties:

- **Background fill**: Gray 200 (`#EEEEEE`)
- **Stroke**: 1px solid Gray 900 (`#262626`)
- **Stroke align**: Inside
- **Effects**: Window Shadow (3-layer bevel)

---

## Component Inventory (macOS 9 — Library)

### Interactive Controls

#### 1. Buttons (`68:101077`)

- **Location**: x: 1840, y: -1
- **Size**: 298w × 490h
- **Contains**: Multiple button variants and states
- **Node ID**: `68:101077`

#### 2. Checkbox (`68:110082`)

- **Location**: x: 2168, y: -1
- **Size**: 298w × 175h
- **Node ID**: `68:110082`

#### 3. Radio Button (`68:111221`)

- **Location**: x: 2168, y: 204
- **Size**: 298w × 180h
- **Node ID**: `68:111221`

#### 4. Chevron (`68:122573`)

- **Location**: x: 1840, y: 521
- **Size**: 298w × 216h
- **Node ID**: `68:122573`

#### 5. Text Field (`68:128028`)

- **Location**: x: 2496, y: 488
- **Size**: 242w × 249h
- **Node ID**: `68:128028`

#### 6. Slider (`69:113985`)

- **Location**: x: 2768, y: 488
- **Size**: 270w × 249h
- **Node ID**: `69:113985`

#### 7. Progress Bar (`68:103634`)

- **Location**: x: 2168, y: 414
- **Size**: 298w × 323h
- **Node ID**: `68:103634`

### Dropdowns & Menus

#### 8. Dropdown (`69:110626`)

- **Location**: x: 4099, y: 767
- **Size**: 1001w × 738h
- **Node ID**: `69:110626`

#### 9. Dropdown Menu (`69:105642`)

- **Location**: x: 4099, y: -1
- **Size**: 1001w × 738h
- **Node ID**: `69:105642`

#### 10. Menu Bar (`68:129309`)

- **Location**: x: 3068, y: 488
- **Size**: 1001w × 249h
- **Node ID**: `68:129309`

### Navigation & Layout

#### 11. Tabs (`68:99467`)

- **Location**: x: 2496, y: -1
- **Size**: 542w × 459h
- **Node ID**: `68:99467`

#### 12. Navigation Button (`69:116209`)

- **Location**: x: 5130, y: 767
- **Size**: 423w × 218h
- **Node ID**: `69:116209`

### Windows & Containers

#### 13. Window (`69:130300`)

- **Location**: x: 7062, y: -1
- **Size**: 612w × 1506h
- **Node ID**: `69:130300`

#### 14. Window Frame (`68:97933`)

- **Location**: x: 5130, y: 1015
- **Size**: 423w × 490h
- **Node ID**: `68:97933`

#### 15. Title Bar (`68:98697`)

- **Location**: x: 5130, y: -1
- **Size**: 1167w × 738h
- **Node ID**: `68:98697`

#### 16. Scrollbar (`69:125817`)

- **Location**: x: 6327, y: 767
- **Size**: 705w × 738h
- **Node ID**: `69:125817`

### List Views

#### 17. List Items (`68:130074`)

- **Location**: x: 1840, y: 767
- **Size**: 2229w × 738h
- **Node ID**: `68:130074`

#### 18. Folder List (`69:117834`)

- **Location**: x: 6327, y: -1
- **Size**: 705w × 738h
- **Node ID**: `69:117834`

#### 19. Folder Tag (`69:117027`)

- **Location**: x: 5583, y: 1124
- **Size**: 714w × 381h
- **Node ID**: `69:117027`

#### 20. Column List Header (`69:115439`)

- **Location**: x: 5583, y: 767
- **Size**: 714w × 327h
- **Node ID**: `69:115439`

### System Elements

#### 21. Control Strip (`68:120833`)

- **Location**: x: 3068, y: -1
- **Size**: 1001w × 459h
- **Node ID**: `68:120833`

### Assets

#### 22. Icons (`68:94653`)

- **Location**: x: 984, y: -1
- **Size**: 644w × 1400h
- **Node ID**: `68:94653`

#### 23. Wallpapers (`68:94977`)

- **Location**: x: 410, y: 1449
- **Size**: 1218w × 2961h
- **Node ID**: `68:94977`

#### 24. Halftone Textures (`73:914`)

- **Location**: x: 410, y: 583
- **Size**: 544w × 816h
- **Node ID**: `73:914`

### Style References

#### 25. Text Styles (`67:94132`)

- **Location**: x: 410, y: -1
- **Size**: 257w × 556h
- **Node ID**: `67:94132`

#### 26. Colours (`67:95057`)

- **Location**: x: 697, y: -1
- **Size**: 257w × 556h
- **Node ID**: `67:95057`

---

## Examples (macOS 9 — Examples)

1. **Boot Loader** (`417:173754`) - x: -4354, y: 513, 4228w × 768h
2. **Open Calculator** (`82:813`) - x: 585, y: -385, 3220w × 768h
3. **Change Wallpaper** (`82:812`) - x: 585, y: 513, 4318w × 768h
4. **Change View** (`82:811`) - x: 585, y: 1411, 3220w × 768h
5. **Shut Down** (`417:173753`) - x: 5720, y: 513, 1024w × 768h
6. **Arrows** (`417:173755`) - Navigation indicators

---

## Key Design Patterns

### Bevel Effect Pattern

All interactive components use a consistent 3-layer bevel:

1. Hard drop shadow (2px, 2px, 0 blur) - creates depth
2. Light inner shadow (2px, 2px, 0 blur, 60% white) - top-left highlight
3. Dark inner shadow (-2px, -2px, 0 blur, 40% black) - bottom-right shadow

This creates the classic "pressed button" 3D effect of Mac OS 9.

### Stroke Pattern

- **Width**: Always 1px
- **Color**: Always Gray 900 (#262626)
- **Position**: Inside (doesn't affect outer dimensions)

### Spacing & Measurements

- **Minimum touch target**: Observed buttons are ~30px+ in height
- **Border radius**: None - all components use sharp 90° corners
- **Component padding**: Typically 2-4px based on bevel insets

---

## Component Variants to Implement

### Priority 1 (Core Controls)

1. **Button**: Default, Hover, Active, Disabled, Focus
2. **Checkbox**: Unchecked, Checked, Indeterminate, Disabled
3. **Radio**: Unselected, Selected, Disabled
4. **TextField**: Empty, Filled, Focus, Disabled, Error

### Priority 2 (Navigation)

5. **Select/Dropdown**: Closed, Open, Disabled
6. **Tabs**: Default, Active, Hover, Disabled
7. **MenuBar**: Default, Open, Item hover
8. **MenuItem**: Default, Hover, Disabled, Separator

### Priority 3 (Containers)

9. **Window**: Default, Active, Inactive
10. **TitleBar**: Active, Inactive, with controls
11. **Dialog/Modal**: Default variants
12. **Scrollbar**: Vertical, Horizontal, Handle

---

## Next Steps

1. ✅ Extract design tokens from Figma file
2. ✅ Document component inventory
3. ⏭️ Implement refined design tokens in code
4. ⏭️ Create detailed component specifications
5. ⏭️ Begin component implementation with Button
