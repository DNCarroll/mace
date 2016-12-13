interface Window {
    SplitPathName(): Array<string>;   
    Dimensions(): { Height: number; Width: number; };        
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
Window.prototype.Show = function <T extends IViewContainer>(type: {
    new (): T;
}, parameters?: Array<any>) {    
    var viewContainer = new type();    
    var viewInstance = new ViewInstance(parameters, viewContainer);    
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
Window.prototype.Dimensions = function (): { Height: number; Width: number; } {
    var ret = { Height: 0, Width: 0 };
    var temp = <any>window;
    if (typeof temp.innerWidth != 'undefined') {
        ret.Width = temp.innerWidth,
        ret.Height = temp.innerHeight
    }
    else if (typeof document.documentElement != 'undefined'
        && typeof document.documentElement.clientWidth !=
        'undefined' && document.documentElement.clientWidth != 0) {
        ret.Width = document.documentElement.clientWidth,
        ret.Height = document.documentElement.clientHeight
    }
    else {
        ret.Width = document.getElementsByTagName('body')[0].clientWidth,
        ret.Height = document.getElementsByTagName('body')[0].clientHeight
    }
    return ret;
};
Window.prototype.SplitPathName = function (): Array<string> {
    var ret = new Array<string>();
    var pathName = window.location.pathname;
    pathName = pathName.substring(1);
    var lastCharacter = pathName.charAt(pathName.length - 1);
    if (lastCharacter == "/") {
        pathName = pathName.substring(0, pathName.length - 1);
    }
    var split = pathName.split("/");
    return split;
}
