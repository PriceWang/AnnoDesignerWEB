/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:48:16
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-12-16 16:23:05
 * @FilePath: /AnnoDesignerWEB/src/components/Toolbar.jsx
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */

function Toolbar({ presets, webLoc, loc, setLoc, placed, setPlaced }) {
    const languages = webLoc?.languages || {};
    const [windowOpen, setWindowOpen] = useState(0);

    const toolbarRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (
                windowOpen !== 0 &&
                toolbarRef.current &&
                !toolbarRef.current.contains(e.target)
            ) {
                setWindowOpen(0);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [windowOpen]);

    const togglePanel = (id) => {
        setWindowOpen((prev) => (prev === id ? 0 : id));
    };

    return (
        <div className="toolbar" ref={toolbarRef}>
            <button
                className="button"
                onClick={() => {
                    setPlaced([]);
                    togglePanel(0);
                }}
            >
                <span class="material-symbols-rounded">draft</span>
            </button>
            <label className="button" onClick={() => togglePanel(0)}>
                <span class="material-symbols-rounded">file_open</span>
                <input
                    type="file"
                    accept="application/ad"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        loadJSON(f, setPlaced, presets?.Buildings ?? []);
                        e.target.value = "";
                    }}
                />
            </label>
            <button className="button" onClick={() => exportJSON(placed)}>
                <span class="material-symbols-rounded">save</span>
            </button>
            <button
                className="button"
                onClick={() => {
                    let { minX, minY, maxX, maxY } = boundingBox(placed);
                    minX = Math.max(minX - 10 * TILE, 0);
                    minY = Math.max(minY - 10 * TILE, 0);
                    maxX = Math.min(maxX + 10 * TILE, GRID_W);
                    maxY = Math.min(maxY + 10 * TILE, GRID_H);
                    const svg = document.querySelector("#main-svg");
                    export2PNG(svg, minX, minY, maxX, maxY, 4);
                }}
            >
                <span class="material-symbols-rounded">ios_share</span>
            </button>
            <div className="toolbar-panel-wrap">
                <button className="button" onClick={() => togglePanel(1)}>
                    <span class="material-symbols-rounded">language</span>
                </button>
                {windowOpen === 1 && (
                    <select
                        className="toolbar-panel"
                        value={loc || "eng"}
                        onChange={(e) => {
                            togglePanel(0);
                            setLoc(e.target.value);
                        }}
                    >
                        <option value="eng">English</option>
                        <option value="esp">Español</option>
                        <option value="fra">Français</option>
                        <option value="ger">Deutsch</option>
                        <option value="ita">Italiano</option>
                        <option value="pol">Polski</option>
                        <option value="rus">Русский</option>
                        <option value="zhs">简体中文</option>
                        <option value="zht">繁體中文</option>
                    </select>
                )}
            </div>
            <div className="toolbar-panel-wrap">
                <button className="button" onClick={() => togglePanel(2)}>
                    <span class="material-symbols-rounded">help</span>
                </button>
                {windowOpen === 2 && (
                    <div className="toolbar-panel">
                        <ul>
                            <li>
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)Command"]}
                                </span>{" "}
                                /{" "}
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)Ctrl"]}
                                </span>
                                +
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)C"]}
                                </span>{" "}
                                <span class="desc">
                                    {languages[loc]["(TOOLBAR_DESC)Copy"]}
                                </span>
                            </li>
                            <li>
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)Command"]}
                                </span>{" "}
                                /{" "}
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)Ctrl"]}
                                </span>
                                +
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)X"]}
                                </span>{" "}
                                <span class="desc">
                                    {languages[loc]["(TOOLBAR_DESC)Cut"]}
                                </span>
                            </li>
                            <li>
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)R"]}
                                </span>{" "}
                                <span class="desc">
                                    {languages[loc]["(TOOLBAR_DESC)Rotate"]}
                                </span>
                            </li>
                            <li>
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)LeftClick"]}
                                </span>{" "}
                                <span class="desc">
                                    {languages[loc]["(TOOLBAR_DESC)Place"]}
                                </span>
                            </li>
                            <li>
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)RightClick"]}
                                </span>{" "}
                                /{" "}
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)Esc"]}
                                </span>{" "}
                                <span class="desc">
                                    {languages[loc]["(TOOLBAR_DESC)Exit"]}
                                </span>
                            </li>
                            <li>
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)Alt"]}
                                </span>
                                +
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)LeftClick"]}
                                </span>{" "}
                                <span class="desc">
                                    {languages[loc]["(TOOLBAR_DESC)Pan"]}
                                </span>
                            </li>
                            <li>
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)MouseWheel"]}
                                </span>{" "}
                                <span class="desc">
                                    {languages[loc]["(TOOLBAR_DESC)Zoom"]}
                                </span>
                            </li>
                            <li>
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)Delete"]}
                                </span>{" "}
                                /{" "}
                                <span class="kbd">
                                    {languages[loc]["(TOOLBAR_KBD)Backspace"]}
                                </span>{" "}
                                <span class="desc">
                                    {languages[loc]["(TOOLBAR_DESC)Delete"]}
                                </span>
                            </li>
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
}
