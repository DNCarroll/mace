interface String {
    Trim(): string;
    Element(): HTMLElement;
    Element<T extends HTMLElement>(): T;
    CreateElement(objectProperties?): HTMLElement;
    IsStyle(): boolean;
    RemoveSpecialCharacters(replaceWithCharacter?: string): string;
    Post(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    Put(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    Get(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);  
    Delete(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
}
String.prototype.Delete = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Delete(this, parameter);
};
String.prototype.Get = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any , withProgress?: boolean) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Get(this, parameter);
};
String.prototype.Post = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Post(this, parameter);
};
String.prototype.Put = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Put(this, parameter);
};
String.prototype.RemoveSpecialCharacters = function (replaceWithCharacter?: string) {
    var s = <string>this, p: string = null, r: string = "", rc = !Is.Alive(replaceWithCharacter) ? "-" : replaceWithCharacter;
    for (var i = 0; i < s.length; i++) {
        let c = s.charAt(i);
        let m = c.match(/\w/);
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
String.prototype.Element = function <T extends HTMLElement>(): T {
    var e = document.getElementById(this.toString());
    return e ? <T>e : null;
};
String.prototype.CreateElement = function (objectProperties?): HTMLElement {
    var o = document.createElement(this), op = objectProperties;
    if (op) {
        o.Set(op);
    }
    return o;
};
String.prototype.IsStyle = function () {
    for (var p in document.body.style) {
        return p.toLowerCase() === this.toLowerCase()
    }
    return false;
}; 