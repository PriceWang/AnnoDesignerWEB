/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:48:16
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-11-26 13:28:08
 * @FilePath: /AnnoDesignerWEB/src/components/Sidebar.jsx
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */
function Sidebar({
    presets,
    treeLoc,
    colors,
    loc,
    placing,
    setPlacing,
    setSelected,
    setPlaceMode,
}) {
    const [filterText, setFilterText] = useState("");
    const [collapsed, setCollapsed] = useState({});
    const [version, setVersion] = useState(null);

    const buildings = presets?.Buildings ?? [];
    const languages = treeLoc?.languages ?? {};
    const schemeColors = colors?.AvailableSchemes[0].Colors ?? [];
    if (!buildings || !languages) return <div className="sidebar" />;

    // ---- versions: restrict to (1404/2070/2205/1800) ----
    const allowedVersions = ["1404", "2070", "2205", "1800"];
    const headers = useMemo(() => {
        const set = new Set(
            buildings
                .map((b) => b.Header || "")
                .filter((h) => allowedVersions.some((a) => h.includes(a)))
        );
        return Array.from(set).sort((a, b) =>
            String(a).localeCompare(String(b))
        );
    }, [buildings]);

    const currentTreeLoc = languages[loc];
    if (!currentTreeLoc) return <div className="sidebar" />;

    const currentVersion =
        version && headers.includes(version) ? version : "(A7) Anno 1800";

    // ---- Build: Faction -> { rootItems (no group), groups {name -> items[]} } for selected version ----
    const tree = useMemo(() => {
        const items = buildings.filter((b) => b.Header === currentVersion);
        const facMap = {};

        const sortByName = (a, b) =>
            (a.Localization?.[loc] || a.Localization?.eng || "").localeCompare(
                b.Localization?.[loc] ||
                    b.Localization?.eng ||
                    b.Identifier ||
                    ""
            );
        for (const b of items) {
            const fac = currentTreeLoc[b.Faction.replace(/\s+/g, "")];
            if (!fac) continue;
            const group = currentTreeLoc[(b.Group ?? "").replace(/\s+/g, "")];
            if (!facMap[fac]) facMap[fac] = { root: [], groups: {} };
            group
                ? (facMap[fac].groups[group] ||= []).push(b)
                : facMap[fac].root.push(b);
        }
        for (const fac of Object.keys(facMap)) {
            facMap[fac].root.sort(sortByName);
            for (const g of Object.keys(facMap[fac].groups))
                facMap[fac].groups[g].sort(sortByName);
        }
        const orderGroups = (names) =>
            names.sort((a, b) => {
                const ma = a.match(/^\(\s*(\d+)\s*\)/);
                const mb = b.match(/^\(\s*(\d+)\s*\)/);
                if (ma && mb) return +ma[1] - +mb[1];
                if (ma) return -1;
                if (mb) return 1;
                return a.localeCompare(b);
            });
        return { facMap, facNames: Object.keys(facMap).sort(), orderGroups };
    }, [currentVersion, loc, buildings, currentTreeLoc]);

    useEffect(() => {
        const next = {};
        for (const fac of tree.facNames) {
            const fid = `f::${currentVersion}::${fac}`;
            next[fid] = collapsed?.[fid] ?? true;
            for (const g of Object.keys(tree.facMap[fac].groups || {})) {
                const gid = `g::${currentVersion}::${fac}::${g}`;
                next[gid] = collapsed?.[gid] ?? true;
            }
        }
        setCollapsed(next);
    }, [currentVersion, loc, tree]);

    // ---- filter helper ----
    const filterList = useCallback(
        (arr) => {
            if (!filterText) return arr;
            const lower = filterText.toLowerCase();
            return arr.filter((b) => {
                const name =
                    b.Localization?.[loc] ||
                    b.Localization?.eng ||
                    b.Identifier ||
                    "";
                return name.toLowerCase().includes(lower);
            });
        },
        [filterText, loc]
    );

    const filteredBuildings = useMemo(() => {
        const filtered = filterList(
            buildings.filter((b) => b.Header === currentVersion)
        );
        return filtered;
    }, [currentVersion, filterList]);

    const handlePick = useCallback(
        (b) => {
            setPlacing(b);
            setSelected([]);
            setPlaceMode("continuous");
        },
        [setPlacing, setSelected, setPlaceMode]
    );

    const CollapsibleGroup = ({
        title,
        count,
        isCollapsed,
        onToggle,
        children,
    }) => (
        <div className="group">
            <div className="group-title" onClick={onToggle}>
                <div>{title}</div>
                <div className="badge">{count}</div>
            </div>
            {!isCollapsed && <div>{children}</div>}
        </div>
    );

    function PaletteItem({ b, active, onPick, loc }) {
        const name = b.Localization?.[loc] || b.Localization?.eng || "Unknown";
        const icon = b.IconFileName ? `./assets/icons/${b.IconFileName}` : null;
        const itemClass = `item${active ? " active" : ""}`;

        const IMG = icon ? (
            <img src={icon} />
        ) : (
            <div
                style={{
                    width: "25%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <img
                    style={{
                        backgroundColor: annoColorCSS(b, null, schemeColors),
                        width: "70%",
                    }}
                />
            </div>
        );
        return (
            <div className={itemClass} onClick={onPick} title={name}>
                {IMG}
                <span>{name}</span>
            </div>
        );
    }

    // ---- render ----
    return (
        <div className="sidebar">
            <div className="header">
                <input
                    id="sidebar-search"
                    className="search"
                    placeholder="搜索"
                    value={filterText}
                    onChange={(e) => setFilterText(e.target.value.trimStart())}
                />
                <select
                    id="version-select"
                    className="version-select"
                    value={currentVersion || ""}
                    onChange={(e) => setVersion(e.target.value)}
                >
                    {headers.map((h) => (
                        <option key={h} value={h}>
                            {String(h).slice(4)}
                        </option>
                    ))}
                </select>
            </div>
            {/* Two inline single tiles (no group wrapper) */}
            <div className="tile-items">
                {buildings
                    .filter((b) => b.Header === "Tiles")
                    .map((b) => (
                        <PaletteItem
                            key={b.Identifier}
                            b={b}
                            active={placing?.Identifier === b.Identifier}
                            onPick={() => handlePick(b)}
                            loc={loc}
                        />
                    ))}
            </div>
            {filterText ? (
                <div className="tree" key="search-mode">
                    <div className="group">
                        <div className="items">
                            {filteredBuildings.map((b) => {
                                return (
                                    <PaletteItem
                                        key={b.Identifier}
                                        b={b}
                                        active={
                                            placing?.Identifier === b.Identifier
                                        }
                                        onPick={() => handlePick(b)}
                                        loc={loc}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="tree" key="tree-mode">
                    {tree.facNames.map((fac) => {
                        const fid = `f::${currentVersion}::${fac}`;
                        const isFacCollapsed = collapsed?.[fid] ?? true;
                        const groupNames = tree.orderGroups(
                            Object.keys(tree.facMap[fac].groups || {})
                        );
                        const rootShown = tree.facMap[fac].root;
                        const groupTotals = groupNames.reduce(
                            (acc, group) =>
                                acc + tree.facMap[fac].groups[group].length,
                            0
                        );
                        const count = rootShown.length + groupTotals;
                        return (
                            <CollapsibleGroup
                                key={fid}
                                title={fac}
                                count={count}
                                isCollapsed={isFacCollapsed}
                                onToggle={() =>
                                    setCollapsed((s) => ({
                                        ...s,
                                        [fid]: !isFacCollapsed,
                                    }))
                                }
                            >
                                {rootShown.length > 0 && (
                                    <div className="items">
                                        {rootShown.map((b) => (
                                            <PaletteItem
                                                key={b.Identifier}
                                                b={b}
                                                active={
                                                    placing?.Identifier ===
                                                    b.Identifier
                                                }
                                                onPick={() => handlePick(b)}
                                                loc={loc}
                                            />
                                        ))}
                                    </div>
                                )}
                                {groupNames.map((group) => {
                                    const gid = `g::${currentVersion}::${fac}::${group}`;
                                    const isGCollapsed =
                                        collapsed?.[gid] ?? true;
                                    const arr = tree.facMap[fac].groups[group];
                                    if (!arr.length) return null;
                                    return (
                                        <CollapsibleGroup
                                            key={gid}
                                            title={group}
                                            count={arr.length}
                                            isCollapsed={isGCollapsed}
                                            onToggle={() =>
                                                setCollapsed((s) => ({
                                                    ...s,
                                                    [gid]: !isGCollapsed,
                                                }))
                                            }
                                        >
                                            <div className="items">
                                                {arr.map((b) => (
                                                    <PaletteItem
                                                        key={b.Identifier}
                                                        b={b}
                                                        active={
                                                            placing?.Identifier ===
                                                            b.Identifier
                                                        }
                                                        onPick={() => {
                                                            setPlacing(b);
                                                            setSelected([]);
                                                            setPlaceMode(
                                                                "continuous"
                                                            );
                                                        }}
                                                        loc={loc}
                                                    />
                                                ))}
                                            </div>
                                        </CollapsibleGroup>
                                    );
                                })}
                            </CollapsibleGroup>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

window.Sidebar = Sidebar;
