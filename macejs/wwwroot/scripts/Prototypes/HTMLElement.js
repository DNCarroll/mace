Document.prototype.NewE = function (tagName, objectProperties) {
    var ele = document.createElement(tagName.toUpperCase()), op = objectProperties;
    if (op) {
        ele.Set(op);
    }
    return ele;
};
var tag;
(function (tag) {
    tag.any = 'any';
    tag.div = 'div';
    tag.input = 'input';
    tag.textarea = 'textarea';
    tag.select = 'select';
    tag.button = 'button';
    tag.a = 'a';
    tag.span = 'span';
    tag.label = 'label';
    tag.table = 'table';
    tag.tr = 'tr';
    tag.td = 'td';
    tag.th = 'th';
    tag.thead = 'thead';
    tag.tfoot = 'tfoot';
    tag.tbody = 'tbody';
    tag.form = 'form';
    tag.i = 'i';
    tag.fieldset = 'fieldset';
    tag.ul = 'ul';
    tag.li = 'li';
})(tag || (tag = {}));
;
var HTMLElementHelper;
(function (HTMLElementHelper) {
    function IsMatch(ele, tagName, predicate) {
        if (predicate === void 0) { predicate = null; }
        predicate = predicate === null ? function (e) { return true; } : predicate;
        return (tagName === tag.any || ele.tagName.toLowerCase() === tagName) && predicate(ele);
    }
    HTMLElementHelper.IsMatch = IsMatch;
})(HTMLElementHelper || (HTMLElementHelper = {}));
HTMLElement.prototype.PopupHide = function () {
    Popup.Hide();
};
HTMLElement.prototype.GetPosition = function () {
    var pos = { x: 0, y: 0 };
    var el = this;
    var xPos = 0;
    var yPos = 0;
    while (el) {
        if (el.tagName == "BODY") {
            var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
            var yScroll = el.scrollTop || document.documentElement.scrollTop;
            xPos += (el.offsetLeft - xScroll + el.clientLeft);
            yPos += (el.offsetTop - yScroll + el.clientTop);
        }
        else {
            xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            yPos += (el.offsetTop - el.scrollTop + el.clientTop);
        }
        el = el.offsetParent;
    }
    return {
        x: xPos,
        y: yPos
    };
};
HTMLElement.prototype.PopupAt = function (target, placement, offset) {
    var pup = this;
    var pos = target.GetPosition(), width = pup.style.width, wrad = width.indexOf("px") > -1 ? parseInt(width.replace("px", "")) :
        parseInt(pup.style.width.replace("rem", "").replace("em", "")) * 16;
    switch (placement) {
        case Placement.RightBottom:
            pos.x += target.clientWidth;
            pos.y += target.clientHeight;
            break;
        case Placement.RightTop:
            pos.x += target.clientWidth;
            break;
        case Placement.LeftBottom:
            pos.y += target.clientHeight;
            break;
        case Placement.LeftTop:
        default:
            break;
    }
    pup.PopupShow({ left: pos.x - wrad + (offset ? offset.x : 0), top: pos.y + (offset ? offset.y : 0) });
};
HTMLElement.prototype.PopupShow = function (coord) {
    var e = this;
    Popup.Show(e, coord);
};
HTMLElement.prototype.Cast = function (type) {
    var f = this.DataObject;
    return f ? f : null;
};
HTMLElement.prototype.First = function (tagName, predicate) {
    if (predicate === void 0) { predicate = null; }
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        var c = chs[i];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
            if (HTMLElementHelper.IsMatch(c, tagName, predicate)) {
                return c;
            }
        }
    }
    for (var j = 0; j < chs.length; j++) {
        var c = chs[j];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
            if (c.First) {
                var f = c.First(tagName, predicate);
                if (f) {
                    return f;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Relative = function (tagName, predicate) {
    if (predicate === void 0) { predicate = null; }
    if (!Is.Alive(this || this.parentElement)) {
        return null;
    }
    var p = this.parentElement;
    if (HTMLElementHelper.IsMatch(p, tagName, predicate)) {
        return p;
    }
    else {
        var chs = p.children;
        for (var i = 0; i < chs.length; i++) {
            var c = chs[i];
            if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
                if (HTMLElementHelper.IsMatch(c, tagName, predicate)) {
                    return c;
                }
                var r = c.First(tagName, predicate);
                if (Is.Alive(r)) {
                    return r;
                }
            }
        }
        return p.Relative(tagName, predicate);
    }
};
HTMLElement.prototype.InsertBeforeChild = function (childMatch, obj) {
    var p = this;
    var fc = p.First(tag.any, childMatch);
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
    var fc = p.First(tag.any, childMatch);
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
    var t = this;
    if (refresh) {
        //you might be clearing out elements before the template has been aquired
        t.ClearBoundElements();
    }
    var b = t.Binder;
    if (b) {
        if (obj instanceof ViewInstance) {
            b.Refresh(obj);
        }
        else if (obj instanceof Array) {
            var arr = obj;
            for (var i = 0; i < arr.length; i++) {
                var tempObj = arr[i];
                b.Append(tempObj);
            }
        }
        else if (obj) {
            b.Append(obj);
        }
    }
};
HTMLElement.prototype.ClearBoundElements = function () {
    var t = this;
    t.Get(function (e) { return Is.Alive(e.getAttribute("data-template")); }).forEach(function (r) { return r.parentElement.removeChild(r); });
    if (t.Binder) {
        while (t.Binder.DataObjects.Data.length > 0) {
            t.Binder.DataObjects.Data.pop();
        }
    }
};
HTMLElement.prototype.SaveDirty = function () {
    var t = this, p = Is.Alive(t.Binder) ? t : t.Ancestor(tag.any, function (p) { return Is.Alive(p.Binder); });
    if (p && p.Binder) {
        p.Binder.SaveDirty();
    }
};
HTMLElement.prototype.Save = function () {
    var t = this, p = t.Ancestor(tag.any, function (p) { return Is.Alive(p.Binder); });
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
    var t = this, p = t.Ancestor(tag.any, function (p) { return Is.Alive(p.Binder); });
    if (p && p.Binder) {
        p.Binder.Delete(this, null);
    }
};
HTMLElement.prototype.Ancestor = function (tagName, predicate) {
    if (predicate === void 0) { predicate = null; }
    var p = this.parentElement;
    if (!Is.Alive(p)) {
        return null;
    }
    return HTMLElementHelper.IsMatch(p, tagName, predicate) ? p : p.Ancestor(tagName, predicate);
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