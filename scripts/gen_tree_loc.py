"""
Author: Guoxin Wang
Date: 2025-11-11 11:32:43
LastEditors: Guoxin Wang
LastEditTime: 2025-11-11 13:28:02
FilePath: /AnnoDesignerWEB/scripts/gen_tree_loc.py
Description: Generate tree localization from Google Sheets.

Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
"""

import argparse

import orjson
import pandas as pd
from tqdm import tqdm


def get_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Generate tree localization from Google Sheets."
    )
    parser.add_argument(
        "--url",
        "-u",
        default="https://docs.google.com/spreadsheets/d/1CjECty43mkkm1waO4yhQl1rzZ-ZltrBgj00aq-WJX4w/export?format=csv&gid=935118775",
        help="URL of the Google Sheets CSV file (default: Google Sheets URL)",
    )
    parser.add_argument(
        "--output_file",
        "-o",
        default="treeLocalization.json",
        help="Output JSON file path (default: treeLocalization.json)",
    )
    args = parser.parse_args()
    return args


def is_supported_language(language):
    match (language):
        case "English":
            return "eng"
        case "German":
            return "ger"
        case "French":
            return "fra"
        case "Spanish":
            return "esp"
        case "Italian":
            return "ita"
        case "Polish":
            return "pol"
        case "Russian":
            return "rus"
        case "Chinese":
            return "zhs"
        case "Taiwanese":
            return "zht"
        case _:
            return None


def build_loc_dict(df, language):
    lang_code = is_supported_language(language)
    if lang_code:
        translations = {}
        for _, row in df.iterrows():
            key = row["Property String (For developer use)"]
            value = row[language]
            translations[key] = value
        return {
            lang_code: translations,
        }
    return None


def main():
    args = get_args()

    df = pd.read_csv(args.url)
    languages = {}

    for col in tqdm(df.columns, desc="Processing languages ..."):
        language = build_loc_dict(df, col)
        if language:
            languages.update(language)
    json = {"languages": languages}

    print("Writing output file ...")
    with open(args.output_file, "wb") as f:
        f.write(
            orjson.dumps(
                json,
                option=orjson.OPT_INDENT_2
                | orjson.OPT_NON_STR_KEYS
                | orjson.OPT_SORT_KEYS
                | orjson.OPT_APPEND_NEWLINE,
            )
        )
    print(f"Complete: {args.output_file}")


if __name__ == "__main__":
    main()
