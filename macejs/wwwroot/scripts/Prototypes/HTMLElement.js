HTMLElement.prototype.InsertBeforeChild = function (childMatch, obj) {
    var p = this, b = p.Binder;
    var fc = p.First(childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = this;
            p.InsertBefore(obj, i);
        }
    }
};
HTMLElement.prototype.InsertBefore = function (obj, index) {
    var p = this, b = p.Binder;
    if (Is.Alive(b)) {
        b.InsertBefore(obj, index);
    }
};
HTMLElement.prototype.Append = function (obj) {
    var p = this, b = p.Binder;
    if (Is.Alive(b)) {
        b.Append(obj);
    }
};
HTMLElement.prototype.PostAndAppend = function (obj) {
    var p = this, b = p.Binder;
    if (Is.Alive(b)) {
        b.PostAndAppend(obj);
    }
};
HTMLElement.prototype.PostAndInsertBeforeChild = function (childMatch, obj) {
    var p = this, b = p.Binder;
    var fc = p.First(childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = this;
            p.PostAndInsertBefore(obj, i);
            return;
        }
    }
    p = this;
    p.PostAndAppend(obj);
};
HTMLElement.prototype.PostAndInsertBefore = function (obj, index) {
    var p = this, b = p.Binder;
    if (Is.Alive(b)) {
        b.PostAndInsertBefore(obj, index);
    }
};
HTMLElement.prototype.IndexOf = function (child) {
    var p = this, c = p.children;
    var i = c.length - 1;
    for (; i >= 0; i--) {
        if (child == c[i]) {
            return i;
        }
    }
    return undefined;
};
HTMLElement.prototype.Bind = function (obj, refresh) {
    if (refresh === void 0) { refresh = false; }
    if (refresh) {
        this.RemoveDataRowElements();
    }
    var binder = this.Binder;
    if (binder) {
        if (obj instanceof ViewInstance) {
            binder.Refresh(obj);
        }
        else if (obj instanceof Array) {
            var arr = obj;
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
HTMLElement.prototype.RemoveDataRowElements = function () {
    var t = this;
    var dr = t.Get(function (e) { return e.getAttribute("data-template") != null; });
    dr.forEach(function (r) { return r.parentElement.removeChild(r); });
};
HTMLElement.prototype.SaveDirty = function () {
    var t = this, p = Is.Alive(t.Binder) ? t : t.Ancestor(function (p) { return Is.Alive(p.Binder); });
    if (p && p.Binder) {
        p.Binder.SaveDirty();
    }
};
HTMLElement.prototype.Save = function () {
    var t = this, p = t.Ancestor(function (p) { return p.Binder != null; });
    if (p && p.Binder) {
        p.Binder.Save(t.DataObject);
    }
};
HTMLElement.prototype.Get = function (func, notRecursive, nodes) {
    var n = nodes == null ? new Array() : nodes;
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
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
HTMLElement.prototype.First = function (func) {
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {
            if (func(c)) {
                return c;
            }
        }
    }
    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
        if (c.nodeType == 1 && c.tagName.toLowerCase() != "svg") {
            if (c.First) {
                var f = c.First(func);
                if (f) {
                    return f;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Clear = function () {
    var t = this;
    var chs = t.childNodes;
    while (chs.length > 0) {
        t.removeChild(chs[0]);
    }
};
HTMLElement.prototype.AddListener = function (eventName, method) {
    this.addEventListener ? this.addEventListener(eventName, method) : this.attachEvent(eventName, method);
};
HTMLElement.prototype.Set = function (objectProperties) {
    var t = this, op = objectProperties;
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
    var r = new Array();
    var d = this["dataset"];
    if (d) {
        for (var p in d) {
            r.Add({ Attribute: p, Property: d[p] });
        }
    }
    return r;
};
HTMLElement.prototype.Delete = function () {
    var t = this, p = t.Ancestor(function (p) { return p.Binder != null; });
    if (p && p.Binder) {
        p.Binder.Delete(this, null);
    }
};
HTMLElement.prototype.Ancestor = function (func) {
    var p = this.parentElement;
    while (!func(p)) {
        p = p.parentElement;
    }
    return p;
};
//# sourceMappingURL=HTMLElement.js.map