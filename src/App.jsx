function App() {
    const { presets, treeLoc, colors, error } = useAssets();
    const [loc, setLoc] = useState("eng");
    const [placed, setPlaced] = useState([]);
    const [selected, setSelected] = useState([]);
    const [placing, setPlacing] = useState(null);
    const [placeMode, setPlaceMode] = useState("none");
    const [zoom, setZoom] = useState(1);

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

    if (error) return <div style={{ padding: 20 }}>加载资源失败：{error}</div>;
    if (!presets || !treeLoc || !colors)
        return <div style={{ padding: 20 }}>加载中…</div>;

    return (
        <div className="app">
            <Sidebar
                presets={presets}
                treeLoc={treeLoc}
                colors={colors}
                loc={loc}
                placing={placing}
                setPlacing={setPlacing}
                setSelected={setSelected}
                setPlaceMode={setPlaceMode}
            />
            <div className="center">
                <div className="toolbar-wrap">
                    <Toolbar
                        loc={loc}
                        setLoc={setLoc}
                        placed={placed}
                        setPlaced={setPlaced}
                        zoom={zoom}
                        setZoom={setZoom}
                        placing={placing}
                        placeMode={placeMode}
                        onResetView={() => {
                            // Use ref instead of direct DOM query for better performance and React patterns
                            const stageElement =
                                document.getElementById("stage");
                            if (stageElement) {
                                stageElement.scrollTo({
                                    left: 0,
                                    top: 0,
                                    behavior: "smooth",
                                });
                            }
                            setZoom(1);
                        }}
                    />
                </div>
                <Canvas
                    colors={colors}
                    zoom={zoom}
                    setZoom={setZoom}
                    placing={placing}
                    setPlacing={setPlacing}
                    placeMode={placeMode}
                    setPlaceMode={setPlaceMode}
                    placed={placed}
                    setPlaced={setPlaced}
                    selected={selected}
                    setSelected={setSelected}
                />
            </div>
            <Inspector
                selected={selected}
                placed={placed}
                setPlaced={setPlaced}
                setSelected={setSelected}
            />
        </div>
    );
}

window.App = App;
