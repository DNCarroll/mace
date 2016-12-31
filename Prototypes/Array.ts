interface Array<T> {     
    Add(obj: any);
    Add(...obj: T[]);
    First(func?: (obj: T) => boolean): T;
    Last(func: (obj: T) => boolean): T;
    Remove(func: (obj: T) => boolean): T[];
    Where(func: (obj: T) => boolean): T[];    
}
Array.prototype.Add = function (...objectOrObjects:Array<any>) {
    if (!Is.Array(objectOrObjects)) {
        objectOrObjects = [objectOrObjects];
    }
    for (var i = 0; i < objectOrObjects.length; i++) {
        this.push(objectOrObjects[i]);
    }
};
Array.prototype.First = function (func?: (obj) => boolean) {
    var l = this.length;
    if (func) {
        for (var i = 0; i < l; i++) {
            if (func(this[i])) {
                return this[i];
            }
        }
    }
    else if (l > 0) {
        return this[0];
    }
    return null;
};
Array.prototype.Last = function (func?: (obj) => boolean): any {
    var l = this.length;
    if (func) {
        var p = l - 1;
        while (p > 0) {
            if (func(this[p])) {
                return this[p];
            }
            p--;
        }
    }
    if (l > 0) {
        return this[l - 1];
    }
    return null;
};
Array.prototype.Remove = function (func: (obj) => boolean): Array<any> {
    if (func) {
        var p = this.length - 1;
        while (p > 0) {
            var match = func(this[p]);
            if (match) {
                this.splice(p, 1);
            }
            p--;
        }
    }
    return this;
};
Array.prototype.Where = function (func: (obj) => boolean): Array<any> {
    var m = new Array();
    for (var i = 0; i < this.length; i++) {
        var c = this[i];
        if (func(c)) {
            m.push(c);
        }
    }
    return m;
};