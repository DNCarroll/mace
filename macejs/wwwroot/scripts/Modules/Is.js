var Is;
(function (Is) {
    function Func(obj) {
        return obj instanceof Function;
    }
    Is.Func = Func;
    function Array(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    Is.Array = Array;
    function NullOrEmpty(value) {
        return value === undefined ||
            value === null ||
            (typeof value === "string" && value.length === 0);
    }
    Is.NullOrEmpty = NullOrEmpty;
    function Number(value) {
        return !isNaN(parseFloat(value)) && isFinite(value);
    }
    Is.Number = Number;
    function String(value) {
        return typeof value === "string";
    }
    Is.String = String;
    function Alive(value) {
        return value === undefined || value === null ? false : true;
    }
    Is.Alive = Alive;
    function HTMLElement(o) {
        return Is.Alive(o["tagName"]);
    }
    Is.HTMLElement = HTMLElement;
    function Boolean(o) {
        return typeof o === "boolean";
    }
    Is.Boolean = Boolean;
    function ValueType(o) {
        return typeof o !== "object" && !Is.Array(o);
    }
    Is.ValueType = ValueType;
})(Is || (Is = {}));
var Has;
(function (Has) {
    function Properties(inObject) {
        var properties = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            properties[_i - 1] = arguments[_i];
        }
        var p = properties;
        for (var i = 0; i < p.length; i++) {
            if (inObject[p[i]] === undefined) {
                return false;
            }
        }
        return true;
    }
    Has.Properties = Properties;
})(Has || (Has = {}));
//# sourceMappingURL=Is.js.map