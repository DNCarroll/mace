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
    var viewContainer = new type();
    var viewInstance = new ViewInstance(webApiParameters, viewContainer);
    viewContainer.Show(viewInstance);
    HistoryManager.Add(viewInstance);
};
Window.prototype.ShowByUrl = function (url) {
    var viewContainer = ViewContainers.First(function (d) { return d.IsUrlPatternMatch(url); });
    viewContainer = viewContainer == null ? ViewContainers.First(function (d) { return d.IsDefault; }) : viewContainer;
    if (viewContainer) {
        var parameters = url.split("/");
        var viewInstance = new ViewInstance(parameters, viewContainer);
        viewContainer.Show(viewInstance);
        HistoryManager.Add(viewInstance);
    }
};
//# sourceMappingURL=Window.js.map