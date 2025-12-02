/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 14:03:30
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-12-02 13:15:03
 * @FilePath: /AnnoDesignerWEB/src/components/Inspector.jsx
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */

function Inspector({ selected, placed, setPlaced, setSelected }) {
    // ---- helpers ----
    function isExcluded(b) {
        if (!b) return false;
        if (b.Road === true) return true; // road tiles
        if (b.Identifier === "BlockTile_1x1") return true; // block tile
        return false;
    }
    const nameOf = (b) =>
        b?.Localization?.zhs || b?.Localization?.eng || "Unknown";

    // ---- filtered list for global statistics ----
    const statList = placed.filter((it) => !isExcluded(it?.b));

    // ---- selected item info ----
    let selInfo = null;
    if (selected.length === 1) {
        const b = selected[0].b || {};
        const r = Number(b.InfluenceRadius || 0);
        const d = Number(b.InfluenceRange || 0);
        const useRadius = r > 0;
        const useRange = !useRadius && d > 0;
        const influenceType = useRadius ? "半径" : useRange ? "距离" : "—";
        const activeVal = useRadius ? r : useRange ? d : 0;
        const sameTypeCount = statList.filter(
            (it) => it?.b?.Identifier === b.Identifier
        ).length;
        selInfo = {
            useRadius,
            useRange,
            influenceType,
            activeVal,
            sameTypeCount,
        };
    }

    // ---- global stats by name ----
    const total = statList.length;
    const byName = {};
    for (const it of statList) {
        const nm = nameOf(it.b);
        byName[nm] = (byName[nm] || 0) + 1;
    }
    const byNameEntries = Object.entries(byName).sort((a, b) => b[1] - a[1]);

    // ---- resizable split panes ----
    const splitRef = useRef(null);
    const [topH, setTopH] = useState(() => {
        try {
            const v = parseInt(
                localStorage.getItem("inspectorTopH") || "0",
                10
            );
            return isFinite(v) && v > 120 ? v : 280;
        } catch (e) {
            return 280;
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
        const rect = splitRef.current?.getBoundingClientRect();
        const minTop = 140;
        const maxTop = Math.max(minTop, (rect ? rect.height : 600) - 160);
        function onMove(ev) {
            const dy = ev.clientY - startY;
            let nh = startH + dy;
            if (nh < minTop) nh = minTop;
            if (nh > maxTop) nh = maxTop;
            setTopH(nh);
            document.body.style.userSelect = "none";
            document.body.style.cursor = "row-resize";
        }
        function onUp() {
            window.removeEventListener("mousemove", onMove);
            window.removeEventListener("mouseup", onUp);
            document.body.style.userSelect = "";
            document.body.style.cursor = "";
        }
        window.addEventListener("mousemove", onMove);
        window.addEventListener("mouseup", onUp);
    }

    return (
        <div className="inspector">
            <div className="header">
                <strong>属性</strong>
            </div>
            <div className="inspector-split" ref={splitRef}>
                {/* 上半区：属性 */}
                <div className="pane pane-top" style={{ height: topH }}>
                    {selected.length > 0 && (
                        <div className="kv">
                            <div class="small">
                                提示：点击对象本体选中；Delete 删除；R 旋转；Alt
                                抓手；中键旋转；网格吸附；影响范围圈不可选中。
                            </div>
                        </div>
                    )}
                    {selected.length > 0 && (
                        <div className="kv">
                            <label>已选建筑</label>
                            <div>
                                {selected[0].b.Localization?.zhs ||
                                    selected[0].b.Localization?.eng}
                            </div>
                            <hr class="sep" />
                            <div class="small">
                                大小（格）：{selected[0].b.BuildBlocker?.x || 1}{" "}
                                × {selected[0].b.BuildBlocker?.z || 1}
                            </div>
                            <div class="small">
                                旋转：{selected[0].rot || 0}°
                            </div>
                            <div class="small">
                                派系：{selected[0].b.Faction || "-"}
                            </div>
                            <div class="small">
                                组别：{selected[0].b.Group || "-"}
                            </div>
                            <div class="small">
                                位置（格）：x={(selected[0].x / 32) | 0}, y=
                                {(selected[0].y / 32) | 0}
                            </div>
                            <div class="small">
                                影响类型：{selInfo?.influenceType}
                            </div>
                            {selInfo?.useRadius && (
                                <div class="small">
                                    InfluenceRadius：{selInfo.activeVal}
                                </div>
                            )}
                            {selInfo?.useRange && (
                                <div class="small">
                                    InfluenceRange：{selInfo.activeVal}
                                </div>
                            )}
                            <div class="small">
                                该类型数量：{selInfo?.sameTypeCount || 0}
                            </div>
                        </div>
                    )}
                </div>

                {/* 分隔条 */}
                <div
                    class="pane-divider"
                    onMouseDown={startDrag}
                    title="拖动以调整面板大小"
                />

                {/* 下半区：全局统计 */}
                <div class="pane pane-bottom">
                    <div class="header">
                        <strong>全局统计</strong>
                    </div>
                    <div class="kv">
                        <div class="small">总数：{total}</div>
                        <hr class="sep" />
                        <div class="small" style={{ marginTop: 6 }}>
                            {byNameEntries.map(([nm, n]) => (
                                <div key={nm}>
                                    {nm}：{n}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

window.Inspector = Inspector;
