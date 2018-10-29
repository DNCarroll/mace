interface HTMLElement extends Element {
    Get(func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[]
    First(func: (ele: HTMLElement) => boolean): HTMLElement;
    Clear();
    AddListener(eventName, method);
    Set(objectProperties): HTMLElement;
    HasDataSet: () => boolean;
    GetDataSetAttributes: () => { Attribute: string; Property: any; }[];
    Binder: Binder;
    DataObject: IObjectState;
    Delete();
    Save();
    SaveDirty();
    Ancestor(func: (ele: HTMLElement) => boolean): HTMLElement;
    ClearBoundElements();
    Bind(obj: any);
    Bind(obj: any, refresh: boolean);
    IndexOf(ele: HTMLElement);
    PostAndInsertBefore(obj: any, index: number);
    PostAndInsertBeforeChild(childMatch: (child) => boolean, obj: any);
    PostAndAppend(obj: any);
    Append(obj: any);
    InsertBefore(obj: any, index: number);
    InsertBeforeChild(childMatch: (child) => boolean, obj: any);
    Input(): HTMLInputElement;
    Input(predicate: (item: HTMLInputElement) => boolean): HTMLInputElement;
}
HTMLElement.prototype.Input = function (predicate: (item: HTMLInputElement) => boolean = null) {
    var p = <HTMLElement>this;
    if (predicate) {
        return <HTMLInputElement>p.First(e => e.tagName === "INPUT" && predicate(<HTMLInputElement>e));
    }
    else {
        return <HTMLInputElement>p.First(e => e.tagName === "INPUT");
    }
}
HTMLElement.prototype.InsertBeforeChild = function (childMatch: (child) => boolean, obj: any) {
    var p = <HTMLElement>this, b = p.Binder;
    var fc = p.First(childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = <HTMLElement>this;
            p.InsertBefore(obj, i);
        }
    }
}
HTMLElement.prototype.InsertBefore = function (obj: any, index: number) {
    var p = <HTMLElement>this, b = p.Binder;
    if (Is.Alive(b)) {
        b.InsertBefore(obj, index);
    }
}
HTMLElement.prototype.Append = function (obj: any) {
    var p = <HTMLElement>this, b = p.Binder;
    if (Is.Alive(b)) {
        b.Append(obj);
    }
}
HTMLElement.prototype.PostAndAppend = function (obj: any) {
    var p = <HTMLElement>this, b = p.Binder;
    if (Is.Alive(b)) {
        b.PostAndAppend(obj);
    }
}
HTMLElement.prototype.PostAndInsertBeforeChild = function (childMatch: (child) => boolean, obj: any) {
    var p = <HTMLElement>this, b = p.Binder;
    var fc = p.First(childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = <HTMLElement>this;
            p.PostAndInsertBefore(obj, i);
            return;
        }
    }
    p = <HTMLElement>this;
    p.PostAndAppend(obj);
}
HTMLElement.prototype.PostAndInsertBefore = function (obj: any, index: number) {
    var p = <HTMLElement>this, b = p.Binder;
    if (Is.Alive(b)) {
        b.PostAndInsertBefore(obj, index);
    }
}
HTMLElement.prototype.IndexOf = function (child: HTMLElement) {
    var p = <HTMLElement>this, c = p.children;
    var i = c.length - 1;
    for (; i >= 0; i--) {
        if (child == c[i]) {
            return i;
        }
    }
    return undefined;
}
HTMLElement.prototype.Bind = function (obj: any, refresh: boolean = false) {
    if (refresh) {
        this.RemoveDataRowElements();
    }
    var binder = <Binder>this.Binder;
    if (binder) {
        if (obj instanceof ViewInstance) {
            binder.Refresh(<ViewInstance>obj);
        }
        else if (obj instanceof Array) {
            var arr = <Array<any>>obj;
            for (var i = 0; i < arr.length; i++) {
                var tempObj = arr[i];
                binder.Append(tempObj instanceof DataObject ? tempObj : new DataObject(tempObj));
            }
        }
        else if (obj) {
            binder.Append(obj instanceof DataObject ? obj : new DataObject(obj));
        }
    }
};
HTMLElement.prototype.ClearBoundElements = function () {
    var t = <HTMLElement>this;
    t.Get(e => e.getAttribute("data-template") != null).forEach(r => r.parentElement.removeChild(r));
};
HTMLElement.prototype.SaveDirty = function () {
    let t = <HTMLElement>this,
        p = Is.Alive(t.Binder) ? t : t.Ancestor(p => Is.Alive(p.Binder));
    if (p && p.Binder) {
        p.Binder.SaveDirty();
    }
}
HTMLElement.prototype.Save = function () {
    var t = <HTMLElement>this, p = t.Ancestor(p => p.Binder != null);
    if (p && p.Binder) {
        p.Binder.Save(t.DataObject);
    }
};
HTMLElement.prototype.Get = function (func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[] {
    var n = nodes == null ? new Array<HTMLElement>() : nodes;
    var chs = (<HTMLElement>this).children;
    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {
            if (func(c)) {
                n.push(c);
            }
            if (!notRecursive && c.Get) {
                c.Get(func, notRecursive, n);
            }
        }
    }
    return n;
};
HTMLElement.prototype.First = function (func: (ele: HTMLElement) => boolean): HTMLElement {
    var chs = (<HTMLElement>this).children;
    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {
            if (func(c)) {
                return c;
            }
        }
    }
    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {
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
HTMLElement.prototype.Delete = function () {
    var t = <HTMLElement>this, p = t.Ancestor(p => p.Binder != null);
    if (p && p.Binder) {
        p.Binder.Delete(this, null);
    }
};
HTMLElement.prototype.Ancestor = function (func: (ele: HTMLElement) => boolean): HTMLElement {
    var p = this.parentElement;
    while (!func(p)) {
        p = p.parentElement;
    }
    return p;
};