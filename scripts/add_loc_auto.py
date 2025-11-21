"""
Author: Guoxin Wang
Date: 2025-11-04 16:06:07
LastEditors: Guoxin Wang
LastEditTime: 2025-11-11 12:12:26
FilePath: /AnnoDesignerWEB/scripts/add_loc_auto.py
Description: Add new localization to presets.json based on XML files.

Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
"""

import argparse
import re

import orjson
from lxml import etree
from tqdm import tqdm


def get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Add new localization to presets.json based on XML files."
    )
    parser.add_argument(
        "--input_file",
        "-i",
        default="presets.json",
        help="Path to presets.json file (default: presets.json)",
    )
    parser.add_argument(
        "--source",
        "-s",
        default="texts_english.xml",
        help="Path to EN xml file (default: texts_english.xml)",
    )
    parser.add_argument(
        "--target",
        "-t",
        default="texts_chinese.xml",
        help="Path to TARGET xml file (default: texts_chinese.xml)",
    )
    parser.add_argument(
        "--target_lang",
        "-l",
        default="zhs",
        help="Target language code to add (default: zhs)",
    )
    parser.add_argument(
        "--output_file",
        "-o",
        default="presets_new.json",
        help="Output JSON file path (default: presets_new.json)",
    )
    args = parser.parse_args()
    return args


# ========= Parse XML =========
def parse_texts_fast(path: str) -> dict:
    parser = etree.XMLParser(recover=True, huge_tree=True)
    tree = etree.parse(path, parser)
    root = tree.getroot()
    result = {}
    for text in tqdm(root.xpath("//Text"), desc=f"Parsing {path} ..."):
        guid = text.findtext("GUID")
        val = text.findtext("Text")
        if guid and val:
            result[guid.strip()] = val.strip()
    return result


def build_en2target_map(en_map: dict, target_map: dict) -> dict:
    en2target = {}
    for guid, en_text in tqdm(en_map.items(), desc="Building EN->TARGET map ..."):
        en_text = en_text.strip().lower()
        if guid in target_map and target_map[guid].strip().lower() != en_text:
            en2target[en_text] = target_map[guid]
    return en2target


def strip_bracket(s: str) -> tuple[str, str, str]:
    s = s.strip()
    prefix = ""
    suffix = ""

    m_pre = re.match(r"^(\([^()]*\)\s*[-–—]?\s*)(.*)$", s)
    if m_pre:
        prefix = m_pre.group(1)
        s = m_pre.group(2).strip()

    m_post = re.match(r"^(.*?)(\s*[-–—]?\s*\([^()]*\))$", s)
    if m_post:
        s = m_post.group(1).strip()
        suffix = m_post.group(2)

    base = s.strip()
    return base, prefix, suffix


# ========= JSON Update =========
def update_localizations(
    buildings: list[dict],
    # target_map: dict,
    en2target: dict,
    target_lang: str = "zhs",
) -> tuple[int, list[dict]]:
    """Recursively add Localization['TARGET'] to the object."""
    updated = 0
    failure = []

    for building in tqdm(buildings, desc="Updating localizations"):
        loc = building.get("Localization")
        if target_lang not in loc:
            eng = loc.get("eng").strip().lower()
            base, prefix, suffix = strip_bracket(eng)

            # BUG: guid-based matching is not reliable, some buildings share the same GUID in presets.json (1010277)
            # guid = str(building.get("Guid")).strip()
            # target_key = target_map.get(guid) or en2target.get(base) or en2target.get(eng)
            target_key = en2target.get(base) or en2target.get(eng)

            if target_key:
                loc[target_lang] = f"{prefix}{target_key}{suffix}".strip()
                updated += 1
                continue
            failure.append(
                {
                    "Header": building.get("Header"),
                    "Identifier": building.get("Identifier"),
                    "Guid": building.get("Guid"),
                    "eng": eng,
                }
            )
    return updated, failure


def main():
    args = get_args()

    en_map = parse_texts_fast(args.source)
    target_map = parse_texts_fast(args.target)
    print(f"EN Items: {len(en_map):,}, TARGET Items: {len(target_map):,}")

    en2target = build_en2target_map(en_map, target_map)
    print(f"EN->TARGET mapping established, total {len(en2target):,} items")

    # Read input presets.json
    with open(args.input_file, "rb") as f:
        presets = orjson.loads(f.read())

    buildings = presets.get("Buildings")
    if not buildings:
        print("No Buildings found in presets.json")
        return

    print("Updating localizations ...")
    total_updated = 0
    total_failure = []
    total_updated, total_failure = update_localizations(
        buildings,
        # target_map,
        en2target,
        target_lang=args.target_lang,
    )

    print(f"Total localization entries added: {total_updated:,}")

    print("Writing output file ...")
    with open(args.output_file, "wb") as f:
        f.write(
            orjson.dumps(
                presets,
                option=orjson.OPT_INDENT_2
                | orjson.OPT_NON_STR_KEYS
                | orjson.OPT_SORT_KEYS
                | orjson.OPT_APPEND_NEWLINE,
            )
        )
    print(f"Complete: {args.output_file}")

    if total_failure:
        print("Writing failures to failures.json ...")
        with open("failures.json", "wb") as f:
            f.write(
                orjson.dumps(
                    total_failure,
                    option=orjson.OPT_INDENT_2
                    | orjson.OPT_NON_STR_KEYS
                    | orjson.OPT_SORT_KEYS
                    | orjson.OPT_APPEND_NEWLINE,
                )
            )
        print(f"Failures written: {len(total_failure):,} items to failures.json")


if __name__ == "__main__":
    main()
