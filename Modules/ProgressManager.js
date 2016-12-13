var ProgressManager;
(function (ProgressManager) {
    ProgressManager.ProgressElement = null;
    function Show() {
        if (ProgressManager.ProgressElement) {
            ProgressManager.ProgressElement.style.display = "inline";
        }
    }
    ProgressManager.Show = Show;
    function Hide() {
        if (ProgressManager.ProgressElement != null) {
            ProgressManager.ProgressElement.style.display = "none";
        }
    }
    ProgressManager.Hide = Hide;
})(ProgressManager || (ProgressManager = {}));
//# sourceMappingURL=ProgressManager.js.map