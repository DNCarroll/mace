interface Window {         
    Show<T>(type: {
        new (): T;
    }, parameters?: Array<any>);
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
Window.prototype.Show = function <T extends IViewContainer>(type: { new (): T; }, parameters?: Array<any>) {    
    var vc = new type(),   
        vi = new ViewInstance(parameters, vc);    
    vc.Show(vi);
    HistoryManager.Add(vi);
};
Window.prototype.ShowByUrl = function (url: string) {           
    var vc: IViewContainer = ViewContainers.First(d => d.IsUrlPatternMatch(url));
    vc = vc == null ? ViewContainers.First(d => d.IsDefault) : vc;
    if (vc) {
        var p = url.split("/"),
            vi = new ViewInstance(p, vc);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
}
