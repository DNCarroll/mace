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
    var obj = document.getElementById(this.toString());
    return obj ? <HTMLElement>obj : null;
};
String.prototype.CreateElement = function (objectProperties?): HTMLElement {
    var obj = document.createElement(this);
    if (objectProperties) {
        obj.Set(objectProperties);
    }
    return obj;
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