var Is;
(function (Is) {
    function Array(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    Is.Array = Array;
    function NullOrEmpty(value) {
        return value == null || (value.length && value.length === 0);
    }
    Is.NullOrEmpty = NullOrEmpty;
    function String(value) {
        return typeof value === 'string';
    }
    Is.String = String;
})(Is || (Is = {}));
var Has;
(function (Has) {
    function Properties(inObject) {
        var properties = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            properties[_i - 1] = arguments[_i];
        }
        var ret = true;
        try {
            for (var i = 0; i < properties.length; i++) {
                var value = inObject[properties[i]];
                if (inObject[properties[i]] === undefined) {
                    ret = false;
                    break;
                }
            }
        }
        catch (e) {
            if (window.Exception) {
                window.Exception(e);
            }
        }
        return ret;
    }
    Has.Properties = Properties;
})(Has || (Has = {}));
//# sourceMappingURL=Is.js.map