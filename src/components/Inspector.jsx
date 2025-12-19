/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 14:03:30
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-12-19 21:31:01
 * @FilePath: /AnnoDesignerWEB/src/components/Inspector.jsx
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */

function Inspector({ webLoc, loc, placed, selected }) {
    const languages = webLoc?.languages ?? {};
    const currentWebLoc = languages[loc];

    function isExcluded(b) {
        if (!b) return false;
        if (b.Road === true) return true; // road tiles
        if (b.Identifier === "BlockTile") return true; // block tile
        return false;
    }
    // ---- stats by name ----
    const statList = placed.filter((it) => !isExcluded(it.b));
    const total = statList.length;
    const byName = {};
    for (const it of statList) {
        const nm =
            it.b?.Localization?.[loc] || it.b?.Localization?.eng || "Unknown";
        byName[nm] = (byName[nm] || 0) + 1;
    }
    const byNameEntries = Object.entries(byName).sort((a, b) => b[1] - a[1]);
    const byNameSelected = {};
    for (const it of selected) {
        const nm =
            it.b?.Localization?.[loc] || it.b?.Localization?.eng || "Unknown";
        byNameSelected[nm] = (byNameSelected[nm] || 0) + 1;
    }
    const byNameEntriesSelected = Object.entries(byNameSelected).sort(
        (a, b) => b[1] - a[1]
    );

    const { minX, minY, maxX, maxY } = boundingBox(placed);
    const totalArea = (maxX - minX) * (maxY - minY);
    const usedArea = placed
        .map((it) => {
            return it.w * it.h;
        })
        .reduce((a, b) => a + b, 0);
    const areaUsage =
        totalArea > 0 ? ((usedArea / totalArea) * 100).toFixed(2) : 0;

    // ---- selected item info ----
    let localInfo = {};
    for (const it of selected) {
        const r = Number(it.b?.InfluenceRadius || 0);
        const d = Number(it.b?.InfluenceRange || 0);
        const sameCountGlobal = statList.filter(
            (s) => s?.b?.Identifier === it.b?.Identifier
        ).length;
        const sameCountLocal = selected.filter(
            (s) => s?.b?.Identifier === it.b?.Identifier
        ).length;
        localInfo[it.id] = {
            id: it.b?.Identifier,
            direction: it.direction,
            influence: r > 0 ? r : d > 0 ? d : 0,
            sameCountGlobal,
            sameCountLocal,
        };
    }

    // ---- resizable split panes ----
    const [topH, setTopH] = useState(() => {
        try {
            const v = parseInt(
                localStorage.getItem("inspectorTopH") || "66",
                10
            );
            return isFinite(v) ? v : 66;
        } catch (e) {
            return 66;
        }
    });
    useEffect(() => {
        try {
            localStorage.setItem("inspectorTopH", String(topH));
        } catch (e) {}
    }, [topH]);

    function startDrag(e) {
        e.preventDefault();
        const startY = e.clientY;
        const startH = topH;
        const minTop = 10;
        const maxTop = 90;
        function onMove(ev) {
            const dy = ((ev.clientY - startY) / window.innerHeight) * 100;
            let nh = startH + dy;
            if (nh < minTop) nh = minTop;
            if (nh > maxTop) nh = maxTop;
            setTopH(nh);
            document.body.style.cursor = "row-resize";
        }
        function onMouseUp() {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onMouseUp);
            document.body.style.cursor = "";
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onMouseUp);
    }

    return (
        <div className="inspector">
            {/* top pane: local info */}
            <div className="pane-top" style={{ height: `${topH}%` }}>
                <div className="pane-header">
                    <strong>
                        {languages[loc]["(INSPECTOR_HEADER)Property"]}
                    </strong>
                </div>
                {selected.length === 1 && (
                    <div className="kv">
                        <div>
                            {selected[0].b.Localization?.[loc] ||
                                selected[0].b.Localization?.eng}
                        </div>
                        <hr class="sep" />
                        <div class="stat">
                            {languages[loc]["(INSPECTOR_SATA)Faction"]}:{" "}
                            {currentWebLoc[
                                selected[0].b.Faction.replace(/\s+/g, "")
                            ] || "-"}
                        </div>
                        <div class="stat">
                            {languages[loc]["(INSPECTOR_SATA)Group"]}:{" "}
                            {currentWebLoc[
                                (selected[0].b.Group ?? "").replace(/\s+/g, "")
                            ] || "-"}
                        </div>
                        <div class="stat">
                            {languages[loc]["(INSPECTOR_SATA)Pos"]}: x ={" "}
                            {(selected[0].x / TILE) | 0}, y ={" "}
                            {(selected[0].y / TILE) | 0}
                        </div>
                        <div class="stat">
                            {languages[loc]["(INSPECTOR_SATA)Size"]}:{" "}
                            {selected[0].b.BuildBlocker?.x || 1} x{" "}
                            {selected[0].b.BuildBlocker?.z || 1}
                        </div>
                        <div class="stat">
                            {languages[loc]["(INSPECTOR_SATA)Rot"]}:{" "}
                            {selected[0].direction} °
                        </div>
                        <div class="stat">
                            {languages[loc]["(INSPECTOR_SATA)Influence"]}:{" "}
                            {localInfo[selected[0].id].influence > 0
                                ? localInfo[selected[0].id].influence
                                : "-"}
                        </div>
                        <div class="stat">
                            {languages[loc]["(INSPECTOR_SATA)Count"]}:{" "}
                            {localInfo[selected[0].id].sameCountGlobal || 0}
                        </div>
                    </div>
                )}
                {selected.length > 1 && (
                    <div className="kv">
                        <div>
                            {languages[loc]["(INSPECTOR_SATA)Selected"]}:{" "}
                            {selected.length}
                        </div>
                        <hr class="sep" />
                        {byNameEntriesSelected.map(([nm, n]) => (
                            <div class="stat" key={nm}>
                                {nm}: {n}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* divider */}
            <div class="pane-divider" onMouseDown={startDrag} />

            {/* bottom pane: global stats */}
            <div class="pane-bottom" style={{ height: `${100 - topH}%` }}>
                <div class="pane-header">
                    <strong>
                        {languages[loc]["(INSPECTOR_HEADER)GlobalStats"]}
                    </strong>
                </div>
                <div class="kv">
                    <div>
                        {languages[loc]["(INSPECTOR_SATA)AreaUsage"]}:{" "}
                        {areaUsage}
                    </div>
                    <div>
                        {languages[loc]["(INSPECTOR_SATA)TotalCount"]}: {total}
                    </div>
                    <hr class="sep" />
                    {byNameEntries.map(([nm, n]) => (
                        <div class="stat" key={nm}>
                            {nm}: {n}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

window.Inspector = Inspector;
