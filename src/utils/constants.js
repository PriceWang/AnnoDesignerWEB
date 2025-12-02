/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:48:16
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-11-28 15:07:28
 * @FilePath: /AnnoDesignerWEB/src/utils/constants.js
 * @Description:
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */
const { useEffect, useLayoutEffect, useRef, useState, useMemo, useCallback } =
    React;
const TILE = 10;
const GRID_W = 3000;
const GRID_H = 2000;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
window.useEffect = useEffect;
window.useLayoutEffect = useLayoutEffect;
window.useRef = useRef;
window.useState = useState;
window.useMemo = useMemo;
window.useCallback = useCallback;
window.TILE = TILE;
window.GRID_W = GRID_W;
window.GRID_H = GRID_H;
window.clamp = clamp;
