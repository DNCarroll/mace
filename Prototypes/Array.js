Array.prototype.Add = function (objectOrObjects) {
    if (!Is.Array(objectOrObjects)) {
        objectOrObjects = [objectOrObjects];
    }
    for (var i = 0; i < objectOrObjects.length; i++) {
        this.push(objectOrObjects[i]);
    }
};
Array.prototype.First = function (func) {
    if (func) {
        for (var i = 0; i < this.length; i++) {
            if (func(this[i])) {
                return this[i];
            }
        }
    }
    return this.length > 0 ? this[0] : null;
};
Array.prototype.Last = function (func) {
    if (func) {
        var pos = this.length - 1;
        while (pos > 0) {
            if (func(this[pos])) {
                return this[pos];
            }
            pos--;
        }
    }
    return this.length > 0 ? this[this.length - 1] : null;
};
Array.prototype.Remove = function (func) {
    if (func && this.length > 0) {
        var pos = this.length - 1;
        while (pos > 0) {
            if (func(this[pos])) {
                this.splice(pos, 1);
            }
            pos--;
        }
    }
    return this;
};
Array.prototype.Where = function (func) {
    var matches = new Array();
    for (var i = 0; i < this.length; i++) {
        if (func(this[i])) {
            matches.push(this[i]);
        }
    }
    return matches;
};
//# sourceMappingURL=Array.js.map