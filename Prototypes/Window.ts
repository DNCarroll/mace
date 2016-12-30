interface Window {         
    Show<T>(type: {
        new (): T;
    }, parameters?: Array<any>);
    ShowByUrl(url: string);
    Exception(...parameters: any[]);
}
Window.prototype.Exception = function (...parameters: any[]) {
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
Window.prototype.Show = function <T extends IViewContainer>(type: { new (): T; },webApiParameters?: Array<any>) {    
    var vc = new type();    
    var vi = new ViewInstance(webApiParameters, vc);    
    vc.Show(vi);
    HistoryManager.Add(vi);
};
Window.prototype.ShowByUrl = function (url: string) {           
    var vi: IViewContainer = ViewContainers.First(d => d.IsUrlPatternMatch(url));
    vi = vi == null ? ViewContainers.First(d => d.IsDefault) : vi;
    if (vi) {
        var p = url.split("/");
        var viewInstance = new ViewInstance(p, vi);
        vi.Show(viewInstance);
        HistoryManager.Add(viewInstance);
    }
}
