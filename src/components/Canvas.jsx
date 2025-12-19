/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:50:50
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-12-19 23:03:02
 * @FilePath: /AnnoDesignerWEB/src/components/Canvas.jsx
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */

function getBlockDimensions(b, rotation) {
    const wt = b?.BuildBlocker?.x || 1;
    const ht = b?.BuildBlocker?.z || 1;
    const swap = rotation % 180 !== 0;
    return {
        wTiles: (swap ? ht : wt) * TILE,
        hTiles: (swap ? wt : ht) * TILE,
    };
}

function Influence({ influenceRadius, influenceRange, cx, cy }) {
    const r = Math.abs(influenceRadius || 0) * TILE;
    const d = Math.abs(influenceRange || 0) * TILE;
    if (!r && !d) return null;

    const commonProps = {
        fill: "none",
        stroke: "#0062ffff",
        strokeWidth: 1,
        vectorEffect: "non-scaling-stroke",
        pointerEvents: "none",
    };

    return (
        <>
            {r > 0 && <circle {...commonProps} cx={cx} cy={cy} r={r} />}
            {d > 0 && (
                <polygon
                    {...commonProps}
                    strokeDasharray="6 4"
                    points={[
                        `${cx},${cy - d}`,
                        `${cx + d},${cy}`,
                        `${cx},${cy + d}`,
                        `${cx - d},${cy}`,
                    ].join(" ")}
                />
            )}
        </>
    );
}

function PlacingBlock({ item, ghostCan, schemeColors }) {
    const { wTiles, hTiles } = getBlockDimensions(item.b, item.direction);
    const cx = item.x + wTiles / 2;
    const cy = item.y + hTiles / 2;

    return (
        <g
            transform={`
                translate(${cx}, ${cy})
                translate(${-wTiles / 2}, ${-hTiles / 2})
            `}
            pointerEvents="none"
        >
            {item.b?.IconFileName && (
                <image
                    href={
                        "./assets/icons/" +
                        item.b?.IconFileName.replace(/\s+/g, "_").toLowerCase()
                    }
                    x={wTiles * 0.1}
                    y={hTiles * 0.1}
                    width={wTiles * 0.8}
                    height={hTiles * 0.8}
                    preserveAspectRatio="xMidYMid meet"
                    opacity={ghostCan ? 1 : 0.5}
                />
            )}
            <rect
                x="0"
                y="0"
                width={wTiles}
                height={hTiles}
                fill={
                    ghostCan
                        ? annoColorCSS(item.color, item.b, 0.3, schemeColors)
                        : "rgba(255, 0, 0, 0.3)"
                }
                stroke={ghostCan ? "rgba(0,0,255,0.5)" : "rgba(255,0,0,0.5)"}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
            />
            <Influence
                influenceRadius={item.radius}
                influenceRange={item.influenceRange}
                cx={wTiles / 2}
                cy={hTiles / 2}
            />
        </g>
    );
}

function PlacedBlock({ item, schemeColors, canSelect, onSelect, cross }) {
    const { wTiles, hTiles } = getBlockDimensions(item.b, item.direction);
    const cx = item.x + wTiles / 2;
    const cy = item.y + hTiles / 2;

    return (
        <g
            transform={`
                translate(${cx}, ${cy})
                translate(${-wTiles / 2}, ${-hTiles / 2})
            `}
            onClick={canSelect ? () => onSelect(item) : undefined}
            pointerEvents={canSelect ? "auto" : "none"}
        >
            <rect
                x="0"
                y="0"
                width={wTiles}
                height={hTiles}
                fill={
                    annoColorCSS(
                        item.color,
                        item.b,
                        cross ? 0.3 : null,
                        schemeColors
                    ) || "none"
                }
                stroke="#000"
                strokeWidth={item.b.Borderless ? 0 : 1}
                vectorEffect="non-scaling-stroke"
            />
            {item.b.IconFileName && (
                <image
                    href={
                        "./assets/icons/" +
                        item.b.IconFileName.replace(/\s+/g, "_").toLowerCase()
                    }
                    x={wTiles * 0.1}
                    y={hTiles * 0.1}
                    width={wTiles * 0.8}
                    height={hTiles * 0.8}
                    preserveAspectRatio="xMidYMid meet"
                    transform={`
                        translate(${wTiles / 2} ${hTiles / 2})
                        translate(${-wTiles / 2} ${-hTiles / 2})
                    `}
                />
            )}
        </g>
    );
}

