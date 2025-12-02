/*
 * @Author: Guoxin Wang
 * @Date: 2025-10-29 12:48:16
 * @LastEditors: Guoxin Wang
 * @LastEditTime: 2025-12-02 13:14:28
 * @FilePath: /AnnoDesignerWEB/src/index.jsx
 * @Description: Entry point of the Anno Designer Web application
 *
 * Copyright (c) 2025 by Guoxin Wang, All Rights Reserved.
 */

// Initialize the React application by rendering the App component to the DOM
const root = document.getElementById("app");
if (root) {
    ReactDOM.createRoot(root).render(<App />);
} else {
    console.error("Failed to find the root element with id 'app'");
}
