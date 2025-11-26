/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:48:16
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-11-26 16:44:07
 * @FilePath: /AnnoDesignerWEB/src/utils/core.js
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */

function useAssets() {
    const [presets, setPresets] = useState(null);
    const [treeLoc, setTreeLoc] = useState(null);
    const [colors, setColors] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        Promise.all([
            loadJSON("./assets/presets.json"),
            loadJSON("./assets/treeLocalization.json"),
            loadJSON("./assets/colors.json"),
        ])
            .then(([p, t, c]) => {
                setPresets(p);
                setTreeLoc(t);
                setColors(c);
            })
            .catch((e) => setError(e.message));
    }, []);
    return { presets, treeLoc, colors, error };
}

function annoColorCSS(b, alpha, schemeColors) {
    const color = (() => {
        const colorObj = schemeColors.find((c) => {
            const ids = c.TargetIdentifiers || [];
            const tes = c.TargetTemplate || "";
            return ids.includes(b.Identifier) || tes === b.Template;
        });
        return colorObj ? colorObj.Color : null;
    })();
    return color
        ? "rgba(" +
              color.R +
              "," +
              color.G +
              "," +
              color.B +
              "," +
              (alpha ?? color.A / 255) +
              ")"
        : null;
}

function packPlacedForSave(b, ghost, gRot) {
    iconFileName = b.IconFileName
        ? b.IconFileName.replace(/\.png$/i, "")
        : null;
    const color = (() => {
        const colorObj = schemeColors.find((c) => {
            const ids = c.TargetIdentifiers || [];
            return ids.includes(b.Identifier);
        });
        return colorObj ? colorObj.Color : null;
    })();
    return {
        Identifier: b.Identifier,
        Label: "",
        Position: `${ghost.x},${ghost.y}`,
        Size: `${b.BuildBlocker?.x || 1},${b.BuildBlocker?.z || 1}`,
        Icon: iconFileName,
        Template: b.Template,
        Color: color,
        Borderless: false,
        Road: false,
        Radius: 5.0,
        InfluenceRange: -2.0,
        PavedStreet: false,
        BlockedAreaLength: 0.0,
        BlockedAreaWidth: 0.0,
        Direction: "Up",
    };
}

async function loadJSON(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error("加载失败: " + path);
    return r.json();
}

function groupByVersionAndGroup(buildings) {
    const map = {};
    for (const b of buildings) {
        const version = (b.Header || "未知").trim();
        const grp = b.Group || (b.Road ? "Roads" : "Misc");
        if (!map[version]) map[version] = { groups: {}, counts: 0 };
        if (!map[version].groups[grp]) map[version].groups[grp] = [];
        map[version].groups[grp].push(b);
        map[version].counts++;
    }
    return map;
}

function isEditable(el) {
    if (!el) return false;
    const tn = (el.tagName || "").toUpperCase();
    return (
        el.isContentEditable ||
        tn === "INPUT" ||
        tn === "TEXTAREA" ||
        tn === "SELECT"
    );
}

function apply(el, cur) {
    if (!el) return;
    el.style.cursor = cur || "";
}

window.useAssets = useAssets;
window.annoColorCSS = annoColorCSS;
window.loadJSON = loadJSON;
window.groupByVersionAndGroup = groupByVersionAndGroup;
window.isEditable = isEditable;
window.apply = apply;
