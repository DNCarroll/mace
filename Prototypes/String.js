String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.Element = function () {
    var obj = document.getElementById(this.toString());
    return obj ? obj : null;
};
String.prototype.CreateElement = function (objectProperties) {
    var obj = document.createElement(this);
    if (objectProperties) {
        obj.Set(objectProperties);
    }
    return obj;
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