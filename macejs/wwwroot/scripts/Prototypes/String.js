String.prototype.RemoveSpecialCharacters = function (replaceWithCharacter) {
    var s = this, p = null, r = "", rc = !Is.Alive(replaceWithCharacter) ? "-" : replaceWithCharacter;
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
    return document.getElementById(this.toString());
};
String.prototype.CreateElement = function (objectProperties) {
    var o = document.createElement(this), op = objectProperties;
    if (op) {
        o.Set(op);
    }
    return o;
};
String.prototype.CreateElementFromHtml = function () {
    var d = "div".CreateElement({ innerHTML: this }), dcs = d.children;
    while (dcs.length > 0) {
        var c = dcs[dcs.length - 1];
        return c;
    }
};
String.prototype.IsStyle = function () {
    for (var p in document.body.style) {
        return p.toLowerCase() === this.toLowerCase();
    }
    return false;
};
//# sourceMappingURL=String.js.map