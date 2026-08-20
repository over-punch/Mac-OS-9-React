# Fonts

## What ships

One family, self-hosted: **Pixel Operator**, exposed to CSS as `Pixel` and
`PixelSmall`.

```
src/fonts/Pixel/
├── LICENSE.txt              CC0 1.0 Universal (public domain dedication)
├── Normal/  Pixel.woff2 · Pixel.woff · Pixel-Bold.woff2 · Pixel-Bold.woff
├── Italic/  Pixel-Italic.* · Pixel-Bold-Italic.*
└── Small/   Pixel-Small.* · Pixel-Bold-Small.*
```

| Font | Designer | License | Bundled |
|------|----------|---------|---------|
| Pixel Operator | Jayvee Enaguas (GGBotNet) | [CC0 1.0](./Pixel/LICENSE.txt) — public domain | Yes |
| IBM Plex Sans / Mono | IBM | SIL OFL 1.1 | No — opt-in via `/webfonts` |
| EB Garamond | Georg Duffner, Octavio Pardo | SIL OFL 1.1 | No — opt-in via `/webfonts` |

Pixel Operator is dedicated to the public domain under CC0, so it can be
redistributed inside this package with no attribution requirement. The licence
text travels with the files anyway, in `Pixel/LICENSE.txt`.

The library's own components only ever use the bundled family. IBM Plex and
EB Garamond are referenced by `--font-body`, `--font-title` and `--font-mono`
for consumers who want them, and are loaded only if you opt in.

## Weights

Pixel Operator ships two real weights, 400 and 700, in both roman and italic.
Every `--font-weight-*` token resolves to one of those, so the browser never
synthesises a weight. See the note in `src/styles/tokens.css` for why
`--font-weight-normal` is 700.

## How they load

`@font-face` declarations live in `src/styles/fonts.css`, which `theme.css`
imports. Consuming the default stylesheet gets them:

```ts
import '@liiift-studio/mac-os9-ui/styles';
```

`font-display: block` is deliberate — see the comment in `fonts.css`.

### Opting out

To supply your own faces and download nothing, import the tokens alone:

```ts
import '@liiift-studio/mac-os9-ui/tokens';
```

Then point `--font-system` and `--font-pixel` at whatever you host.

### Opting in to the web fonts

```ts
import '@liiift-studio/mac-os9-ui/styles';
import '@liiift-studio/mac-os9-ui/webfonts';
```

This makes a request to `fonts.googleapis.com`. Under a strict CSP you will
need:

```
style-src  'self' https://fonts.googleapis.com;
font-src   'self' https://fonts.gstatic.com;
```

Self-hosting those two families instead is recommended for production.

## Raw files

The font files are published, so you can reference them directly:

```
@liiift-studio/mac-os9-ui/fonts/Pixel/Normal/Pixel.woff2
```
