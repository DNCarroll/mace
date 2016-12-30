String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.Element = function () {
    var o = document.getElementById(this.toString());
    return o ? o : null;
};
String.prototype.CreateElement = function (eleAttrs) {
    var o = document.createElement(this);
    if (eleAttrs) {
        o.Set(eleAttrs);
    }
    return o;
};
String.prototype.CreateElementFromHtml = function () {
    var ret = new Array();
    var div = "div".CreateElement({ innerHTML: this });
    while (div.children.length > 0) {
        var child = div.children[div.children.length - 1];
        return child;
    }
};
String.prototype.IsStyle = function () {
    for (var prop in document.body.style) {
        if (prop.toLowerCase() === this.toLowerCase()) {
            return true;
        }
    }
    return false;
};
//# sourceMappingURL=String.js.map