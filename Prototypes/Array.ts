interface Array<T> {    
    Add(obj: any);
    Add(...obj: T[]);
    First(func?: (obj: T) => boolean): T;
    Last(func: (obj: T) => boolean): T;
    Remove(func: (obj: T) => boolean): T[];
    Where(func: (obj: T) => boolean): T[];    
}
Array.prototype.Add = function (objectOrObjects) {
    if (!Is.Array(objectOrObjects)) {
        objectOrObjects = [objectOrObjects];
    }
    for (var i = 0; i < objectOrObjects.length; i++) {
        this.push(objectOrObjects[i]);
    }
};
Array.prototype.First = function (func?: (obj) => boolean) {
    if (func) {
        for (var i = 0; i < this.length; i++) {
            var currentObject = this[i];
            var match = func(currentObject);
            if (match) {
                return this[i];
            }
        }
    }
    else if (this.length > 0) {
        return this[0];
    }
    return null;
};
Array.prototype.Last = function (func?: (obj) => boolean): any {
    if (func) {
        if (this.length > 0) {
            var pos = this.length - 1;
            while (pos > 0) {
                var currentObject = this[pos];
                var match = func(currentObject);
                if (match) {
                    return this[pos];
                }
                pos--;
            }
        }
    }
    else if (this.length > 0) {
        return this[this.length - 1];
    }
    return null;
};
Array.prototype.Remove = function (func: (obj) => boolean): Array<any> {
    if (func && this.length > 0) {
        var pos = this.length - 1;
        while (pos > 0) {
            var match = func(this[pos]);
            if (match) {
                this.splice(pos, 1);
            }
            pos--;
        }
    }
    return this;
};
Array.prototype.Where = function (func: (obj) => boolean): Array<any> {
    var matches = new Array();
    for (var i = 0; i < this.length; i++) {
        var currentObject = this[i];
        var match = func(currentObject);
        if (match) {
            matches.push(currentObject);
        }
    }
    return matches;
};