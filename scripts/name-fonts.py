#!/usr/bin/env python3
"""Normalise the name tables of the bundled Pixel OTFs.

The `.otf` files are the desktop sources — they are not published, but they
are what a designer installs to work on the Figma kit, and their name tables
disagreed with how the family is exposed everywhere else:

    Pixel-Small.otf        family 'Pixel '        <- trailing space
    Pixel-Italic.otf       family 'Pixel Italic'  <- a family of its own
    Pixel-Bold-Small.otf   style  'Bold Small'    <- not a real style name

Installed as-is, macOS and Figma showed three separate families and could not
style-link any of them, so the kit fell back to a stand-in typeface.

The CSS in `src/styles/fonts.css` exposes exactly two families, `Pixel` and
`PixelSmall`, each with plain RIBBI styles. This makes the desktop fonts agree
with that. Run after changing the source fonts:

    python3 scripts/name-fonts.py

It rewrites the `.otf` files in place and leaves the web fonts alone: a
`@font-face` rule names its own family, so the internal names never mattered
there.
"""

import sys
from pathlib import Path

from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent
FONT_DIR = ROOT / 'src' / 'fonts' / 'Pixel'

# filename -> (family, style). Only the four RIBBI styles are used, because
# those are the ones macOS and Figma will style-link into a single menu entry.
FACES = {
	'Normal/Pixel.otf': ('Pixel', 'Regular'),
	'Normal/Pixel-Bold.otf': ('Pixel', 'Bold'),
	'Italic/Pixel-Italic.otf': ('Pixel', 'Italic'),
	'Italic/Pixel-Bold-Italic.otf': ('Pixel', 'Bold Italic'),
	'Small/Pixel-Small.otf': ('PixelSmall', 'Regular'),
	'Small/Pixel-Bold-Small.otf': ('PixelSmall', 'Bold'),
}

# OS/2 fsSelection bits.
FS_ITALIC = 1 << 0
FS_BOLD = 1 << 5
FS_REGULAR = 1 << 6

# head.macStyle bits.
MAC_BOLD = 1 << 0
MAC_ITALIC = 1 << 1

# Name IDs this script owns. 16/17 are the typographic family and subfamily:
# they exist to describe families too large for the four RIBBI slots, and
# setting them here would just contradict 1/2, so they are removed.
FAMILY, SUBFAMILY, UNIQUE, FULL, POSTSCRIPT = 1, 2, 3, 4, 6
TYPOGRAPHIC = (16, 17)


def postscript_name(family: str, style: str) -> str:
	"""PostScript names carry no spaces and must be unique per face."""
	suffix = style.replace(' ', '')
	return f'{family}-{suffix}'


def apply(path: Path, family: str, style: str) -> str:
	font = TTFont(path)
	name = font['name']

	bold = 'Bold' in style
	italic = 'Italic' in style
	full = family if style == 'Regular' else f'{family} {style}'
	ps = postscript_name(family, style)

	for record in list(name.names):
		if record.nameID in TYPOGRAPHIC:
			name.names.remove(record)

	for name_id, value in (
		(FAMILY, family),
		(SUBFAMILY, style),
		(FULL, full),
		(POSTSCRIPT, ps),
		(UNIQUE, f'{ps}; Pixel Operator'),
	):
		# Set on every platform the file already carries, so a Windows-only
		# reader and a Mac-only reader cannot disagree about the name.
		name.setName(value, name_id, 3, 1, 0x409)
		name.setName(value, name_id, 1, 0, 0)

	# The style bits have to agree with the names, or an application will
	# synthesise a bold that the file already contains.
	os2 = font['OS/2']
	selection = os2.fsSelection & ~(FS_ITALIC | FS_BOLD | FS_REGULAR)
	if bold:
		selection |= FS_BOLD
	if italic:
		selection |= FS_ITALIC
	if not bold and not italic:
		selection |= FS_REGULAR
	os2.fsSelection = selection

	head = font['head']
	mac = head.macStyle & ~(MAC_BOLD | MAC_ITALIC)
	if bold:
		mac |= MAC_BOLD
	if italic:
		mac |= MAC_ITALIC
	head.macStyle = mac

	font.save(path)
	font.close()
	return f'{path.name:24} -> {family} / {style}'


def main() -> int:
	if not FONT_DIR.is_dir():
		print(f'No font directory at {FONT_DIR}', file=sys.stderr)
		return 1

	for relative, (family, style) in FACES.items():
		path = FONT_DIR / relative
		if not path.is_file():
			print(f'Missing {path}', file=sys.stderr)
			return 1
		print(apply(path, family, style))

	return 0


if __name__ == '__main__':
	raise SystemExit(main())
