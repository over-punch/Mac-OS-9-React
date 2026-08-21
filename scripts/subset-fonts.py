#!/usr/bin/env python3
"""Split the bundled Pixel faces into latin and latin-ext subsets.

The family covers 238 code points, but the overwhelming majority of pages
using it are plain ASCII. Shipping one file per face meant every visitor
downloaded the accented characters, the currency symbols and the typographic
punctuation whether or not the page contained any (issue #107).

Splitting each face in two, and declaring an accurate `unicode-range` on each
`@font-face`, lets the browser fetch only the part it needs — which for an
ASCII page is roughly half the bytes.

Run after changing the source fonts:

    python3 scripts/subset-fonts.py

Source faces live alongside the generated ones and are the input to this
script; only the generated `.latin.*` and `.latin-ext.*` files are published.
"""

from __future__ import annotations

import glob
import os
import sys

from fontTools.subset import Options, Subsetter, load_font, save_font
from fontTools.ttLib import TTFont

# Basic Latin plus the punctuation and symbols a Mac OS 9 interface actually
# uses. Everything the font covers outside this goes to latin-ext.
LATIN = set(range(0x0020, 0x007F)) | {
    0x00A0,  # no-break space
    0x00A9,  # ©
    0x00AE,  # ®
    0x00B0,  # °
    0x2013, 0x2014,  # en/em dash
    0x2018, 0x2019, 0x201A,  # single quotes
    0x201C, 0x201D, 0x201E,  # double quotes
    0x2020, 0x2021, 0x2022,  # daggers, bullet
    0x2026,  # ellipsis
    0x2122,  # ™
}

SOURCES = sorted(
    p
    for p in glob.glob("src/fonts/Pixel/*/*.woff2")
    if ".latin" not in os.path.basename(p)
)


def covered(path: str) -> set[int]:
    """Code points the face actually contains."""
    return set(TTFont(path).getBestCmap().keys())


def ranges(codes: set[int]) -> str:
    """Format a code point set as a CSS unicode-range value."""
    ordered = sorted(codes)
    out, start, prev = [], ordered[0], ordered[0]
    for code in ordered[1:]:
        if code == prev + 1:
            prev = code
            continue
        out.append((start, prev))
        start = prev = code
    out.append((start, prev))
    return ", ".join(
        f"U+{a:04X}" if a == b else f"U+{a:04X}-{b:04X}" for a, b in out
    )


def subset(source: str, codes: set[int], suffix: str, flavor: str) -> int:
    """Write one subset and return its size in bytes."""
    options = Options()
    options.flavor = flavor
    options.desubroutinize = True
    # Keep the name and OS/2 metrics so the metric overrides in fonts.css stay
    # meaningful, and layout does not shift between the two subsets.
    options.name_IDs = ["*"]
    options.notdef_outline = True

    font = load_font(source, options)
    subsetter = Subsetter(options=options)
    subsetter.populate(unicodes=codes)
    subsetter.subset(font)

    stem = source[: -len(".woff2")]
    target = f"{stem}.{suffix}.{'woff2' if flavor == 'woff2' else 'woff'}"
    save_font(font, target, options)
    font.close()
    return os.path.getsize(target)


def main() -> int:
    if not SOURCES:
        print("No source faces found under src/fonts/Pixel/*/", file=sys.stderr)
        return 1

    latin_codes: set[int] | None = None
    ext_codes: set[int] | None = None
    total_before = total_after = 0

    for source in SOURCES:
        available = covered(source)
        latin = available & LATIN
        ext = available - LATIN

        # Every face covers the same set, so one range pair describes them all.
        latin_codes = latin if latin_codes is None else latin_codes
        ext_codes = ext if ext_codes is None else ext_codes

        before = os.path.getsize(source)
        total_before += before

        sizes = []
        for suffix, codes in (("latin", latin), ("latin-ext", ext)):
            for flavor in ("woff2", "woff"):
                size = subset(source, codes, suffix, flavor)
                if flavor == "woff2":
                    sizes.append((suffix, size))
                    total_after += size

        detail = "  ".join(f"{name}={size:,}B" for name, size in sizes)
        print(f"{os.path.basename(source):26} {before:,}B -> {detail}")

    print()
    print(f"woff2 total: {total_before:,}B in one file per face")
    print(f"             {total_after:,}B split, of which latin-only pages fetch")
    latin_only = sum(
        os.path.getsize(s[: -len('.woff2')] + ".latin.woff2") for s in SOURCES
    )
    print(f"             {latin_only:,}B ({latin_only / total_before:.0%} of the original)")
    print()
    print("unicode-range for the latin subset:")
    print(f"  {ranges(latin_codes or set())}")
    print()
    print("unicode-range for the latin-ext subset:")
    print(f"  {ranges(ext_codes or set())}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
