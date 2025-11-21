"""
Author: Guoxin Wang
Date: 2025-11-07 16:49:22
LastEditors: Guoxin Wang
LastEditTime: 2025-11-11 12:12:52
FilePath: /AnnoDesignerWEB/scripts/add_loc_manually.py
Description: Add new localization to presets.json manually.

Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
"""

import argparse

import orjson
from tqdm import tqdm


def get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Add new localization to presets.json manually."
    )
    parser.add_argument(
        "--version",
        "-v",
        choices=[1404, 2070, 2205, 1800],
        default=1800,
        help="anno version (default: 1800)",
    )
    parser.add_argument(
        "--input_file",
        "-i",
        default="presets.json",
        help="Path to presets.json file (default: presets.json)",
    )
    parser.add_argument(
        "--output_file",
        "-o",
        default="presets_new.json",
        help="Output JSON file path (default: presets_new.json)",
    )
    args = parser.parse_args()
    return args


def update_localizations(buildings: list, version: int) -> int:
    updated = 0

    for building in tqdm(buildings, desc="Adding manual localizations"):
        loc = building.get("Localization")
        id = building.get("Identifier")
        if version == 1800:
            if id == "Random slot mining":
                loc["zhs"] = "空矿区"
            elif id == "Culture_prop_system_1x1_03":
                loc["zhs"] = "围栏"
            elif id == "Culture_prop_system_1x1_07":
                loc["zhs"] = "人行道树篱"
            elif id == "Culture_prop_system_1x1_08":
                loc["zhs"] = "人行道树篱转角处"
            elif id == "Culture_prop_system_1x1_09":
                loc["zhs"] = "人行道树篱末端"
            elif id == "Culture_prop_system_1x1_11":
                loc["zhs"] = "人行道树篱交界处"
            elif id == "Culture_prop_system_1x1_12":
                loc["zhs"] = "围栏交界处"
            elif id == "Culture_prop_system_1x1_13":
                loc["zhs"] = "人行道树篱交叉口"
            elif id == "Culture_01_module":
                loc["zhs"] = "动物园模块 (6x4)"
            elif id == "Culture_02_module":
                loc["zhs"] = "博物馆模块 (5x4)"
            elif id == "Culture_03_module":
                loc["zhs"] = "植物园模块 (5x4)"
            elif id == "A7_residence_SkyScraper_4lvl1":
                loc["zhs"] = "摩天大楼 (T4 I)"
            elif id == "A7_residence_SkyScraper_4lvl2":
                loc["zhs"] = "摩天大楼 (T4 II)"
            elif id == "A7_residence_SkyScraper_4lvl3":
                loc["zhs"] = "摩天大楼 (T4 III)"
            elif id == "A7_residence_SkyScraper_5lvl1":
                loc["zhs"] = "摩天大楼 (T5 I)"
            elif id == "A7_residence_SkyScraper_5lvl2":
                loc["zhs"] = "摩天大楼 (T5 II)"
            elif id == "A7_residence_SkyScraper_5lvl3":
                loc["zhs"] = "摩天大楼 (T5 III)"
            elif id == "A7_residence_SkyScraper_5lvl4":
                loc["zhs"] = "摩天大楼 (T5 IV)"
            elif id == "A7_residence_SkyScraper_5lvl5":
                loc["zhs"] = "摩天大楼 (T5 V)"
            elif id == "WaterCanal":
                loc["zhs"] = "水渠"
            else:
                continue
            updated += 1

    return updated


def main():
    args = get_args()

    # Read input presets.json
    with open(args.input_file, "rb") as f:
        presets = orjson.loads(f.read())

    buildings = presets.get("Buildings")
    if not buildings:
        print("No Buildings found in presets.json")
        return

    total_updated = update_localizations(
        buildings,
        args.version,
    )

    print(f"Total {total_updated} localizations added manually.")

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


if __name__ == "__main__":
    main()
