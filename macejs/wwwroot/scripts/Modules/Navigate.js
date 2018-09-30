var Navigate;
(function (Navigate) {
    function Spa(type, parameters) {
        if (parameters === void 0) { parameters = null; }
        var p = Is.Array(parameters) ? parameters : new Array();
        if (Is.Alive(parameters) && !Is.Array(parameters)) {
            p.Add(parameters);
        }
        p = p && p.length == 1 && p[0] === "" ? null : p;
        var vc = Reflection.NewObject(type), vi = new ViewInstance(p, vc);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
    Navigate.Spa = Spa;
    function Url(url) {
        var vp = ViewContainer.VirtualPath;
        url = vp && url.length > 0 ? url.replace(vp, '') : url;
        url = url.length > 0 && url.indexOf("/") === 0 ? url.substr(1) : url;
        var vc = url.length === 0 ? ViewContainers.First(function (vc) { return vc.IsDefault; }) : ViewContainers.Where(function (vc) { return !vc.IsDefault; }).First(function (d) { return d.IsUrlPatternMatch(url); });
        vc = vc == null ? ViewContainers.First(function (d) { return d.IsDefault; }) : vc;
        if (vc) {
            var p = vc.Parameters(url), vi = new ViewInstance(p, vc, url);
            p = vi.Parameters;
            if (p && p.length && !Is.NullOrEmpty(ViewContainer.VirtualPath) && p[0] == ViewContainer.VirtualPath) {
                p.splice(0, 1);
            }
            while (p.length && p.length > 0 && Is.NullOrEmpty(p[0])) {
                p.splice(0, 1);
            }
            vc.Show(vi);
            HistoryManager.Add(vi);
        }
    }
    Navigate.Url = Url;
})(Navigate || (Navigate = {}));
//# sourceMappingURL=Navigate.js.map