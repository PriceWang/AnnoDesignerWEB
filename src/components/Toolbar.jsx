function Toolbar({
    loc,
    setLoc,
    placed,
    setPlaced,
    zoom,
    setZoom,
    placing,
    placeMode,
}) {
    function exportJSON() {
        const blob = new Blob([JSON.stringify(placed, null, 2)], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "layout.json";
        a.click();
        URL.revokeObjectURL(url);
    }
    const [helpOpen, setHelpOpen] = useState(false);
    return (
        <div className="toolbar">
            <button
                className="toolbar-button"
                title="切换语言 / Switch Language"
                onClick={() => setLoc(loc === "zhs" ? "eng" : "zhs")}
            >
                {loc === "zhs" ? "EN" : "中"}
            </button>
            <button
                type="button"
                className="button"
                onClick={() => setPlaced([])}
            >
                清空
            </button>
            <button type="button" className="button" onClick={exportJSON}>
                导出JSON
            </button>
            <label className="button">
                导入JSON
                <input
                    type="file"
                    accept="application/json"
                    style={{ display: "none" }}
                    onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        const r = new FileReader();
                        r.onload = () => {
                            try {
                                const d = JSON.parse(r.result);
                                setPlaced(Array.isArray(d) ? d : []);
                            } catch {}
                        };
                        r.readAsText(f);
                    }}
                />
            </label>
            <span className="button">缩放: {Math.round(zoom * 100)}%</span>
            {placing && (
                <span className="button">
                    放置中：
                    {placing.Localization?.zhs || placing.Localization?.eng}
                    {placeMode === "once" ? "（一次）" : "（连续）"}
                </span>
            )}
            <button
                type="button"
                className="button"
                onClick={() => setHelpOpen((v) => !v)}
            >
                快捷键
            </button>
            {helpOpen && (
                <div className="hotkeys-panel">
                    <h4>快捷键</h4>
                    <ul>
                        <li>
                            <span class="kbd">⌘</span>/
                            <span class="kbd">Ctrl</span> +{" "}
                            <span class="kbd">C</span>{" "}
                            <span class="desc">
                                克隆并进入连续放置（保留旋转）
                            </span>
                        </li>
                        <li>
                            <span class="kbd">⌘</span>/
                            <span class="kbd">Ctrl</span> +{" "}
                            <span class="kbd">X</span>{" "}
                            <span class="desc">
                                剪切并进入一次性放置（保留旋转）
                            </span>
                        </li>
                        <li>
                            <span class="kbd">R</span>{" "}
                            <span class="desc">
                                放置模式旋转 90°（光标保持中心；图标不旋转）
                            </span>
                        </li>
                        <li>
                            <span class="kbd">左键</span>{" "}
                            <span class="desc">放置（一次/连续）</span>
                        </li>
                        <li>
                            <span class="kbd">右键</span>/
                            <span class="kbd">Esc</span>{" "}
                            <span class="desc">退出放置模式</span>
                        </li>
                        <li>
                            <span class="kbd">Alt</span> +{" "}
                            <span class="kbd">左键</span>{" "}
                            <span class="desc">抓手平移</span>
                        </li>
                        <li>
                            <span class="kbd">中键</span>{" "}
                            <span class="desc">旋转 90°（放置模式）</span>
                        </li>
                        <li>
                            <span class="kbd">滚轮</span>{" "}
                            <span class="desc">缩放（50%–200%）</span>
                        </li>
                        <li>
                            <span class="kbd">Delete</span>{" "}
                            <span class="desc">删除选中对象</span>
                        </li>
                    </ul>
                </div>
            )}
        </div>
    );
}

function exportJSON() {
    const blob = new Blob([JSON.stringify(placed, null, 2)], {
        type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "layout.json";
    a.click();
    URL.revokeObjectURL(url);
}

window.Toolbar = Toolbar;
window.exportJSON = exportJSON;