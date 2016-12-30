Window.prototype.Exception = function () {
    var parameters = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        parameters[_i - 0] = arguments[_i];
    }
    if (parameters.length == 1) {
        var obj = {};
        for (var i = 0; i < parameters.length; i++) {
            obj["parameter" + i] = parameters[i];
        }
        alert(JSON.stringify(obj));
    }
    else if (parameters.length > 1) {
        alert(JSON.stringify(parameters[0]));
    }
    else {
        alert("Unknown error");
    }
};
Window.prototype.Show = function (type, webApiParameters) {
    var vc = new type();
    var vi = new ViewInstance(webApiParameters, vc);
    vc.Show(vi);
    HistoryManager.Add(vi);
};
Window.prototype.ShowByUrl = function (url) {
    var vi = ViewContainers.First(function (d) { return d.IsUrlPatternMatch(url); });
    vi = vi == null ? ViewContainers.First(function (d) { return d.IsDefault; }) : vi;
    if (vi) {
        var p = url.split("/");
        var viewInstance = new ViewInstance(p, vi);
        vi.Show(viewInstance);
        HistoryManager.Add(viewInstance);
    }
};
//# sourceMappingURL=Window.js.map