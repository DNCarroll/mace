interface HTMLElement extends Element {
    Get(predicate: (element: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[]
    First(predicate: (element: HTMLElement) => boolean): HTMLElement;
    Parent(predicate: (element: HTMLElement) => boolean): HTMLElement;
    Delete(predicate: (element: HTMLElement) => boolean);
    Clear(predicate?: (element: HTMLElement) => boolean, notRecursive?: boolean);
    AddRange(...elements: HTMLElement[]): HTMLElement;
    Remove();

    SetClass(className: string);    
    OffSet(): { top: number; left: number; };
    Dimensions(): { width: number; height: number; };
    DimAndOff(): { Height: number; Width: number; Top: number; Left: number; };
    AddListener(eventName, method);
    Set(objectProperties): HTMLElement;
    HasDataSet: () => boolean;
    GetDataSetAttributes: () => { Attribute: string; Property: any; }[];
        
    Binder: IBinder;
}
HTMLElement.prototype.Get = function (predicate: (element: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[] {
    if (nodes == null) {
        nodes = new Array<HTMLElement>();
    }
    var that = <HTMLElement>this;
    var children = that.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1
            && children[i].tagName.toLowerCase() != "svg") {
            var child = <HTMLElement>children[i]
            var fmatch = predicate(child);
            if (fmatch) {
                nodes.push(child);
            }
            if (!notRecursive && child.Get) {
                child.Get(predicate, notRecursive, nodes);
            }
        }
    }
    return nodes;
};
HTMLElement.prototype.First = function (predicate: (element: HTMLElement) => boolean): HTMLElement {
    var that = <HTMLElement>this;
    var children = that.children;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1
            && children[i].tagName.toLowerCase() != "svg") {
            var child = <HTMLElement>children[i];
            if (predicate(child)) {
                return child;
            }
        }
    }
    var found = null;
    for (var i = 0; i < children.length; i++) {
        if (children[i].nodeType == 1 && children[i].tagName.toLowerCase() != "svg") {
            var c = <HTMLElement>children[i];
            if (c.First) {
                found = c.First(predicate);
                if (found) {
                    return found;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Parent = function (predicate: (element: HTMLElement) => boolean): HTMLElement {

    var el = this;
    while (el && el.parentNode) {
        el = el.parentNode;
        if (predicate(el)) {
            return el;
        }
    }
    return null;
};
HTMLElement.prototype.Delete = function (predicate: (element: HTMLElement) => boolean) {
    var that = <HTMLElement>this;
    var found = that.First(predicate);
    if (found) {
        found.Remove();
    }
};
HTMLElement.prototype.Clear = function (predicate?: (element: HTMLElement) => boolean, notRecursive?: boolean) {
    var that = <HTMLElement>this;
    var children = that.childNodes;
    if (!predicate) {
        while (children.length > 0) {
            that.removeChild(children[0]);
        }
    }
    else {
        var pos = children.length - 1;
        while (pos > 0) {
            if (children[pos].nodeType == 1) {
                var child = <HTMLElement>children[pos];
                if (predicate(child)) {
                    that.removeChild(child);
                }
                else if (!notRecursive && child.Clear) {
                    child.Clear(predicate, notRecursive);
                }
            }
            else {
                that.removeChild(children[pos]);
            }
            pos--;
        }
    }
};
HTMLElement.prototype.AddRange = function (...elements: HTMLElement[]): HTMLElement {
    var that = <HTMLElement>this;
    elements.forEach(e=> that.appendChild(e));
    return that;
};
HTMLElement.prototype.Remove = function () {
    this.parentNode.removeChild(this);
};
HTMLElement.prototype.SetClass = function (className: string) {
    this.className = null;
    this.className = className;
};
HTMLElement.prototype.OffSet = function (): { top: number; left: number; } {
    var _x = 0;
    var _y = 0;
    var el = <HTMLElement>this;
    while (el && !isNaN(el.offsetLeft) && !isNaN(el.offsetTop)) {
        _x += el.offsetLeft - el.scrollLeft;
        _y += el.offsetTop - el.scrollTop;
        //may not work
        el = <HTMLElement>el.offsetParent;
    }
    return { top: _y, left: _x };
};
HTMLElement.prototype.Dimensions = function (): { width: number; height: number; } {
    var ret = { width: 0, height: 0 };
    ret.width = this.offsetWidth;
    ret.height = this.offsetHeight;
    return ret;
};
HTMLElement.prototype.DimAndOff = function (): { Height: number; Width: number; Top: number; Left: number; } {
    var ret = {
        Height: 0,
        Width: 0,
        Top: 0,
        Left: 0
    };
    var dim = this.Dimensions();
    var pos = this.OffSet();
    ret.Height = dim.height;
    ret.Width = dim.width;
    ret.Top = pos.top;
    ret.Left = pos.left;
    return ret;
};
HTMLElement.prototype.AddListener = function (eventName, method) {
    if (this.addEventListener) {
        this.addEventListener(eventName, method);
    }
    else {
        this.attachEvent(eventName, method);
    }
};
HTMLElement.prototype.Set = function (objectProperties) {
    var that = <HTMLElement>this;
    if (objectProperties) {
        for (var prop in objectProperties) {
            var tempPropName = prop;

            if (tempPropName != "cls" && tempPropName != "className") {
                var isStyleProp = Is.Style(tempPropName);
                if (isStyleProp) {
                    that.style[tempPropName] = objectProperties[prop];
                }
                else if (prop == "style") {
                    if (objectProperties.style.cssText) {
                        that.style.cssText = objectProperties.style.cssText;
                    }
                }
                else {
                    that[tempPropName] = objectProperties[prop];
                }
            }
            else {
                that.SetClass(objectProperties[prop]);
            }
        }
    }
    return that;
};
HTMLElement.prototype.HasDataSet = function () {
    if (this["dataset"]) {
        var dataset = this["dataset"];
        for (var prop in dataset) {
            return true;
        }
    }
    return false;
};
HTMLElement.prototype.GetDataSetAttributes = function () {
    var ret = new Array<{ Attribute: string; Property: any; }>();
    if (this["dataset"]) {
        var dataset = this["dataset"];
        for (var prop in dataset) {
            ret.Add({ Attribute: prop, Property: dataset[prop] });
        }
    }
    return ret;
};









