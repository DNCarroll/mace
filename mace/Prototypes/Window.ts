interface Window {
    Show<T extends IViewContainer>(type: {
        new (): T;
    }, ...parameters: any[]);
    ShowByUrl(url: string);
    Exception(...parameters: any[]);
}
Window.prototype.Exception = function (...parameters: any[]) {
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
Window.prototype.Show = function <T extends IViewContainer>(type: { new (): T; }, ...parameters: any[]) {
    var p = parameters;
    p = p.length == 1 && p[0] == "" ? null : p;
    var vc = Reflection.NewObject(type),
        vi = new ViewInstance(p, vc);
    vc.Show(vi);
    HistoryManager.Add(vi);
};
Window.prototype.ShowByUrl = function (url: string) {
    var vc: IViewContainer = url.length === 0 ? ViewContainers.First(vc => vc.IsDefault) : ViewContainers.Where(vc=>!vc.IsDefault).First(d => d.IsUrlPatternMatch(url));
    vc = vc == null ? ViewContainers.First(d => d.IsDefault) : vc;
    if (vc) {
        var p = vc.Parameters(url),
            vi = new ViewInstance(p, vc, window.location.pathname);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
};