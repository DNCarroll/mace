interface HTMLElement extends Element {
    Get(func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[]
    First(func: (ele: HTMLElement) => boolean): HTMLElement; 
    Clear();       
    AddListener(eventName, method);
    Set(objectProperties): HTMLElement;
    HasDataSet: () => boolean;
    GetDataSetAttributes: () => { Attribute: string; Property: any; }[];        
    Binder: IBinder;
}
HTMLElement.prototype.Get = function (func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[] {
    nodes == null ? nodes = new Array<HTMLElement>() : null;
    var chs = (<HTMLElement>this).children;
    for (var i = 0; i < chs.length; i++) {
        if (chs[i].nodeType == 1
            && chs[i].tagName.toLowerCase() != "svg") {
            let c = <HTMLElement>chs[i]
            if (func(c)) {
                nodes.push(c);
            }
            if (!notRecursive && c.Get) {
                c.Get(func, notRecursive, nodes);
            }
        }
    }
    return nodes;
};
HTMLElement.prototype.First = function (func: (ele: HTMLElement) => boolean): HTMLElement {
    var chs = (<HTMLElement>this).children;
    for (var i = 0; i < chs.length; i++) {
        if (chs[i].nodeType == 1 && chs[i].tagName.toLowerCase() != "svg") {
            let c = <HTMLElement>chs[i];
            if (func(c)) {
                return c;
            }
        }
    }
    for (var i = 0; i < chs.length; i++) {
        if (chs[i].nodeType == 1 && chs[i].tagName.toLowerCase() != "svg") {
            let c = <HTMLElement>chs[i];
            if (c.First) {
                let f = c.First(func);
                if (f) {
                    return f;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Clear = function () {
    var t = <HTMLElement>this;
    var chs = t.childNodes;
    while (chs.length > 0) {
        t.removeChild(chs[0]);
    }
};
HTMLElement.prototype.AddListener = function (eventName, method) {
    this.addEventListener ? this.addEventListener(eventName, method) : this.attachEvent(eventName, method);
};
HTMLElement.prototype.Set = function (objectProperties) {
    var t = <HTMLElement>this, op = objectProperties;
    if (op) {
        for (var p in op) {
            if (p != "cls" && p != "className") {
                if (p.IsStyle()) {
                    t.style[p] = op[p];
                }
                else if (p === "style") {
                    if (op.style.cssText) {
                        t.style.cssText = op.style.cssText;
                    }
                }
                else {
                    t[p] = op[p];
                }
            }
            else {
                t.className = null;
                t.className = op[p];
            }
        }
    }
    return t;
};
HTMLElement.prototype.HasDataSet = function () {
    var d = this["dataset"];
    if (d) {        
        for (var p in d) {
            return true;
        }
    }
    return false;
};
HTMLElement.prototype.GetDataSetAttributes = function () {
    var r = new Array<{ Attribute: string; Property: any; }>();
    var d = this["dataset"];
    if (d) {        
        for (var p in d) {
            r.Add({ Attribute: p, Property: d[p] });
        }
    }
    return r;
};









