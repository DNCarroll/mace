interface Document {
    NewE<T extends string>(tagName: T): Caster<T>;
    NewE<T extends string>(tagName: T, objectProperties?: any): Caster<T>;
}
Document.prototype.NewE = function <T extends string>(tagName: T, objectProperties?: any): Caster<T> {
    var ele = document.createElement(tagName.toUpperCase()), op = objectProperties;
    if (op) {
        ele.Set(op);
    }
    return <Caster<T>>ele;
};
type AllElements = {
    'a': HTMLAnchorElement,
    'div': HTMLDivElement,
    'span': HTMLSpanElement,
    'table': HTMLTableElement,
    'tr': HTMLTableRowElement,
    'td': HTMLTableCellElement,
    'input': HTMLInputElement,
    'textarea': HTMLTextAreaElement,
    'select': HTMLSelectElement,
    'button': HTMLButtonElement,
    'label': HTMLLabelElement,
    'th': HTMLTableHeaderCellElement,
    'tfoot': HTMLTableSectionElement,
    'tbody': HTMLTableSectionElement,
    'thead': HTMLTableSectionElement,
    'any': HTMLElement,
    'form': HTMLFormElement,
    'i': HTMLElement,
    'fieldset': HTMLFieldSetElement,
    'ul': HTMLUListElement,
    "li": HTMLLIElement
};
type Caster<T extends string> = T extends keyof AllElements ? AllElements[T] : HTMLElement;
module tag {
    export const any = 'any';
    export const div = 'div';
    export const input = 'input';
    export const textarea = 'textarea';
    export const select = 'select';
    export const button = 'button';
    export const a = 'a';
    export const span = 'span';
    export const label = 'label';
    export const table = 'table';
    export const tr = 'tr';
    export const td = 'td';
    export const th = 'th';
    export const thead = 'thead';
    export const tfoot = 'tfoot';
    export const tbody = 'tbody';
    export const form = 'form';
    export const i = 'i';
    export const fieldset = 'fieldset';
    export const ul = 'ul';
    export const li = 'li';
};
module HTMLElementHelper {
    export function IsMatch<T extends string>(ele: HTMLElement, tagName: string, predicate: (ele: Caster<T>) => boolean = null): boolean {
        predicate = predicate === null ? (e: Caster<T>) => true : predicate;
        return (tagName === tag.any || ele.tagName.toLowerCase() === tagName) && predicate(<Caster<T>>ele);
    }
}
interface HTMLElement extends Element {
    Get(func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[];

    First<T extends string>(tagName: T): Caster<T>;
    First<T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean): Caster<T>;

