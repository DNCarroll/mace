interface Array<T> {
    GroupBy(...groupBy: string[]): any[];
    Insert(obj, position: number);
    Sum(field: string): number;
    Max(field: string): number;
    Min(field: string): number;
    ToArray(property: string): any[];
    Take(count: number): any[];
    Add(obj: any);
    IndexOf(func: (obj: T) => Number): T;
    First(func?: (obj: T) => boolean): T;
    Last(func: (obj: T) => boolean): T;
    Remove(func: (obj: T) => boolean): T[];
    Where(func: (obj: T) => boolean): T[];
    Add(obj: T[]);
    Add(obj: T);
    Select<U>(keySelector: (element: T) => U): Array<U>;
    Ascend(keySelector: (element: T) => any): T[];
    Descend(keySelector: (element: T) => any): T[];
    Return(func: (...objs: any[]) => any): any;
}
Array.prototype.Return = function (func: (...objs: any[]) => any): any {
    switch (this.length) {
        case 0:
            return func();;
        case 1:
            return func(this[0]);
        case 2:
            return func(this[0], this[1]);
        case 3:
            return func(this[0], this[1], this[2]);
        case 4:
            return func(this[0], this[1], this[2], this[3]);
        case 5:
            return func(this[0], this[1], this[2], this[3], this[4]);
        case 6:
            return func(this[0], this[1], this[2], this[3], this[4], this[5]);
        case 7:
            return func(this[0], this[1], this[2], this[3], this[4], this[5], this[6]);
        default:
            return null;
    }
};
Array.prototype.Select = function (keySelector: (element: any) => any): Array<any> {
    var ret = new Array<any>();
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        var newObj = keySelector(obj);
        ret.push(newObj);
    }

    return ret;
};
Array.prototype.Ascend = function (keySelector: (element: any) => any): Array<any> {
    return this.sort((a, b) => {
        return keySelector(a) < keySelector(b) ? -1 :
            keySelector(a) > keySelector(b) ? 1 : 0;
    });
};
Array.prototype.Descend = function (keySelector: (element: any) => any): Array<any> {
    return this.sort((a, b) => {
        return keySelector(a) < keySelector(b) ? 1 :
            keySelector(a) > keySelector(b) ? -1 : 0;
    });
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
    else {
        if (this.length > 0) {
            return this[this.length - 1];
        }
    }
    return null;
};
Array.prototype.Remove = function (func: (obj) => boolean): Array<any> {
    if (func) {
        if (this.length > 0) {
            var pos = this.length - 1;
            while (pos > 0) {
                var match = func(this[pos]);
                if (match) {
                    this.splice(pos, 1);
                }
                pos--;
            }
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
Array.prototype.Min = function (field: string): number {
    var ret = null;
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if (obj[field]) {
            if (ret == null) {
                ret = obj[field]
            }
            else if (ret > obj[field]) {
                ret = obj[field];
            }
        }
    }
    return ret;
};
Array.prototype.Max = function (field: string): number {
    var ret = 0;
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if (obj[field]) {
            if (ret < obj[field]) {
                ret = obj[field];
            }
        }
    }
    return ret;
};
Array.prototype.Take = function (count: number): Array<any> {
    var ret = new Array();
    for (var i = 0; i < count; i++) {
        if (this.length > i) {
            ret.push(this[i]);
        }
        else {
            break;
        }
    }
    return ret;
};
Array.prototype.Add = function (objectOrObjects) {
    if (!Is.Array(objectOrObjects)) {
        objectOrObjects = [objectOrObjects];
    }
    for (var i = 0; i < objectOrObjects.length; i++) {
        this.push(objectOrObjects[i]);
    }
};
Array.prototype.GroupBy = function (...groupBy: string[]) {
    var ret = new Array();
    for (var i = 0; i < this.length; i++) {
        var that = this[i];
        var found = ret.First(function (obj) {
            var f = true;
            for (var i = 0; i < groupBy.length; i++) {
                if (obj[groupBy[i]] != that[groupBy[i]]) {
                    f = false;
                    break;
                }
            }
            return f;
        });
        if (!found) {
            var newObj = {
                Grouping: new Array()
            };
            for (var field in that) {
                newObj[field] = that[field];
            }
            newObj.Grouping.push(that);
            ret.push(newObj);
        }
        else {
            found["Grouping"].push(that);
        }
    }
    return ret;
};
Array.prototype.IndexOf = function (funcOrObj) {
    var i = -1;
    var isFunction = Is.Function(funcOrObj);
    if (isFunction) {
        for (var i = 0; i < this.length; i++) {
            if (funcOrObj(this[i])) {
                return i;
            }
        }
    }
    else {
        for (var i = 0; i < this.length; i++) {
            var match = true;
            for (var prop in funcOrObj) {
                if (funcOrObj[prop] != this[i][prop]) {
                    match = false;
                    break;
                }
            }
            if (match) {
                return i;
            }
        }
    }
    return i;
};
Array.prototype.Insert = function (obj, position: number) {
    if (position == undefined) {
        position = 0;
    }
    if (position > this.length) {
        position = this.length;
    }
    this.splice(position, 0, obj);
};
Array.prototype.Sum = function (field: string): number {
    var ret = 0;
    for (var i = 0; i < this.length; i++) {
        var obj = this[i];
        if (obj[field]) {
            ret += obj[field];
        }
    }
    return ret;
};
Array.prototype.ToArray = function (property: string) {
    var ret = new Array();
    for (var i = 0; i < this.length; i++) {
        var item = this[i];
        if (item[property]) {
            ret.push(item[property]);
        }
    }
    return ret;
};