var Navigate;
(function (Navigate) {
    function Spa(type, parameters) {
        if (parameters === void 0) { parameters = null; }
        var p;
        if (!Is.Array(parameters)) {
            p = new Array();
            p.Add(parameters);
        }
        else {
            p = parameters;
        }
        p = p && p.length == 1 && p[0] === "" ? null : p;
        var vc = Reflection.NewObject(type), vi = new ViewInstance(p, vc);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
    Navigate.Spa = Spa;
    function Url(url) {
        var vc = url.length === 0 ? ViewContainers.First(function (vc) { return vc.IsDefault; }) : ViewContainers.Where(function (vc) { return !vc.IsDefault; }).First(function (d) { return d.IsUrlPatternMatch(url); });
        vc = vc == null ? ViewContainers.First(function (d) { return d.IsDefault; }) : vc;
        if (vc) {
            var p = vc.Parameters(url), vi = new ViewInstance(p, vc, url);
            vc.Show(vi);
            HistoryManager.Add(vi);
        }
    }
    Navigate.Url = Url;
})(Navigate || (Navigate = {}));
//# sourceMappingURL=Navigate.js.map