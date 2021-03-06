String.prototype.ReplaceAll = function (replace, withValue) {
    return this.replace(new RegExp(replace, 'g'), withValue);
};
String.prototype.GetStyle = function () {
    var v = this;
    if (v) {
        for (var p in document.body.style) {
            if (p.toLowerCase() === v.toLowerCase()) {
                return p;
            }
        }
    }
    return null;
};
String.prototype.CopyToClipboard = function (sender) {
    var v = this;
    var el = document.createElement('textarea');
    var t = sender;
    el.value = v;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    t.appendChild(el);
    el.select();
    document.execCommand('copy');
    t.removeChild(el);
    var alert = function (alertMessage, timeout, attributeAndStyle) {
        if (alertMessage === void 0) { alertMessage = "Copied to clipboard"; }
        if (timeout === void 0) { timeout = 1500; }
        if (attributeAndStyle === void 0) { attributeAndStyle = null; }
        alertMessage.Alert(t, timeout, attributeAndStyle);
    };
    return alert;
};
String.prototype.Alert = function (target, timeout, attributesAndStyle) {
    if (timeout === void 0) { timeout = 1500; }
    if (attributesAndStyle === void 0) { attributesAndStyle = null; }
    var message = this;
    var s = target, b = document.body;
    var bx = s.getBoundingClientRect(), de = document.documentElement, w = window, st = w.pageYOffset || de.scrollTop || b.scrollTop, sl = w.pageXOffset || de.scrollLeft || b.scrollLeft, ct = de.clientTop || b.clientTop || 0, cl = de.clientLeft || b.clientLeft || 0, t = bx.top + st - ct + bx.height, l = bx.left + sl - cl;
    var d = document.NewE(tag.div, {
        fontSize: ".9rem", padding: ".125rem .25rem", position: "absolute", zIndex: "1000000000", border: 'solid 1px gray', className: "alert alert-light",
        top: t + "px", left: l + "px"
    });
    d["role"] = "alert";
    if (attributesAndStyle) {
        var op = attributesAndStyle;
        for (var p in op) {
            var sp = p.GetStyle();
            if (sp) {
                d.style[sp] = op[p];
            }
            else if (p === "class") {
                var cs = op[p].toString().split(" ");
                cs.forEach(function (c) { return d.classList.add(c); });
            }
            else {
                d[p] = op[p];
            }
        }
    }
    d.innerHTML = message;
    b.appendChild(d);
    setTimeout(function () {
        b.removeChild(d);
    }, timeout);
};
String.prototype.Delete = function (cb, parameter, withProgress) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Delete(this, parameter);
};
String.prototype.Get = function (cb, parameter, withProgress) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Get(this, parameter);
};
String.prototype.Post = function (cb, parameter, withProgress) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Post(this, parameter);
};
String.prototype.Put = function (cb, parameter, withProgress) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Put(this, parameter);
};
String.prototype.RemoveSpecialCharacters = function (replaceWithCharacter) {
    var s = this, p = null, r = "", rc = !Is.Alive(replaceWithCharacter) ? "-" : replaceWithCharacter;
    s = s.trim();
    for (var i = 0; i < s.length; i++) {
        var c = s.charAt(i);
        var m = c.match(/\w/);
        if ((c === rc && p !== rc) || (m && m.length > 0)) {
            r += c;
            p = c;
        }
        else if (c === " " && p !== rc) {
            p = rc;
            r += p;
        }
    }
    return r;
};
String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.Element = function () {
    var e = document.getElementById(this.toString());
    return e ? e : null;
};
String.prototype.IsStyle = function () {
    return Is.Alive(document.body.style[this]);
};
//# sourceMappingURL=String.js.map