#!/usr/bin/env python3
"""Build an upload ZIP containing only the extension's required files."""

import argparse
from pathlib import Path
from zipfile import ZIP_DEFLATED, ZipFile


ROOT = Path(__file__).resolve().parent
FILES = (
    "manifest.json", "kb.js", "keyboard.js", "keyboard-frame.html", "keyboard-frame.js", "icon.svg", "icon.png",
    "options/options.js", "options/osk_settings.html", "LICENSE",
)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("output", type=Path, help="Output ZIP path (must not exist)")
    args = parser.parse_args()
    for name in FILES:
        if not (ROOT / name).is_file():
            parser.error(f"Required file missing: {name}")
    with ZipFile(args.output, "x", compression=ZIP_DEFLATED) as archive:
        for name in FILES:
            archive.write(ROOT / name, name)
    print(args.output.resolve())


if __name__ == "__main__":
    main()
