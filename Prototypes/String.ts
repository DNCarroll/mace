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
    var o = document.getElementById(this.toString());
    return o ? <HTMLElement>o : null;
};
String.prototype.CreateElement = function (objectProperties?): HTMLElement {
    var o = document.createElement(this);
    if (objectProperties) {
        o.Set(objectProperties);
    }
    return o;
};
String.prototype.CreateElementFromHtml = function (): HTMLElement {
    var d = "div".CreateElement({ innerHTML: this });
    var dcs = d.children;
    while (dcs.length > 0) {
        var c = dcs[dcs.length - 1];
        return <HTMLElement>c;
    }
};
String.prototype.IsStyle = function () {
    for (var p in document.body.style) {
        if (p.toLowerCase() === this.toLowerCase()) {
            return true;
        }
    }
    return false;
};