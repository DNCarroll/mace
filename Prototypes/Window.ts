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
    var viewContainer = new type();    
    var viewInstance = new ViewInstance(webApiParameters, viewContainer);    
    viewContainer.Show(viewInstance);
    HistoryManager.Add(viewInstance);
};
Window.prototype.ShowByUrl = function (url: string) {           
    var viewContainer: IViewContainer = ViewContainers.First(d => d.IsUrlPatternMatch(url));
    viewContainer = viewContainer == null ? ViewContainers.First(d => d.IsDefault) : viewContainer;
    if (viewContainer) {
        var parameters = url.split("/");
        var viewInstance = new ViewInstance(parameters, viewContainer);
        viewContainer.Show(viewInstance);
        HistoryManager.Add(viewInstance);
    }
}
