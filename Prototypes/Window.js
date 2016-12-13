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
Window.prototype.Show = function (type, parameters) {
    var viewContainer = new type();
    var viewInstance = new ViewInstance(parameters, viewContainer);
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
Window.prototype.Dimensions = function () {
    var ret = { Height: 0, Width: 0 };
    var temp = window;
    if (typeof temp.innerWidth != 'undefined') {
        ret.Width = temp.innerWidth,
            ret.Height = temp.innerHeight;
    }
    else if (typeof document.documentElement != 'undefined'
        && typeof document.documentElement.clientWidth !=
            'undefined' && document.documentElement.clientWidth != 0) {
        ret.Width = document.documentElement.clientWidth,
            ret.Height = document.documentElement.clientHeight;
    }
    else {
        ret.Width = document.getElementsByTagName('body')[0].clientWidth,
            ret.Height = document.getElementsByTagName('body')[0].clientHeight;
    }
    return ret;
};
Window.prototype.SplitPathName = function () {
    var ret = new Array();
    var pathName = window.location.pathname;
    pathName = pathName.substring(1);
    var lastCharacter = pathName.charAt(pathName.length - 1);
    if (lastCharacter == "/") {
        pathName = pathName.substring(0, pathName.length - 1);
    }
    var split = pathName.split("/");
    return split;
};
//# sourceMappingURL=Window.js.map