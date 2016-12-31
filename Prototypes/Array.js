Array.prototype.Add = function () {
    var objectOrObjects = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        objectOrObjects[_i - 0] = arguments[_i];
    }
    if (!Is.Array(objectOrObjects)) {
        objectOrObjects = [objectOrObjects];
    }
    for (var i = 0; i < objectOrObjects.length; i++) {
        this.push(objectOrObjects[i]);
    }
};
Array.prototype.First = function (func) {
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
Array.prototype.Last = function (func) {
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
Array.prototype.Remove = function (func) {
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
//# sourceMappingURL=Array.js.map