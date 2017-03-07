interface String {
    Trim(): string;
    Element(): HTMLElement;  
    CreateElement(objectProperties?): HTMLElement;    
    CreateElementFromHtml(): HTMLElement;
    IsStyle(): boolean;
}
String.prototype.Trim = function () {
    return this.replace(/^\s+|\s+$/g, "");
};
String.prototype.Element = function (): HTMLElement {
    return document.getElementById(this.toString());
};
String.prototype.CreateElement = function (objectProperties?): HTMLElement {
    var o = document.createElement(this), op = objectProperties;
    if (op) {
        o.Set(op);
    }
    return o;
};
String.prototype.CreateElementFromHtml = function (): HTMLElement {
    var d = "div".CreateElement({ innerHTML: this }),
        dcs = d.children;
    while (dcs.length > 0) {
        var c = dcs[dcs.length - 1];
        return <HTMLElement>c;
    }
};
String.prototype.IsStyle = function () {
    for (var p in document.body.style) {
        return p.toLowerCase() === this.toLowerCase()
    }
    return false;
};