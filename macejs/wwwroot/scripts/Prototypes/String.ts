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
    GetStyle(): string;
    CopyToClipboard(sender: HTMLElement): (alertMessage: string, timeout?: number, attributeAndStyle?: any) => void;
    Alert(target: HTMLElement, timeout?: any, attributesAndStyle?: any);  
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
    let t = sender;
    let text = <string>this;
    var fbCopyText = (text, housingElement: HTMLElement) => {
        var ele = document.createElement("input");
        ele.value = text;
        ele.style.height = "1px";
        ele.style.width = "1px";
        housingElement.appendChild(ele);
        ele.focus();
        ele.select();
        try {

            var successful = document.execCommand('copy');
            var msg = successful ? 'successful' : 'unsuccessful';
            console.log('Fallback: Copying text command was ' + msg);
        } catch (err) {
            console.error('Fallback: Oops, unable to copy', err);
        }
        housingElement.removeChild(ele);
    };
    if (!navigator["clipboard"]) {
        fbCopyText(text, t);
    }
    else {
        navigator["clipboard"].writeText(text).then(function () {
            console.log('Async: Copying to clipboard was successful!');
        }, function (err) {
            console.error('Async: Could not copy text: ', err);
        });
    }
    var alert = (alertMessage: string = "Copied to clipboard", timeout: number = 1500, attributeAndStyle: any = null) => {
        alertMessage.Alert(t, timeout, attributeAndStyle);
    }
    return alert;
}
String.prototype.Alert = function (target: HTMLElement, timeout: number = 1500, attributesAndStyle: any = null) {

    var message = <string>this;
    let s = target, b = document.body,
        d = document.createElement("div");

    var bx = s.getBoundingClientRect(),
        de = document.documentElement, w = window,
        st = w.pageYOffset || de.scrollTop || b.scrollTop,
        sl = w.pageXOffset || de.scrollLeft || b.scrollLeft,
        ct = de.clientTop || b.clientTop || 0,
        cl = de.clientLeft || b.clientLeft || 0,
        t = bx.top + st - ct - bx.height,
        l = bx.left + sl - cl;

    d.classList.add("alert");
    d.classList.add("alert-light");
    d["role"] = "alert"
    d.style.fontSize = ".9rem";
    d.style.padding = ".125rem .25rem";
    d.style.position = "absolute";
    d.style.zIndex = "1000000000";
    d.style.top = t + "px";
    d.style.left = l + "px";

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