String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.TrimCharacters = function (characterAtZero, characterAtEnd) {
    var ret = this;
    if (characterAtZero) {
        if (ret.indexOf(characterAtZero) == 0) {
            ret = ret.substring(1);
        }
    }
    if (characterAtEnd) {
        var lastCharacter = ret.substring(ret.length - 1);
        if (lastCharacter == characterAtEnd) {
            ret = ret.substring(0, ret.length - 1);
        }
    }
    return ret;
};
String.prototype.Element = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.Form = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.List = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.Input = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
};
String.prototype.DropDown = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return obj;
    }
    return null;
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
//# sourceMappingURL=String.js.map