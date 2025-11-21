/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:48:16
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-11-11 13:13:10
 * @FilePath: /AnnoDesignerWEB/src/hooks/useAssets.jsx
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */
function useAssets() {
    const [presets, setPresets] = useState(null);
    const [treeLoc, setTreeLoc] = useState(null);
    const [colors, setColors] = useState(null);
    const [error, setError] = useState(null);
    useEffect(() => {
        Promise.all([
            loadJSON("./assets/presets.json"),
            loadJSON("./assets/treeLocalization.json"),
            loadJSON("./assets/colors.json"),
        ])
            .then(([p, t, c]) => {
                setPresets(p);
                setTreeLoc(t);
                setColors(c);
            })
            .catch((e) => setError(e.message));
    }, []);
    return { presets, treeLoc, colors, error };
}

window.useAssets = useAssets;