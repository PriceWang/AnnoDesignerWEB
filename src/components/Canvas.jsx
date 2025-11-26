/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:50:50
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-11-26 16:46:24
 * @FilePath: /AnnoDesignerWEB/src/components/Canvas.jsx
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */
function Canvas({
    colors,
    zoom,
    setZoom,
    placing,
    setPlacing,
    placeMode,
    setPlaceMode,
    placed,
    setPlaced,
    selected,
    setSelected,
}) {
    const schemeColors = colors?.AvailableSchemes[0].Colors || [];

    const [ghost, setGhost] = useState({
        visible: false,
        x: 0,
        y: 0,
        w: 0,
        h: 0,
        can: false,
    });
    const [gRot, setGRot] = useState(0);
    const [altDown, setAltDown] = useState(false);
    const [mouseDown, setMouseDown] = useState(false);

    const wrapRef = useRef(null);
    const lastMouse = useRef({ x: 0, y: 0 });

    const pendingScrollRef = useRef(null);
    const zoomRef = useRef(zoom);
    const placingRef = useRef(placing);
    // const placeModeRef = useRef(placeMode);
    const placedRef = useRef(placed);
    const ghostRef = useRef(ghost);
    const gRotRef = useRef(gRot);
    const altDownRef = useRef(altDown);
    const mouseDownRef = useRef(mouseDown);
    const panStart = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
    const selectStart = useRef({ x: 0, y: 0 });

    useEffect(() => {
        placingRef.current = placing;
    }, [placing]);
    // useEffect(() => {
    //     placeModeRef.current = placeMode;
    // }, [placeMode]);
    useEffect(() => {
        placedRef.current = placed;
    }, [placed]);
    useEffect(() => {
        gRotRef.current = gRot;
    }, [gRot]);
    useEffect(() => {
        altDownRef.current = altDown;
    }, [altDown]);
    useEffect(() => {
        mouseDownRef.current = mouseDown;
    }, [mouseDown]);

    // zoom with mouse wheel
    useEffect(() => {
        zoomRef.current = zoom;
        const wrap = wrapRef.current;
        const p = pendingScrollRef.current;
        if (!wrap || !p) return;
        const maxL = wrap.scrollWidth - wrap.clientWidth;
        const maxT = wrap.scrollHeight - wrap.clientHeight;
        wrap.scrollLeft = clamp(p.left, 0, Math.max(0, maxL));
        wrap.scrollTop = clamp(p.top, 0, Math.max(0, maxT));
        pendingScrollRef.current = null;
    }, [zoom]);

    // mouse event:
    // placing: ghost with move, place with move, right click deselect
    // panning: alt+drag to pan
    // select: empty click deselect, right click deselect
    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        function onMove(e) {
            lastMouse.current.x = e.clientX;
            lastMouse.current.y = e.clientY;
            // panning has first priority
            if (altDownRef.current && mouseDownRef.current) {
                wrap.scrollLeft =
                    panStart.current.sx -
                    (lastMouse.current.x - panStart.current.x);
                wrap.scrollTop =
                    panStart.current.sy - (e.clientY - panStart.current.y);
            } else if (placingRef.current) {
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
            }
            // placed items have original events
            if (e.target.closest("[data-placed]")) return;
            setMouseDown(true);
            // panning has first priority
            if (altDownRef.current) {
                panStart.current = {
                    x: lastMouse.current.x,
                    y: lastMouse.current.y,
                    sx: wrap.scrollLeft,
                    sy: wrap.scrollTop,
                };
            } else if (placingRef.current) {
                const g = computeGhost(placingRef.current, gRotRef.current);
                if (g.can) placeOne(g);
            } else if (!e.target.closest("[data-placed]")) {
                // deselect when clicking on empty space
                setSelected([]);
                selectStart.current = {
                    x: lastMouse.current.x,
                    y: lastMouse.current.y,
                };
            }
            // if (placeModeRef.current === "once") {
            //     setPlacing(null);
            //     setPlaceMode("none");
            //     setGhost((g) => ({ ...g, visible: false }));
            // }
        }
        function onMouseUp(e) {
            if (e.button !== 0) return;
            setMouseDown(false);
        }
        function onContextMenu(e) {
            e.preventDefault();
            setPlacing(null);
            setPlaceMode("none");
            setGhost((g) => ({ ...g, visible: false }));
            setSelected([]);
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

    // event key: escape to cancel selecting/placing
    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        function onKeyDown(e) {
            if (e.key === "Escape") {
                setPlacing(null);
                setPlaceMode("none");
                setGhost((g) => ({ ...g, visible: false }));
            }
        }
        window.addEventListener("keydown", onKeyDown);
        return () => {
            window.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    // hotkeys: Ctrl/Cmd+C clone-continuous; Ctrl/Cmd+X cut-once; R rotate while placing; Enter disabled
    useEffect(() => {
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
        function onKey(e) {
            if (isEditable(e.target)) return;
            const mod = e.ctrlKey || e.metaKey;
            if (mod && selected) {
                if (e.key === "c" || e.key === "C") {
                    e.preventDefault();
                    e.stopPropagation();
                    setPlacing(selected.b);
                    setPlaceMode("continuous");
                    setSelected([]);
                    setGRot(selected.rot || 0);
                    computeGhost(selected.b, selected.rot || 0);
                } else if (e.key === "x" || e.key === "X") {
                    e.preventDefault();
                    e.stopPropagation();
                    setPlaced((p) => p.filter((a) => a.id !== selected.id));
                    setPlacing(selected.b);
                    setPlaceMode("once");
                    setSelected([]);
                    setGRot(selected.rot || 0);
                    computeGhost(selected.b, selected.rot || 0);
                }
            }
            if ((e.key === "r" || e.key === "R") && placingRef.current) {
                e.preventDefault();
                e.stopPropagation();
                const nr = (gRotRef.current + 90) % 360;
                setGRot(nr);
                computeGhost(placingRef.current, nr);
            }
            if (e.key === "Enter") {
                e.preventDefault();
            }
            if (selected && e.key === "Delete") {
                setPlaced((arr) =>
                    arr.filter((a) => !selected.some((s) => s.id === a.id))
                );
                setSelected([]);
            }
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [selected]);

    // alt key => toggle 'grab' on canvas
    useEffect(() => {
        const wrap = wrapRef.current;
        if (!wrap) return;
        function onKeyDown(e) {
            if (e.key === "Alt" && !mouseDownRef.current) {
                setAltDown(true);
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

    function getWorldPos(x, y) {
        const wrap = wrapRef.current;
        if (!wrap) return { x: 0, y: 0 };
        const rect = wrap.getBoundingClientRect();
        const worldX = (x - rect.left + wrap.scrollLeft) / zoomRef.current;
        const worldY = (y - rect.top + wrap.scrollTop) / zoomRef.current;
        return { x: worldX, y: worldY };
    }
    function aabbIntersects(a, b) {
        return !(
            a.x + a.w <= b.x ||
            b.x + b.w <= a.x ||
            a.y + a.h <= b.y ||
            b.y + b.h <= a.y
        );
    }
    function computeGhost(b, rot) {
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
        const wt = b.BuildBlocker?.x || 1;
        const ht = b.BuildBlocker?.z || 1;
        const swap = rot % 180 !== 0;
        const wTiles = (swap ? ht : wt) * TILE;
        const hTiles = (swap ? wt : ht) * TILE;
        const offX = (wTiles / 2) % TILE;
        const offY = (hTiles / 2) % TILE;
        const centerX = Math.round((worldX - offX) / TILE) * TILE + offX;
        const centerY = Math.round((worldY - offY) / TILE) * TILE + offY;
        const x = centerX - wTiles / 2;
        const y = centerY - hTiles / 2;
        const inBounds =
            x >= 0 && y >= 0 && x + wTiles <= GRID_W && y + hTiles <= GRID_H;
        const candidate = { x, y, w: wTiles, h: hTiles };
        const blocked = placedRef.current.some((it) => {
            const roadCross =
                it.b?.Identifier !== b.Identifier && b.Road && it.b?.Road;
            return (
                aabbIntersects(candidate, {
                    x: it.x,
                    y: it.y,
                    w: it.w,
                    h: it.h,
                }) && !roadCross
            );
        });
        const nextGhost = {
            visible: true,
            ...candidate,
            can: !blocked && inBounds,
        };
        setGhost(nextGhost);
        ghostRef.current = nextGhost;
        return nextGhost;
    }
    function computeSelection() {
        const wrap = wrapRef.current;
        if (!wrap) {
            return [];
        }
        const startPos = getWorldPos(
            selectStart.current.x,
            selectStart.current.y
        );
        const startX = startPos.x;
        const startY = startPos.y;
        const worldPos = getWorldPos(lastMouse.current.x, lastMouse.current.y);
        const worldX = worldPos.x;
        const worldY = worldPos.y;
        const candidate = {
            x: Math.min(startX, worldX),
            y: Math.min(startY, worldY),
            w: Math.abs(worldX - startX),
            h: Math.abs(worldY - startY),
        };
        const newSelected = placedRef.current.filter((it) =>
            aabbIntersects(candidate, {
                x: it.x,
                y: it.y,
                w: it.w,
                h: it.h,
            })
        );
        return newSelected;
    }

    function placeOne(ghost) {
        setPlaced((p) => {
            const next = [
                ...p,
                {
                    id: crypto.randomUUID(),
                    b: placingRef.current,
                    x: ghost.x,
                    y: ghost.y,
                    w: ghost.w,
                    h: ghost.h,
                    rot: gRotRef.current,
                },
            ];
            placedRef.current = next;
            return next;
        });
    }

    function Influence({ b, cx, cy }) {
        const r = Math.abs(b.InfluenceRadius || 0) * TILE;
        const d = Math.abs(b.InfluenceRange || 0) * TILE;
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

    function Placing({ b }) {
        const wb = b.BuildBlocker?.x || 1;
        const hb = b.BuildBlocker?.z || 1;
        const swap = gRot % 180 !== 0;
        const wTiles = (swap ? hb : wb) * TILE;
        const hTiles = (swap ? wb : hb) * TILE;
        const cx = ghost.x + ghost.w / 2;
        const cy = ghost.y + ghost.h / 2;
        return (
            <g
                transform={`
                    translate(${cx}, ${cy})
                    translate(${-wTiles / 2}, ${-hTiles / 2})
                `}
                pointerEvents="none"
            >
                {b.IconFileName && (
                    <image
                        href={"./assets/icons/" + b.IconFileName}
                        x={wTiles * 0.1}
                        y={hTiles * 0.1}
                        width={wTiles * 0.8}
                        height={hTiles * 0.8}
                        preserveAspectRatio="xMidYMid meet"
                        opacity={ghost.can ? 1 : 0.5}
                    />
                )}
                <rect
                    x="0"
                    y="0"
                    width={wTiles}
                    height={hTiles}
                    fill={
                        ghost.can
                            ? annoColorCSS(b, 0.3, schemeColors)
                            : "rgba(255, 0, 0, 0.3)"
                    }
                    stroke={
                        ghost.can ? "rgba(0,0,255,0.5)" : "rgba(255,0,0,0.5)"
                    }
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                />
                <Influence b={b} cx={wTiles / 2} cy={hTiles / 2} />
            </g>
        );
    }

    function Placed({ it }) {
        const wt = it.b.BuildBlocker?.x || 1;
        const ht = it.b.BuildBlocker?.z || 1;
        const swap = it.rot % 180 !== 0;
        const wTiles = (swap ? ht : wt) * TILE;
        const hTiles = (swap ? wt : ht) * TILE;
        const cx = it.x + wTiles / 2;
        const cy = it.y + hTiles / 2;
        const canSelect = !placing && !altDown;
        return (
            <g
                data-placed="1"
                transform={`
                    translate(${cx}, ${cy})
                    translate(${-wTiles / 2}, ${-hTiles / 2})
                `}
                onClick={
                    canSelect ? () => setSelected([...selected, it]) : undefined
                }
                pointerEvents={canSelect ? "auto" : "none"}
            >
                <rect
                    x="0"
                    y="0"
                    width={wTiles}
                    height={hTiles}
                    fill={annoColorCSS(it.b, null, schemeColors) || "none"}
                    stroke="#000"
                    strokeWidth={it.b.Borderless ? 0 : 1}
                    vectorEffect="non-scaling-stroke"
                />
                {it.b.IconFileName && (
                    <image
                        href={"./assets/icons/" + it.b.IconFileName}
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

    function Selected({ it }) {
        const wt = it.b.BuildBlocker?.x || 1;
        const ht = it.b.BuildBlocker?.z || 1;
        const swap = it.rot % 180 !== 0;
        const wTiles = (swap ? ht : wt) * TILE;
        const hTiles = (swap ? wt : ht) * TILE;
        const cx = it.x + wTiles / 2;
        const cy = it.y + hTiles / 2;
        return (
            <g
                data-placed="1"
                transform={`
                translate(${cx}, ${cy})
                translate(${-wTiles / 2}, ${-hTiles / 2})
            `}
                pointerEvents={placing ? "none" : "auto"}
            >
                <rect
                    x="0"
                    y="0"
                    width={wTiles}
                    height={hTiles}
                    fill={annoColorCSS(it.b, 1, schemeColors) || "none"}
                    stroke={"#0062ffff"}
                    strokeWidth={2}
                    vectorEffect="non-scaling-stroke"
                />
                {it.b.IconFileName && (
                    <image
                        href={"./assets/icons/" + it.b.IconFileName}
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
                {<Influence b={it.b} cx={wTiles / 2} cy={hTiles / 2} />}
            </g>
        );
    }

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
                    {placed
                        .filter((it) => !selected.includes(it))
                        .map((it) => (
                            <Placed it={it} />
                        ))}
                    {placed
                        .filter((it) => selected.includes(it))
                        .map((it) => (
                            <Selected it={it} />
                        ))}
                    {placing && ghost.visible && <Placing b={placing} />}
                </g>
                {mouseDown &&
                    !altDown &&
                    !placing &&
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

window.Canvas = Canvas;
