Window.prototype.Exception = function () {
    var parameters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parameters[_i] = arguments[_i];
    }
    if (parameters.length == 1) {
        var o = {};
        for (var i = 0; i < parameters.length; i++) {
            o["parameter" + i] = parameters[i];
        }
        alert(JSON.stringify(o));
    }
    else if (parameters.length > 1) {
        alert(JSON.stringify(parameters[0]));
    }
    else {
        alert("Unknown error");
    }
};
Window.prototype.Show = function (type) {
    var parameters = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        parameters[_i - 1] = arguments[_i];
    }
    var p = parameters;
    p = p.length == 1 && p[0] == "" ? null : p;
    var vc = Reflection.NewObject(type), vi = new ViewInstance(p, vc);
    vc.Show(vi);
    HistoryManager.Add(vi);
};
Window.prototype.ShowByUrl = function (url) {
    var vc = url.length === 0 ? ViewContainers.First(function (vc) { return vc.IsDefault; }) : ViewContainers.First(function (d) { return d.IsUrlPatternMatch(url); });
    vc = vc == null ? ViewContainers.First(function (d) { return d.IsDefault; }) : vc;
    if (vc) {
        var p = url.split("/"), vi = new ViewInstance(p, vc, window.location.pathname);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
};
//# sourceMappingURL=Window.js.map