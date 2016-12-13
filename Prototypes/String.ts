interface String {
    Trim(): string;
    TrimCharacters(characterAtZero: string, characterAtEnd: string): string;
    Element(): HTMLElement;
    Form(): HTMLFormElement;
    List(): HTMLUListElement;
    Input(): HTMLInputElement;
    DropDown(): HTMLSelectElement;
    CreateElement(objectProperties?): HTMLElement;    
    CreateElementFromHtml(): HTMLElement;
}
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

String.prototype.Element = function (): HTMLElement {

    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLElement>obj;
    }
    return null;
};
String.prototype.Form = function (): HTMLFormElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLFormElement>obj;
    }
    return null;
};
String.prototype.List = function (): HTMLUListElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLUListElement>obj;
    }
    return null;
};
String.prototype.Input = function () {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLInputElement>obj;
    }
    return null;
};
String.prototype.DropDown = function (): HTMLSelectElement {
    var obj = document.getElementById(this.toString());
    if (obj) {
        return <HTMLSelectElement>obj;
    }
    return null;
};
String.prototype.CreateElement = function (objectProperties?): HTMLElement {
    var obj = document.createElement(this);
    if (objectProperties) {
        obj.Set(objectProperties);
    }
    return obj;
};