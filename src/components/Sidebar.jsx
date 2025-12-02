/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:48:16
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-12-02 13:14:08
 * @FilePath: /AnnoDesignerWEB/src/components/Sidebar.jsx
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */

const ALLOWED_VERSIONS = ["1404", "2070", "2205", "1800"];
const DEFAULT_VERSION_HEADER = "(A7) Anno 1800";

// collapsible group
function CollapsibleGroup({ title, count, isCollapsed, onToggle, children }) {
    return (
        <div className="group">
            <div className="group-title" onClick={onToggle}>
                <div>{title}</div>
                <div className="badge">{count}</div>
            </div>
            {!isCollapsed && <div>{children}</div>}
        </div>
    );
}

// palette item
function PaletteItem({ b, active, onPick, loc, schemeColors }) {
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

function Sidebar({
    presets,
    treeLoc,
    colors,
    loc,
    placing,
    setPlacing,
    setSelected,
}) {
    const [filterText, setFilterText] = useState("");
    const [collapsed, setCollapsed] = useState({});
    const [version, setVersion] = useState(null);

    const buildings = presets?.Buildings ?? [];
    const languages = treeLoc?.languages ?? {};
    const schemeColors = colors?.AvailableSchemes?.[0]?.Colors ?? [];

    if (!buildings || !languages) return <div className="sidebar" />;

    const currentTreeLoc = languages[loc];
    if (!currentTreeLoc) return <div className="sidebar" />;

    // version list: only keep 1404/2070/2205/1800
    const headers = useMemo(() => {
        const set = new Set(
            buildings
                .map((b) => b.Header || "")
                .filter((h) => ALLOWED_VERSIONS.some((a) => h.includes(a)))
        );
        return Array.from(set).sort((a, b) =>
            String(a).localeCompare(String(b))
        );
    }, [buildings]);

    // current version header
    const currentVersion = useMemo(() => {
        if (version && headers.includes(version)) return version;
        // default fallback to 1800
        return DEFAULT_VERSION_HEADER;
    }, [version, headers]);

    // all buildings of current version
    const buildingsOfCurrentVersion = useMemo(
        () => buildings.filter((b) => b.Header === currentVersion),
        [buildings, currentVersion]
    );

    // Faction -> { root, groups } tree structure
    const tree = useMemo(() => {
        const items = buildingsOfCurrentVersion;
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

            if (group) {
                (facMap[fac].groups[group] ||= []).push(b);
            } else {
                facMap[fac].root.push(b);
            }
        }

        for (const fac of Object.keys(facMap)) {
            facMap[fac].root.sort(sortByName);
            for (const g of Object.keys(facMap[fac].groups)) {
                facMap[fac].groups[g].sort(sortByName);
            }
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

        return {
            facMap,
            facNames: Object.keys(facMap).sort(),
            orderGroups,
        };
    }, [buildingsOfCurrentVersion, currentTreeLoc, loc]);

    // initialize / update collapsed state (on version / language change)
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
    }, [currentVersion, tree, collapsed]);

    // search filter function
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

    // buildings list in search mode
    const filteredBuildings = useMemo(
        () => filterList(buildingsOfCurrentVersion),
        [filterList, buildingsOfCurrentVersion]
    );

    // whether there is a unique placing candidate for highlighting
    const activeIdentifier =
        placing?.length === 1 ? placing[0].b.Identifier : null;

    const handlePick = useCallback(
        (b) => {
            setPlacing([{ x: 0, y: 0, b, r: 0 }]);
            setSelected([]);
        },
        [setPlacing, setSelected]
    );

    // Tiles version (always shown separately)
    const tilesBuildings = useMemo(
        () => buildings.filter((b) => b.Header === "Tiles"),
        [buildings]
    );

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

            {/* Two inline separate tile categories (not under faction/group) */}
            <div className="tile-items">
                {tilesBuildings.map((b) => (
                    <PaletteItem
                        key={b.Identifier}
                        b={b}
                        active={activeIdentifier === b.Identifier}
                        onPick={() => handlePick(b)}
                        loc={loc}
                        schemeColors={schemeColors}
                    />
                ))}
            </div>

            {filterText ? (
                // search mode: flat list
                <div className="tree" key="search-mode">
                    <div className="group">
                        <div className="items">
                            {filteredBuildings.map((b) => (
                                <PaletteItem
                                    key={b.Identifier}
                                    b={b}
                                    active={activeIdentifier === b.Identifier}
                                    onPick={() => handlePick(b)}
                                    loc={loc}
                                    schemeColors={schemeColors}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                // tree mode: Faction / Group collapsible
                <div className="tree" key="tree-mode">
                    {tree.facNames.map((fac) => {
                        const fid = `f::${currentVersion}::${fac}`;
                        const isFacCollapsed = collapsed?.[fid] ?? true;

                        const groupNames = tree.orderGroups(
                            Object.keys(tree.facMap[fac].groups || {})
                        );
                        const rootItems = tree.facMap[fac].root;
                        const groupTotals = groupNames.reduce(
                            (acc, group) =>
                                acc + tree.facMap[fac].groups[group].length,
                            0
                        );
                        const count = rootItems.length + groupTotals;

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
                                {rootItems.length > 0 && (
                                    <div className="items">
                                        {rootItems.map((b) => (
                                            <PaletteItem
                                                key={b.Identifier}
                                                b={b}
                                                active={
                                                    activeIdentifier ===
                                                    b.Identifier
                                                }
                                                onPick={() => handlePick(b)}
                                                loc={loc}
                                                schemeColors={schemeColors}
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
                                                            activeIdentifier ===
                                                            b.Identifier
                                                        }
                                                        onPick={() =>
                                                            handlePick(b)
                                                        }
                                                        loc={loc}
                                                        schemeColors={
                                                            schemeColors
                                                        }
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
