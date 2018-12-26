HTMLElement.prototype.CObject = function () {
    var f = this.DataObject;
    return f ? f : null;
};
HTMLElement.prototype.First = function (predicate) {
    var chs = this.children;
    var hp = predicate;
    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
            if (hp(c)) {
                return c;
            }
        }
    }
    for (var j = 0; j < chs.length; j++) {
        var c = chs[j];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
            if (c.First) {
                var f = c.First(predicate);
                if (f) {
                    return f;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Relative = function (predicate) {
    if (!Is.Alive(this || this.parentElement)) {
        return null;
    }
    var p = this.parentElement;
    if (predicate(p)) {
        return p;
    }
    else {
        var chs = p.children;
        for (var i = 0; i < chs.length; i++) {
            var c = chs[i];
            if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
                if (predicate(c)) {
                    return c;
                }
                //cascade down now?
                var r = c.First(predicate);
                if (Is.Alive(r)) {
                    return r;
                }
            }
        }
        return p.Relative(predicate);
    }
};
HTMLElement.prototype.InsertBeforeChild = function (childMatch, obj) {
    var p = this;
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
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder;
    }
    if (Is.Alive(b)) {
        b.InsertBefore(obj, index);
    }
};
HTMLElement.prototype.Append = function (obj) {
    var p = this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder;
    }
    if (Is.Alive(b)) {
        b.Append(obj);
    }
};
HTMLElement.prototype.PostAndAppend = function (obj) {
    var p = this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder;
    }
    if (Is.Alive(b)) {
        b.PostAndAppend(obj);
    }
};
HTMLElement.prototype.PostAndInsertBeforeChild = function (childMatch, obj) {
    var p = this;
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
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder;
    }
    if (Is.Alive(b)) {
        b.PostAndInsertBefore(obj, index);
    }
};
HTMLElement.prototype.IndexOf = function (child) {
    var p = this, c = p.children;
    var i = c.length - 1;
    for (; i >= 0; i--) {
        if (child === c[i]) {
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
    var b = this.Binder;
    if (b) {
        if (obj instanceof ViewInstance) {
            b.Refresh(obj);
        }
        else if (obj instanceof Array) {
            var arr = obj;
            for (var i = 0; i < arr.length; i++) {
                var tempObj = arr[i];
                b.Append(tempObj instanceof DataObject ? tempObj : new DataObject(tempObj));
            }
        }
        else if (obj) {
            b.Append(obj instanceof DataObject ? obj : new DataObject(obj));
        }
    }
};
HTMLElement.prototype.ClearBoundElements = function () {
    var t = this;
    t.Get(function (e) { return Is.Alive(e.getAttribute("data-template")); }).forEach(function (r) { return r.parentElement.removeChild(r); });
};
HTMLElement.prototype.SaveDirty = function () {
    var t = this, p = Is.Alive(t.Binder) ? t : t.Ancestor(function (p) { return Is.Alive(p.Binder); });
    if (p && p.Binder) {
        p.Binder.SaveDirty();
    }
};
HTMLElement.prototype.Save = function () {
    var t = this, p = t.Ancestor(function (p) { return Is.Alive(p.Binder); });
    if (p && p.Binder) {
        p.Binder.Save(t.DataObject);
    }
};
HTMLElement.prototype.Get = function (func, notRecursive, nodes) {
    var n = !Is.Alive(nodes) ? new Array() : nodes;
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
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
    var t = this, p = t.Ancestor(function (p) { return Is.Alive(p.Binder); });
    if (p && p.Binder) {
        p.Binder.Delete(this, null);
    }
};
HTMLElement.prototype.Ancestor = function (func) {
    var p = this.parentElement;
    while (Is.Alive(p) && !func(p)) {
        p = p.parentElement;
    }
    return p;
};
HTMLElement.prototype.Set = function (objectProperties) {
    var t = this, op = objectProperties;
    if (op) {
        for (var p in op) {
            if (p !== "cls" && p !== "className") {
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
//# sourceMappingURL=HTMLElement.js.map