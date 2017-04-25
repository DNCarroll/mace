var ProgressManager;
(function (ProgressManager) {
    ProgressManager.ProgressElement = null;
    function Show() {
        var pe = ProgressManager.ProgressElement;
        if (pe) {
            pe.style.display = "inline";
        }
    }
    ProgressManager.Show = Show;
    function Hide() {
        var pe = ProgressManager.ProgressElement;
        if (pe) {
            pe.style.display = "none";
        }
    }
    ProgressManager.Hide = Hide;
})(ProgressManager || (ProgressManager = {}));