function SelectedBlock({ item, schemeColors, placingActive }) {
    const { wTiles, hTiles } = getBlockDimensions(item.b, item.direction);
    const cx = item.x + wTiles / 2;
    const cy = item.y + hTiles / 2;

    return (
        <g
            transform={`
                translate(${cx}, ${cy})
                translate(${-wTiles / 2}, ${-hTiles / 2})
            `}
            pointerEvents={placingActive ? "none" : "auto"}
        >
            <rect
                x="0"
                y="0"
                width={wTiles}
                height={hTiles}
                fill={
                    annoColorCSS(item.color, item.b, 1, schemeColors) || "none"
                }
                stroke={"#0062ffff"}
                strokeWidth={2}
                vectorEffect="non-scaling-stroke"
            />
            {item.b.IconFileName && (
                <image
                    href={
                        "./assets/icons/" +
                        item.b.IconFileName.replace(/\s+/g, "_").toLowerCase()
                    }
                    x={wTiles * 0.1}
                    y={hTiles * 0.1}
                    width={wTiles * 0.8}
                    height={hTiles * 0.8}
                    preserveAspectRatio="xMidYMid meet"
                    transform={`
                        translate(${wTiles / 2} ${hTiles / 2})
                        translate(${-wTiles / 2} ${-hTiles / 2})
                    `}
                />
            )}
            <Influence
                influenceRadius={item.radius}
                influenceRange={item.influenceRange}
                cx={wTiles / 2}
                cy={hTiles / 2}
            />
        </g>
    );
}

