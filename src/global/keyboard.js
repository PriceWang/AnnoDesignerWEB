(function () {
  function isInteractive(el) {
    if (!el) return false;
    const tn = (el.tagName || "").toUpperCase();
    if (tn === "BUTTON" || tn === "A" || tn === "SUMMARY" || tn === "DETAILS")
      return true;
    const role = el.getAttribute ? el.getAttribute("role") : null;
    if (role === "button" || role === "link" || role === "menuitem")
      return true;
    return false;
  }
  window.addEventListener(
    "keydown",
    function (e) {
      const isSpace =
        e.code === "Space" || e.key === " " || e.key === "Spacebar";
      if (!isSpace) return;
      try {
        const editable =
          typeof isEditable === "function" ? isEditable(e.target) : false;
        if (!editable && !isInteractive(e.target)) {
          e.preventDefault();
          e.stopPropagation();
        }
      } catch (_) {}
    },
    { capture: true }
  );
})();