    Clear();
    AddListener(eventName, method);
    HasDataSet: () => boolean;
    GetDataSetAttributes: () => { Attribute: string; Property: any; }[];
    Binder: Binder;
    Cast<T extends DataObject>(type: { new(serverObject: any): T; }): T;
    DataObject: IObjectState;
    Delete();
    Save();
    SaveDirty();
    Ancestor<T extends string>(tagName: T): Caster<T>;
    Ancestor<T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean): Caster<T>;
    Relative<T extends string>(tagName: T): Caster<T>;
    Relative<T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean): Caster<T>;

    ClearBoundElements();
    Bind(obj: any);
    Bind(obj: any, refresh: boolean);
    IndexOf(ele: HTMLElement);
    PostAndInsertBefore(obj: any, index: number);
    PostAndInsertBeforeChild(childMatch: (child) => boolean, obj: any);
    PostAndAppend(obj: any);
    Append(obj: any);
    InsertBefore(obj: any, index: number);
    InsertBeforeChild(childMatch: (child) => boolean, obj: any);
    Set(objectProperties): HTMLElement;
    PopupShow(coord?: any);
    PopupHide();
    PopupAt(target: HTMLElement, placement: Placement, offset?: { x: number, y: number });
    GetPosition(): { x: number, y: number };
}
HTMLElement.prototype.PopupHide = function () {
    Popup.Hide();
};
HTMLElement.prototype.GetPosition = function () {
    var pos = { x: 0, y: 0 };
    var el = <HTMLElement>this;
    var xPos = 0;
    var yPos = 0;

    while (el) {
        if (el.tagName == "BODY") {
            var xScroll = el.scrollLeft || document.documentElement.scrollLeft;
            var yScroll = el.scrollTop || document.documentElement.scrollTop;

            xPos += (el.offsetLeft - xScroll + el.clientLeft);
            yPos += (el.offsetTop - yScroll + el.clientTop);
        } else {
            xPos += (el.offsetLeft - el.scrollLeft + el.clientLeft);
            yPos += (el.offsetTop - el.scrollTop + el.clientTop);
        }
        el = <HTMLElement>el.offsetParent;
    }
    return {
        x: xPos,
        y: yPos
    };
};
HTMLElement.prototype.PopupAt = function (target: HTMLElement, placement: Placement, offset?: { x: number, y: number }) {

    var pup = <HTMLElement>this;
    let pos = target.GetPosition(),
        width = pup.style.width,
        wrad = width.indexOf("px") > -1 ? parseInt(width.replace("px", "")) :
            parseInt(pup.style.width.replace("rem", "").replace("em", "")) * 16;
    switch (placement) {
        case Placement.RightBottom:
            pos.x += target.clientWidth;
            pos.y += target.clientHeight;
            break;
        case Placement.RightTop:
            pos.x += target.clientWidth;
            break;
        case Placement.LeftBottom:
            pos.y += target.clientHeight;
            break;
        case Placement.LeftTop:
        default:
            break;
    }
    pup.PopupShow({ left: pos.x - wrad + (offset ? offset.x : 0), top: pos.y + (offset ? offset.y : 0) });
};
HTMLElement.prototype.PopupShow = function (coord?: any) {
    var e = <HTMLElement>this;
    Popup.Show(e, coord);
};
HTMLElement.prototype.Cast = function <T extends IObjectState>(type: { new(serverObject: any): T; }): T {
    var f = this.DataObject;
    return f ? <T>f : null;
};
HTMLElement.prototype.First = function <T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean = null): Caster<T> {
    var chs = (<HTMLElement>this).children;

    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
            if (HTMLElementHelper.IsMatch(c, tagName, predicate)) {
                return <Caster<T>>c;
            }
        }
    }
    for (var j = 0; j < chs.length; j++) {
        let c = <HTMLElement>chs[j];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
            if (c.First) {
                let f = c.First(tagName, predicate);
                if (f) {
                    return <Caster<T>>f;
                }
            }
        }
    }
    return null;
};
HTMLElement.prototype.Relative = function <T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean = null): Caster<T> {
    if (!Is.Alive(this || this.parentElement)) {
        return null;
    }
    var p = <HTMLElement>this.parentElement;
    if (HTMLElementHelper.IsMatch(p, tagName, predicate)) {
        return <Caster<T>>p;
    } else {
        var chs = (<HTMLElement>p).children;
        for (var i = 0; i < chs.length; i++) {
            let c = <HTMLElement>chs[i];
            if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
                if (HTMLElementHelper.IsMatch(c, tagName, predicate)) {
                    return <Caster<T>>c;
                }

                var r = c.First(tagName, predicate);
                if (Is.Alive(r)) {
                    return <Caster<T>>r;
                }
            }
        }
        return p.Relative(tagName, predicate);
    }
};
HTMLElement.prototype.InsertBeforeChild = function (childMatch: (child) => boolean, obj: any) {
    var p = <HTMLElement>this;
    var fc = p.First(tag.any, childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = <HTMLElement>this;
            p.InsertBefore(obj, i);
        }
    }

};
HTMLElement.prototype.InsertBefore = function (obj: any, index: number) {
    var p = <HTMLElement>this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder
    }
    if (Is.Alive(b)) {
        b.InsertBefore(obj, index);
    }
};
HTMLElement.prototype.Append = function (obj: any) {
    var p = <HTMLElement>this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder
    }
    if (Is.Alive(b)) {
        b.Append(obj);
    }
};
HTMLElement.prototype.PostAndAppend = function (obj: any) {
    var p = <HTMLElement>this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder
    }
    if (Is.Alive(b)) {
        b.PostAndAppend(obj);
    }
};
HTMLElement.prototype.PostAndInsertBeforeChild = function (childMatch: (child) => boolean, obj: any) {
    var p = <HTMLElement>this;
    var fc = p.First(tag.any, childMatch);
    if (fc) {
        p = fc.parentElement;
        var i = p.IndexOf(fc);
        if (Is.Alive(i)) {
            p = <HTMLElement>this;
            p.PostAndInsertBefore(obj, i);
            return;
        }
    }
    p = <HTMLElement>this;
    p.PostAndAppend(obj);
};
HTMLElement.prototype.PostAndInsertBefore = function (obj: any, index: number) {
    var p = <HTMLElement>this, b = p.Binder;
    while (!Is.Alive(b) && Is.Alive(p)) {
        p = p.parentElement;
        if (!Is.Alive(p)) {
            break;
        }
        b = p.Binder
    }
    if (Is.Alive(b)) {
        b.PostAndInsertBefore(obj, index);
    }
};
HTMLElement.prototype.IndexOf = function (child: HTMLElement) {
    var p = <HTMLElement>this, c = p.children;
    var i = c.length - 1;
    for (; i >= 0; i--) {
        if (child === c[i]) {
            return i;
        }
    }
    return undefined;
};
HTMLElement.prototype.Bind = function (obj: any, refresh: boolean = false) {
    var t = <HTMLElement>this;
    if (refresh) {
        //you might be clearing out elements before the template has been aquired
        t.ClearBoundElements();
    }
    var b = t.Binder;
    if (b) {
        if (obj instanceof ViewInstance) {
            b.Refresh(<ViewInstance>obj);
        }
        else if (obj instanceof Array) {
            var arr = <Array<any>>obj;
            for (var i = 0; i < arr.length; i++) {
                var tempObj = arr[i];
                b.Append(tempObj);
            }
        }
        else if (obj) {
            b.Append(obj);
        }
    }
};
HTMLElement.prototype.ClearBoundElements = function () {
    var t = <HTMLElement>this;
    t.Get(e => Is.Alive(e.getAttribute("data-template"))).forEach(r => r.parentElement.removeChild(r));
    if (t.Binder) {
        while (t.Binder.DataObjects.Data.length > 0) {
            t.Binder.DataObjects.Data.pop();
        }
    }
};
HTMLElement.prototype.SaveDirty = function () {
    let t = <HTMLElement>this,
        p = Is.Alive(t.Binder) ? t : t.Ancestor(tag.any, p => Is.Alive(p.Binder));
    if (p && p.Binder) {
        p.Binder.SaveDirty();
    }
};
HTMLElement.prototype.Save = function () {
    var t = <HTMLElement>this, p = t.Ancestor(tag.any, p => Is.Alive(p.Binder));
    if (p && p.Binder) {
        p.Binder.Save(t.DataObject);
    }
};
HTMLElement.prototype.Get = function (func: (ele: HTMLElement) => boolean, notRecursive?: boolean, nodes?: Array<HTMLElement>): HTMLElement[] {
    var n = !Is.Alive(nodes) ? new Array<HTMLElement>() : nodes;
    var chs = (<HTMLElement>this).children;
    for (var i = 0; i < chs.length; i++) {
        let c = <HTMLElement>chs[i];
        if (c.nodeType === 1 && c.tagName.toLowerCase() !== "svg") {
            if (func(c)) {
                n.push(c);
            }
            if (!notRecursive && c.Get) {
                c.Get(func, notRecursive, n);
            }
        }
    }
    return n;
};
HTMLElement.prototype.Clear = function () {
    var t = <HTMLElement>this;
    var chs = t.childNodes;
    while (chs.length > 0) {
        t.removeChild(chs[0]);
    }
};
HTMLElement.prototype.AddListener = function (eventName, method) {
    this.addEventListener ? this.addEventListener(eventName, method) : this.attachEvent(eventName, method);
};
HTMLElement.prototype.HasDataSet = function () {
    var d = this["dataset"];
    if (d) {
        for (var p in d) {
            return true;
        }
    }
    return false;
};
HTMLElement.prototype.GetDataSetAttributes = function () {
    var r = new Array<{ Attribute: string; Property: any; }>();
    var d = this["dataset"];
    if (d) {
        for (var p in d) {
            r.Add({ Attribute: p, Property: d[p] });
        }
    }
    return r;
};
HTMLElement.prototype.Delete = function () {
    var t = <HTMLElement>this, p = t.Ancestor(tag.any, p => Is.Alive(p.Binder));
    if (p && p.Binder) {
        p.Binder.Delete(this, null);
    }
};
HTMLElement.prototype.Ancestor = function <T extends string>(tagName: T, predicate: (ele: Caster<T>) => boolean = null): Caster<T> {
    var p = <HTMLElement>this.parentElement;
    if (!Is.Alive(p)) {
        return null;
    }
    return HTMLElementHelper.IsMatch(p, tagName, predicate) ? <Caster<T>>p : p.Ancestor(tagName, predicate);
}
HTMLElement.prototype.Set = function (objectProperties) {
    var t = <HTMLElement>this, op = objectProperties;
    if (op) {
        for (var p in op) {
            if (p !== "cls" && p !== "className") {
                if (p.IsStyle()) {
                    t.style[p] = op[p];
                }
                else if (p === "style") {
                    if (op.style.cssText) {
                        t.style.cssText = op.style.cssText;
                    }
                }
                else {
                    t[p] = op[p];
                }
            }
            else {
                t.className = null;
                t.className = op[p];
            }
        }
    }
    return t;
};