function Canvas({
    colors,
    placing,
    setPlacing,
    placed,
    setPlaced,
    selected,
    setSelected,
}) {
    const schemeColors = colors?.AvailableSchemes?.[0]?.Colors || [];

    const [zoom, setZoom] = useState(1);
    const [ghost, setGhost] = useState({
        visible: false,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        candidate: [{ x: 0, y: 0, w: 0, h: 0, b: null, r: 0 }],
        can: false,
    });
    const [altDown, setAltDown] = useState(false);
    const [mouseDown, setMouseDown] = useState(false);

    const wrapRef = useRef(null);
    const lastMouse = useRef({ x: 0, y: 0 });
    const pendingScrollRef = useRef(null);
    const panStart = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
    const selectStart = useRef({ x: 0, y: 0 });
    const gRotRef = useRef(0);

    const zoomRef = useLatest(zoom);
    const placingRef = useLatest(placing);
    const placedRef = useLatest(placed);
    const selectedRef = useLatest(selected);
    const ghostRef = useLatest(ghost);
    const altDownRef = useLatest(altDown);
    const mouseDownRef = useLatest(mouseDown);

    const selectedIdSet = useMemo(
        () => new Set(selected.map((it) => it.id)),
        [selected]
    );

    const { unselectedPlaced, selectedPlaced } = useMemo(() => {
        if (!placed || placed.length === 0) {
            return { unselectedPlaced: [], selectedPlaced: [] };
        }

        const coordCount = new Map();
        for (const it of placed) {
            const key = `${it.x},${it.y}`;
            coordCount.set(key, (coordCount.get(key) || 0) + 1);
        }
        const crossSet = new Set(
            [...coordCount.entries()]
                .filter(([, c]) => c > 1)
                .map(([key]) => key)
        );

        const u = [];
        const s = [];
        for (const it of placed) {
            const key = `${it.x},${it.y}`;
            const withCross = { ...it, __cross: crossSet.has(key) };
            if (selectedIdSet.has(it.id)) {
                s.push(withCross);
            } else {
                u.push(withCross);
            }
        }
        return { unselectedPlaced: u, selectedPlaced: s };
    }, [placed, selectedIdSet]);

    const handleSelect = useCallback(
        (item) => {
            setSelected((prev) => {
                if (prev.some((it) => it.id === item.id)) return prev;
                return [...prev, item];
            });
        },
        [setSelected]
    );

    // zoom with mouse wheel
    useLayoutEffect(() => {
        const wrap = wrapRef.current;
        const p = pendingScrollRef.current;
        if (!wrap || !p) return;
        const maxL = wrap.scrollWidth - wrap.clientWidth;
        const maxT = wrap.scrollHeight - wrap.clientHeight;
        wrap.scrollLeft = clamp(p.left, 0, Math.max(0, maxL));
        wrap.scrollTop = clamp(p.top, 0, Math.max(0, maxT));
        pendingScrollRef.current = null;
    }, [zoom]);

    // mouse events
    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;

        function onMove(e) {
            lastMouse.current.x = e.clientX;
            lastMouse.current.y = e.clientY;

            // panning first
            if (altDownRef.current && mouseDownRef.current) {
                wrap.scrollLeft =
                    panStart.current.sx -
                    (lastMouse.current.x - panStart.current.x);
                wrap.scrollTop =
                    panStart.current.sy - (e.clientY - panStart.current.y);
            } else if (placingRef.current.length > 0) {
                const g = computeGhost(placingRef.current, gRotRef.current);
                if (mouseDownRef.current && g.can) placeOne(g);
            } else if (mouseDownRef.current) {
                const newSelected = computeSelection();
                setSelected(newSelected);
            }
        }

        function onMouseDown(e) {
            // only left
            if (e.button !== 0) return;
            if (e.detail > 1) {
                e.preventDefault();
            } else {
                setMouseDown(true);
                // panning
                if (altDownRef.current) {
                    panStart.current = {
                        x: lastMouse.current.x,
                        y: lastMouse.current.y,
                        sx: wrap.scrollLeft,
                        sy: wrap.scrollTop,
                    };
                } else if (placingRef.current.length > 0) {
                    const g = computeGhost(placingRef.current, gRotRef.current);
                    if (g.can) placeOne(g);
                } else {
                    // click on empty area to start selection and clear selected
                    setSelected([]);
                    selectStart.current = {
                        x: lastMouse.current.x,
                        y: lastMouse.current.y,
                    };
                }
            }
        }

        function onMouseUp(e) {
            if (e.button !== 0) return;
            setMouseDown(false);
        }

        function onContextMenu(e) {
            e.preventDefault();
            reset();
        }

        function onLeave(e) {
            e.preventDefault();
            setGhost((g) => ({ ...g, visible: false }));
            setMouseDown(false);
            setAltDown(false);
        }

        function onWheel(e) {
            e.preventDefault();
            const rect = wrap.getBoundingClientRect();
            const mx = e.clientX - rect.left;
            const my = e.clientY - rect.top;
            const oldZoom = zoomRef.current;
            const dz = e.deltaY < 0 ? 0.1 : -0.1;
            const newZoom = clamp(
                Math.round((oldZoom + dz) * 100) / 100,
                0.5,
                2.0
            );
            const anchorX = (wrap.scrollLeft + mx) / oldZoom;
            const anchorY = (wrap.scrollTop + my) / oldZoom;
            pendingScrollRef.current = {
                left: anchorX * newZoom - mx,
                top: anchorY * newZoom - my,
            };
            setZoom(newZoom);
        }

        wrap.addEventListener("mousemove", onMove);
        wrap.addEventListener("mousedown", onMouseDown);
        wrap.addEventListener("mouseup", onMouseUp);
        wrap.addEventListener("contextmenu", onContextMenu);
        wrap.addEventListener("mouseleave", onLeave);
        wrap.addEventListener("wheel", onWheel, { passive: false });

        return () => {
            wrap.removeEventListener("mousemove", onMove);
            wrap.removeEventListener("mousedown", onMouseDown);
            wrap.removeEventListener("mouseup", onMouseUp);
            wrap.removeEventListener("contextmenu", onContextMenu);
            wrap.removeEventListener("mouseleave", onLeave);
            wrap.removeEventListener("wheel", onWheel);
        };
    }, []);

    // Keyboard events
    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;

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

        function onKeyDown(e) {
            if (isEditable(e.target)) return;

            if (e.key === "Escape") {
                e.preventDefault();
                reset();
            } else if (e.key === "Alt" && !mouseDownRef.current) {
                e.preventDefault();
                setAltDown(true);
            } else if (placingRef.current.length > 0) {
                if (e.key === "r" || e.key === "R") {
                    e.preventDefault();
                    gRotRef.current = (gRotRef.current + 90) % 360;
                    computeGhost(placingRef.current, gRotRef.current);
                } else if (e.key === "Enter") {
                    e.preventDefault();
                    const g = computeGhost(placingRef.current, gRotRef.current);
                    if (g.can) placeOne(g);
                }
            } else if (selectedRef.current.length > 0) {
                if (e.key === "Delete" || e.key === "Backspace") {
                    e.preventDefault();
                    setPlaced((p) => {
                        const items = p.filter(
                            (item) =>
                                !selectedRef.current.some(
                                    (it) => it.id === item.id
                                )
                        );
                        placedRef.current = items;
                        return items;
                    });
                    setSelected([]);
                } else if (e.ctrlKey || e.metaKey) {
                    if (e.key === "c" || e.key === "C") {
                        e.preventDefault();
                        const candidate = selectedRef.current.map((it) => ({
                            b: it.b,
                            x: it.x,
                            y: it.y,
                            color: it.color,
                            radius: it.radius,
                            influenceRange: it.influenceRange,
                            direction: it.direction,
                        }));
                        setPlacing(candidate);
                        computeGhost(candidate, gRotRef.current);
                        setSelected([]);
                    } else if (e.key === "x" || e.key === "X") {
                        e.preventDefault();
                        const candidate = selectedRef.current.map((it) => ({
                            b: it.b,
                            x: it.x,
                            y: it.y,
                            color: it.color,
                            radius: it.radius,
                            influenceRange: it.influenceRange,
                            direction: it.direction,
                        }));
                        setPlacing(candidate);
                        computeGhost(candidate, gRotRef.current);
                        setPlaced((p) => {
                            const items = p.filter(
                                (item) =>
                                    !selectedRef.current.some(
                                        (it) => it.id === item.id
                                    )
                            );
                            placedRef.current = items;
                            return items;
                        });
                        setSelected([]);
                    }
                }
            }
        }

        function onKeyUp(e) {
            if (e.key === "Alt") {
                setAltDown(false);
            }
        }

        window.addEventListener("keydown", onKeyDown);
        window.addEventListener("keyup", onKeyUp);

        return () => {
            window.removeEventListener("keydown", onKeyDown);
            window.removeEventListener("keyup", onKeyUp);
        };
    }, []);

    function reset() {
        setPlacing([]);
        setSelected([]);
        setGhost((g) => ({ ...g, visible: false }));
        gRotRef.current = 0;
    }

    function getWorldPos(x, y) {
        const wrap = wrapRef.current;
        if (!wrap) return { x: 0, y: 0 };
        const rect = wrap.getBoundingClientRect();
        const worldX = (x - rect.left + wrap.scrollLeft) / zoomRef.current;
        const worldY = (y - rect.top + wrap.scrollTop) / zoomRef.current;
        return { x: worldX, y: worldY };
    }

    function computeGhost(items, rot = 0) {
        const wrap = wrapRef.current;
        if (!wrap) {
            const hidden = (g) => ({ ...g, visible: false });
            setGhost(hidden);
            ghostRef.current = hidden(ghostRef.current);
            return ghostRef.current;
        }

        const worldPos = getWorldPos(lastMouse.current.x, lastMouse.current.y);
        const worldX = worldPos.x;
        const worldY = worldPos.y;

        const { minX, minY, maxX, maxY } = boundingBox(items);

        const gSwap = rot % 180 !== 0;
        const rotation = Math.floor(rot / 90);
        const gW = gSwap ? maxY - minY : maxX - minX;
        const gH = gSwap ? maxX - minX : maxY - minY;
        const offX = (gW / 2) % TILE;
        const offY = (gH / 2) % TILE;

        const centerX1 = Math.round((worldX - offX) / TILE) * TILE + offX;
        const centerY1 = Math.round((worldY - offY) / TILE) * TILE + offY;
        const x = centerX1 - gW / 2;
        const y = centerY1 - gH / 2;

        const inBounds =
            x >= 0 && y >= 0 && x + gW <= GRID_W && y + gH <= GRID_H;

        const centerX0 = (minX + maxX) / 2;
        const centerY0 = (minY + maxY) / 2;

        let candidate = [];
        let blocked = false;

        for (const it of items) {
            const wb = it.b?.BuildBlocker?.x || 1;
            const hb = it.b?.BuildBlocker?.z || 1;

            const swap0 = it.direction % 180 !== 0;
            const w0 = (swap0 ? hb : wb) * TILE;
            const h0 = (swap0 ? wb : hb) * TILE;

            const icx0 = it.x + w0 / 2;
            const icy0 = it.y + h0 / 2;
            const ox = icx0 - centerX0;
            const oy = icy0 - centerY0;

            let rx = ox;
            let ry = oy;
            if (rotation === 1) {
                rx = -oy;
                ry = ox;
            } else if (rotation === 2) {
                rx = -ox;
                ry = -oy;
            } else if (rotation === 3) {
                rx = oy;
                ry = -ox;
            }

            const swap1 = (it.direction + rot) % 180 !== 0;
            const w1 = (swap1 ? hb : wb) * TILE;
            const h1 = (swap1 ? wb : hb) * TILE;

            const icx1 = centerX1 + rx;
            const icy1 = centerY1 + ry;
            const xb = icx1 - w1 / 2;
            const yb = icy1 - h1 / 2;

            candidate.push({
                b: it.b,
                x: xb,
                y: yb,
                w: w1,
                h: h1,
                color: it.color,
                radius: it.radius,
                influenceRange: it.influenceRange,
                direction: (it.direction + rot) % 360,
            });

            if (
                placedRef.current.some((i) => {
                    const roadCross =
                        i.b?.Identifier !== it.b?.Identifier &&
                        it.b?.Road &&
                        i.b?.Road;
                    return (
                        aabbIntersects(
                            { x: xb, y: yb, w: w1, h: h1 },
                            {
                                x: i.x,
                                y: i.y,
                                w: i.w,
                                h: i.h,
                            }
                        ) && !roadCross
                    );
                })
            ) {
                blocked = true;
            }
        }

        const nextGhost = {
            visible: true,
            x,
            y,
            w: gW,
            h: gH,
            candidate,
            can: !blocked && inBounds,
        };
        setGhost(nextGhost);
        ghostRef.current = nextGhost;
        return nextGhost;
    }

    function computeSelection() {
        const wrap = wrapRef.current;
        if (!wrap) return [];

        const startPos = getWorldPos(
            selectStart.current.x,
            selectStart.current.y
        );
        const worldPos = getWorldPos(lastMouse.current.x, lastMouse.current.y);

        const candidate = {
            x: Math.min(startPos.x, worldPos.x),
            y: Math.min(startPos.y, worldPos.y),
            w: Math.abs(worldPos.x - startPos.x),
            h: Math.abs(worldPos.y - startPos.y),
        };

        return placedRef.current.filter((it) =>
            aabbIntersects(candidate, {
                x: it.x,
                y: it.y,
                w: it.w,
                h: it.h,
            })
        );
    }

    function placeOne(g) {
        setPlaced((p) => {
            const additions = g.candidate.map((it) => ({
                id: crypto.randomUUID(),
                b: it.b,
                x: it.x,
                y: it.y,
                w: it.w,
                h: it.h,
                color: it.color,
                radius: it.radius,
                influenceRange: it.influenceRange,
                direction: it.direction,
            }));
            const items = p.concat(additions);
            placedRef.current = items;
            return items;
        });
    }

    const placingActive = placing.length > 0;
    const canSelect = !placingActive && !altDown;

    return (
        <div
            className={
                altDown
                    ? mouseDown
                        ? "canvas-wrap grabbing"
                        : "canvas-wrap grab"
                    : "canvas-wrap"
            }
            ref={wrapRef}
        >
            <svg
                id="main-svg"
                width={GRID_W * zoom}
                height={GRID_H * zoom}
                style={{
                    transformOrigin: "0 0",
                    display: "block",
                    background: "#fff",
                }}
                viewBox={`0 0 ${GRID_W} ${GRID_H}`}
            >
                <defs>
                    <pattern
                        id="grid"
                        width={TILE}
                        height={TILE}
                        patternUnits="userSpaceOnUse"
                    >
                        <path
                            d={`M ${TILE} 0 L 0 0 0 ${TILE}`}
                            stroke="#e5e7eb"
                            strokeWidth="1"
                            fill="none"
                            vectorEffect="non-scaling-stroke"
                        />
                    </pattern>
                </defs>
                <rect width={GRID_W} height={GRID_H} fill="url(#grid)" />
                <g>
                    {unselectedPlaced.map((it) => (
                        <PlacedBlock
                            key={it.id}
                            item={it}
                            schemeColors={schemeColors}
                            canSelect={canSelect}
                            onSelect={handleSelect}
                            cross={!!it.__cross}
                        />
                    ))}

                    {selectedPlaced.map((it) => (
                        <SelectedBlock
                            key={it.id}
                            item={it}
                            schemeColors={schemeColors}
                            placingActive={placingActive}
                        />
                    ))}

                    {placingActive &&
                        ghost.visible &&
                        ghost.candidate.map((it, idx) => (
                            <PlacingBlock
                                key={idx}
                                item={it}
                                ghostCan={ghost.can}
                                schemeColors={schemeColors}
                            />
                        ))}
                </g>

                {mouseDown &&
                    !altDown &&
                    !placingActive &&
                    (() => {
                        const startPos = getWorldPos(
                            selectStart.current.x,
                            selectStart.current.y
                        );
                        const worldPos = getWorldPos(
                            lastMouse.current.x,
                            lastMouse.current.y
                        );
                        return (
                            <rect
                                x={Math.min(startPos.x, worldPos.x)}
                                y={Math.min(startPos.y, worldPos.y)}
                                width={Math.abs(startPos.x - worldPos.x)}
                                height={Math.abs(startPos.y - worldPos.y)}
                                fill="rgba(0, 98, 255, 0.3)"
                                stroke="#0062ffff"
                                strokeWidth={1}
                                vectorEffect="non-scaling-stroke"
                                pointerEvents="none"
                            />
                        );
                    })()}
            </svg>
        </div>
    );
}
