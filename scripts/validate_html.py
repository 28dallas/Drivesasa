#!/usr/bin/env python3
"""
Simple HTML checks for presence of basic tags and doctype.
Not a full validator, but catches common accidental truncations.
"""
import sys
from pathlib import Path

FILES = ["index.html","signin.html","signup.html"]

def check(path: Path):
    text = path.read_text(encoding='utf-8')
    errors = []
    if '<!DOCTYPE html>' not in text and '<!doctype html>' not in text.lower():
        errors.append('Missing <!DOCTYPE html>')
    for tag in ['<html','</html>','<head','</head>','<body','</body>','<title']:
        if tag not in text:
            errors.append(f"Missing {tag} tag")
    return errors

def main():
    base = Path(__file__).resolve().parents[1]
    any_err = False
    for f in FILES:
        p = base / f
        if not p.exists():
            print(f"[MISSING] {f} not found")
            any_err = True
            continue
        errs = check(p)
        if errs:
            any_err = True
            print(f"[ISSUES] {f}:")
            for e in errs:
                print('  -', e)
        else:
            print(f"[OK] {f} looks good (basic checks)")

    if any_err:
        sys.exit(1)

if __name__ == '__main__':
    main()
