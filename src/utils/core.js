/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:48:16
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-12-19 23:05:01
 * @FilePath: /AnnoDesignerWEB/src/utils/core.js
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */

function useAssets() {
    const [presets, setPresets] = useState(null);
    const [webLoc, setWebLoc] = useState(null);
    const [colors, setColors] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        Promise.all([
            loadPreset("./assets/presets.json"),
            loadPreset("./assets/localization.json"),
            loadPreset("./assets/colors.json"),
        ])
            .then(([p, t, c]) => {
                setPresets(p);
                setWebLoc(t);
                setColors(c);
            })
            .catch((e) => setError(e.message));
    }, []);
    return { presets, webLoc, colors, error };
}

function useLatest(value) {
    const ref = useRef(value);
    useLayoutEffect(() => {
        ref.current = value;
    }, [value]);
    return ref;
}

function annoColorCSS(c, b, alpha, schemeColors) {
    if (c) {
        return (
            "rgba(" +
            c.R +
            "," +
            c.G +
            "," +
            c.B +
            "," +
            (alpha ?? c.A / 255) +
            ")"
        );
    }
    const color = (() => {
        const colorObj = schemeColors.find((c) => {
            const ids = c.TargetIdentifiers || [];
            const tes = c.TargetTemplate || "";
            return ids.includes(b.Identifier) || tes === b.Template;
        });
        return colorObj ? colorObj.Color : null;
    })();
    return (
        "rgba(" +
        color.R +
        "," +
        color.G +
        "," +
        color.B +
        "," +
        (alpha ?? color.A / 255) +
        ")"
    );
}

function cssColorAnno(b, schemeColors) {
    const color = (() => {
        const colorObj = schemeColors.find((c) => {
            const ids = c.TargetIdentifiers || [];
            const tes = c.TargetTemplate || "";
            return ids.includes(b.Identifier) || tes === b.Template;
        });
        return colorObj ? colorObj.Color : null;
    })();
    return color;
}

function aabbIntersects(a, b) {
    return !(
        a.x + a.w <= b.x ||
        b.x + b.w <= a.x ||
        a.y + a.h <= b.y ||
        b.y + b.h <= a.y
    );
}

function boundingBox(items) {
    let minX = Infinity;
    let minY = Infinity;
    let maxX = -Infinity;
    let maxY = -Infinity;
    for (const it of items) {
        const wb = it.b?.BuildBlocker?.x || 1;
        const hb = it.b?.BuildBlocker?.z || 1;
        const swap0 = it.direction % 180 !== 0;
        const w0 = (swap0 ? hb : wb) * TILE;
        const h0 = (swap0 ? wb : hb) * TILE;
        minX = Math.min(it.x, minX);
        minY = Math.min(it.y, minY);
        maxX = Math.max(it.x + w0, maxX);
        maxY = Math.max(it.y + h0, maxY);
    }
    return { minX, minY, maxX, maxY };
}

async function loadPreset(path) {
    const r = await fetch(path);
    if (!r.ok) throw new Error("loading failed: " + path);
    return r.json();
}

function exportJSON(items) {
    const layout = {
        FileVersion: 1,
        LayoutVersion: "1.0.0.0",
        Modified: new Date().toISOString(),
        Objects: [],
    };
    for (const it of items) {
        const iconFileName = it.b.IconFileName
            ? it.b.IconFileName.replace(/\s+/g, "_")
                  .toLowerCase()
                  .replace(/\.png$/i, "")
            : null;
        layout.Objects.push({
            Identifier: it.b.Identifier,
            // Label: "",
            Position: `${it.x},${it.y}`,
            Size: `${it.b.BuildBlocker?.x || 1},${it.b.BuildBlocker?.z || 1}`,
            Icon: iconFileName,
            Template: it.b.Template,
            Color: it.color,
            Borderless: it.b.Borderless,
            Road: it.b.Road,
            Radius: it.radius,
            InfluenceRange: it.influenceRange,
            // PavedStreet: false,
            // BlockedAreaLength: 0.0,
            // BlockedAreaWidth: 0.0,
            Direction: it.direction,
        });
    }
    const blob = new Blob([JSON.stringify(layout, null, 2)], {
        type: "application/ad",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layout.ad";
    a.click();
    URL.revokeObjectURL(url);
}

function loadJSON(file, callback, presets) {
    const r = new FileReader();
    r.onload = () => {
        try {
            const f = JSON.parse(r.result);
            const placed = [];
            for (const obj of f.Objects || []) {
                const b = presets.find((p) => p.Identifier === obj.Identifier);
                if (!b) continue;
                const [x, y] = (obj.Position || "0,0").split(",").map(Number);
                const [w, h] = (obj.Size || "1,1").split(",").map(Number);
                placed.push({
                    id: crypto.randomUUID(),
                    b,
                    x,
                    y,
                    w,
                    h,
                    color: obj.Color,
                    radius: obj.Radius,
                    influenceRange: obj.InfluenceRange,
                    direction: obj.Direction,
                });
            }
            callback(placed);
        } catch {
            console.error("Failed to load layout from file");
        }
    };
    r.readAsText(file);
}

async function export2PNG(svg, minX, minY, maxX, maxY, scale = 4) {
    async function url2DataURL(url) {
        const res = await fetch(url);
        const blob = await res.blob();
        return await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.readAsDataURL(blob);
        });
    }

    const clonedSvg = svg.cloneNode(true);
    const vb = svg.viewBox.baseVal;

    clonedSvg.setAttribute("width", vb.width);
    clonedSvg.setAttribute("height", vb.height);

    const images = clonedSvg.querySelectorAll("image");
    await Promise.all(
        Array.from(images).map(async (img) => {
            const href =
                img.getAttribute("href") || img.getAttribute("xlink:href");
            if (!href) return;
            if (href.startsWith("data:")) return;

            const absUrl = new URL(href, window.location.href).toString();

            try {
                const dataUrl = await url2DataURL(absUrl);
                img.setAttribute("href", dataUrl);
                img.removeAttribute("xlink:href");
            } catch (e) {
                console.error("Failed to inline image:", absUrl, e);
            }
        })
    );

    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(clonedSvg);

    if (!source.includes("xmlns=")) {
        source = source.replace(
            "<svg",
            '<svg xmlns="http://www.w3.org/2000/svg"'
        );
    }

    const svgBlob = new Blob([source], {
        type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
        const vb = clonedSvg.viewBox.baseVal;
        const vbWidth = vb.width;
        const vbHeight = vb.height;

        const rectWidth = maxX - minX;
        const rectHeight = maxY - minY;

        if (rectWidth <= 0 || rectHeight <= 0) {
            console.error("Invalid crop rect");
            URL.revokeObjectURL(url);
            return;
        }

        const ratioX = img.naturalWidth / vbWidth;
        const ratioY = img.naturalHeight / vbHeight;

        const sx = minX * ratioX;
        const sy = minY * ratioY;
        const sWidth = rectWidth * ratioX;
        const sHeight = rectHeight * ratioY;

        const canvas = document.createElement("canvas");
        canvas.width = rectWidth * scale;
        canvas.height = rectHeight * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(
            img,
            sx,
            sy,
            sWidth,
            sHeight,
            0,
            0,
            canvas.width,
            canvas.height
        );

        URL.revokeObjectURL(url);

        const pngUrl = canvas.toDataURL("image/png");
        const a = document.createElement("a");
        a.href = pngUrl;
        a.download = "layout.png";
        a.click();
    };

    img.onerror = (err) => {
        console.error("Failed to load SVG image for export", err);
        URL.revokeObjectURL(url);
    };

    img.src = url;
}
