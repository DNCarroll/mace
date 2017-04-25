Array.prototype.Add = function () {
    var objectOrObjects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objectOrObjects[_i] = arguments[_i];
    }
    var o = objectOrObjects;
    if (!Is.Array(o)) {
        o = [o];
    }
    for (var i = 0; i < o.length; i++) {
        this.push(o[i]);
    }
};
Array.prototype.First = function (func) {
    var t = this, l = t.length;
    if (func) {
        for (var i = 0; i < l; i++) {
            if (func(t[i])) {
                return t[i];
            }
        }
    }
    else if (l > 0) {
        return t[0];
    }
    return null;
};
Array.prototype.Last = function (func) {
    var t = this, l = t.length;
    if (func) {
        var p = l - 1;
        while (p > 0) {
            if (func(t[p])) {
                return t[p];
            }
            p--;
        }
    }
    if (l > 0) {
        return t[l - 1];
    }
    return null;
};
Array.prototype.Remove = function (func) {
    var t = this;
    if (func) {
        var p = t.length - 1;
        while (p > 0) {
            if (func(t[p])) {
                t.splice(p, 1);
            }
            p--;
        }
    }
    return t;
};
Array.prototype.Where = function (func) {
    var m = new Array();
    for (var i = 0; i < this.length; i++) {
        var c = this[i];
        if (func(c)) {
            m.push(c);
        }
    }
    return m;
};
