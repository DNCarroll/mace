interface String {
    Trim(): string;
    Element(): HTMLElement;
    Element<T extends HTMLElement>(): T;
    IsStyle(): boolean;
    RemoveSpecialCharacters(replaceWithCharacter?: string): string;
    Post(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    Put(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    Get(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    Delete(cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean);
    GetStyle(): string;
    CopyToClipboard(sender: HTMLElement): (alertMessage: string, timeout?: number, attributeAndStyle?: any) => void;
    Alert(target: HTMLElement, timeout?: any, attributesAndStyle?: any);
    ReplaceAll(replace: string, withValue: string): string;
}
String.prototype.ReplaceAll = function (replace: string, withValue: string): string {
    return this.replace(new RegExp(replace, 'g'), withValue);
}
String.prototype.GetStyle = function (): string {
    var v = <string>this;
    if (v) {
        for (var p in document.body.style) {
            if (p.toLowerCase() === v.toLowerCase()) {
                return p;
            }
        }
    }
    return null;
}
String.prototype.CopyToClipboard = function (sender: HTMLElement): (alertMessage: string, timeout?: number, attributeAndStyle?: any) => void {
    var v = <string>this;
    var el = document.createElement('textarea');
    let t = sender;

    el.value = v;
    el.setAttribute('readonly', '');
    el.style.position = 'absolute';
    el.style.left = '-9999px';
    t.appendChild(el);
    el.select();
    document.execCommand('copy');
    t.removeChild(el);

    var alert = (alertMessage: string = "Copied to clipboard", timeout: number = 1500, attributeAndStyle: any = null) => {
        alertMessage.Alert(t, timeout, attributeAndStyle);
    }
    return alert;
}
String.prototype.Alert = function (target: HTMLElement, timeout: number = 1500, attributesAndStyle: any = null) {

    var message = <string>this;
    let s = target, b = document.body;

    var bx = s.getBoundingClientRect(),
        de = document.documentElement, w = window,
        st = w.pageYOffset || de.scrollTop || b.scrollTop,
        sl = w.pageXOffset || de.scrollLeft || b.scrollLeft,
        ct = de.clientTop || b.clientTop || 0,
        cl = de.clientLeft || b.clientLeft || 0,
        t = bx.top + st - ct + bx.height,
        l = bx.left + sl - cl;

    let d = document.NewE(tag.div, {
        fontSize: ".9rem", padding: ".125rem .25rem", position: "absolute", zIndex: "1000000000", border: 'solid 1px gray', className: "alert alert-light",
        top: t + "px", left: l + "px"
    });

    d["role"] = "alert";

    if (attributesAndStyle) {
        var op = attributesAndStyle;
        for (var p in op) {
            var sp = p.GetStyle();
            if (sp) {
                d.style[sp] = op[p];
            }
            else if (p === "class") {
                var cs = op[p].toString().split(" ");
                cs.forEach(c => d.classList.add(c));
            }
            else {
                d[p] = op[p];
            }
        }
    }

    d.innerHTML = message;
    b.appendChild(d);

    setTimeout(() => {
        b.removeChild(d);
    }, timeout);

}
String.prototype.Delete = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean) {
    withProgress = Is.Alive(withProgress) ? withProgress : true;
    var a = new Ajax(withProgress);
    a.AddListener(EventType.Any, cb);
    a.Delete(this, parameter);
};
String.prototype.Get = function (cb: (arg: ICustomEventArg<Ajax>) => void, parameter?: any, withProgress?: boolean) {
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
    s = s.trim();
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
String.prototype.IsStyle = function () {
    return Is.Alive(document.body.style[this]);
};
interface Window {
    Exception(parameters: any);
}
Window.prototype.Exception = function (parameters: any) {
    var a = alert, p = parameters;
    a(Is.Array(p) || !Is.String(p) ? JSON.stringify(p) : p.toString());
}; 