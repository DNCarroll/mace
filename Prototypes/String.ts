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
String.prototype.CreateElement = function (eleAttrs?): HTMLElement {
    var o = document.createElement(this);
    if (eleAttrs) {
        o.Set(eleAttrs);
    }
    return o;
};
String.prototype.CreateElementFromHtml = function (): HTMLElement {
    var ret = new Array<HTMLElement>();
    var div = "div".CreateElement({ innerHTML: this });
    while (div.children.length > 0) {
        var child = div.children[div.children.length - 1];
        return <HTMLElement>child;
    }
};
String.prototype.IsStyle = function() {
    for (var prop in document.body.style) {
        if (prop.toLowerCase() === this.toLowerCase()) {
            return true;
        }
    }
    return false;
}