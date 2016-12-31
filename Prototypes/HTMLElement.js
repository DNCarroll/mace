HTMLElement.prototype.Get = function (func, notRecursive, nodes) {
    nodes == null ? nodes = new Array() : null;
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        if (chs[i].nodeType == 1
            && chs[i].tagName.toLowerCase() != "svg") {
            var c = chs[i];
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
HTMLElement.prototype.First = function (predicate) {
    var chs = this.children;
    for (var i = 0; i < chs.length; i++) {
        if (chs[i].nodeType == 1 && chs[i].tagName.toLowerCase() != "svg") {
            var c = chs[i];
            if (predicate(c)) {
                return c;
            }
        }
    }
    for (var i = 0; i < chs.length; i++) {
        if (chs[i].nodeType == 1 && chs[i].tagName.toLowerCase() != "svg") {
            var c = chs[i];
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
    var t = this;
    if (objectProperties) {
        for (var p in objectProperties) {
            if (p != "cls" && p != "className") {
                if (p.IsStyle()) {
                    t.style[p] = objectProperties[p];
                }
                else if (p === "style") {
                    if (objectProperties.style.cssText) {
                        t.style.cssText = objectProperties.style.cssText;
                    }
                }
                else {
                    t[p] = objectProperties[p];
                }
            }
            else {
                t.className = null;
                t.className = objectProperties[p];
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
//# sourceMappingURL=HTMLElement.js.map