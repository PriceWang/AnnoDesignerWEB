/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:50:50
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-12-16 16:48:18
 * @FilePath: /AnnoDesignerWEB/src/App.jsx
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */

function App() {
    const { presets, webLoc, colors, error } = useAssets();
    const [loc, setLoc] = useState("eng");
    const [placed, setPlaced] = useState([]);
    const [selected, setSelected] = useState([]);
    const [placing, setPlacing] = useState([]);

    // hydrate from localStorage (must be declared before early returns to keep hooks order constant)
    useEffect(() => {
        try {
            const raw = localStorage.getItem("anno-web-layout");
            if (raw) {
                const arr = JSON.parse(raw);
                if (Array.isArray(arr)) {
                    // Validate and sanitize data from localStorage before setting
                    const sanitized = arr.map((it) => {
                        if (it && typeof it === "object") {
                            // Ensure showInfluence property exists with default value
                            if (!("showInfluence" in it)) {
                                return { ...it, showInfluence: true };
                            }
                            return it;
                        }
                        return { ...it, showInfluence: true };
                    });
                    setPlaced(sanitized);
                }
            }
        } catch (e) {
            console.error("Failed to load layout from localStorage:", e);
        }
    }, []);

    // persist on change with debounce to avoid excessive writes
    useEffect(() => {
        const timer = setTimeout(() => {
            try {
                localStorage.setItem("anno-web-layout", JSON.stringify(placed));
            } catch (e) {
                console.error("Failed to save layout to localStorage:", e);
            }
        }, 300); // Debounce for 300ms

        return () => clearTimeout(timer);
    }, [placed]);

    if (error) return <div style={{ padding: 20 }}>loading error: {error}</div>;
    if (!presets || !webLoc || !colors)
        return <div style={{ padding: 20 }}>loading…</div>;

    return (
        <div className="app">
            <Sidebar
                presets={presets}
                webLoc={webLoc}
                colors={colors}
                loc={loc}
                placing={placing}
                setPlacing={setPlacing}
                setSelected={setSelected}
            />
            <div className="center">
                <Toolbar
                    presets={presets}
                    webLoc={webLoc}
                    loc={loc}
                    setLoc={setLoc}
                    placed={placed}
                    setPlaced={setPlaced}
                />
                <Canvas
                    colors={colors}
                    placing={placing}
                    setPlacing={setPlacing}
                    placed={placed}
                    setPlaced={setPlaced}
                    selected={selected}
                    setSelected={setSelected}
                />
            </div>
            <Inspector
                webLoc={webLoc}
                loc={loc}
                placed={placed}
                selected={selected}
            />
        </div>
    );
}
