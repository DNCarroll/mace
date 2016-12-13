var Is;
(function (Is) {
    function Array(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    Is.Array = Array;
    function Chrome() {
        var w = window;
        return w.chrome;
    }
    Is.Chrome = Chrome;
    function EmptyObject(obj) {
        for (var prop in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, prop)) {
                return false;
            }
        }
        return true;
    }
    Is.EmptyObject = EmptyObject;
    function FireFox() {
        if (navigator) {
            return /Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent);
        }
        return false;
    }
    Is.FireFox = FireFox;
    function Function(obj) {
        var getType = {};
        return obj && getType.toString.call(obj) === '[object Function]';
    }
    Is.Function = Function;
    function NullOrEmpty(value) {
        if (value == null) {
            return true;
        }
        else if (value.length == 0) {
            return true;
        }
    }
    Is.NullOrEmpty = NullOrEmpty;
    function Numeric(input) {
        var RE = /^-{0,1}\d*\.{0,1}\d+$/;
        return (RE.test(input));
    }
    Is.Numeric = Numeric;
    function Object(value) {
        return value && typeof value === 'object';
    }
    Is.Object = Object;
    function Property(property, inObject) {
        try {
            return typeof (inObject[property]) !== 'undefined';
        }
        catch (e) {
            if (window.Exception) {
                window.Exception(e);
            }
        }
        return false;
    }
    Is.Property = Property;
    function String(value) {
        return typeof value === 'string';
    }
    Is.String = String;
    function Style(value) {
        for (var prop in document.body.style) {
            if (prop.toLowerCase() === value.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
    Is.Style = Style;
    function ValidDate(value) {
        try {
            if (Object.prototype.toString.call(value) === "[object Date]") {
                if (isNaN(value.getTime())) {
                    return false;
                }
                else {
                    return true;
                }
            }
            else if (String(value)) {
                var objDate = new Date(value);
                //what was doing
                //var objDate = new Date(Date.parse(value));
                var parts = value.split("/");
                var year = parseInt(parts[2]);
                var month = parseInt(parts[0].indexOf("0") == 0 ? parts[0].substring(1) : parts[0]);
                var day = parseInt(parts[1].indexOf("0") == 0 ? parts[1].substring(1) : parts[1]);
                if (objDate.getFullYear() != year)
                    return false;
                if (objDate.getMonth() != month - 1)
                    return false;
                if (objDate.getDate() != day)
                    return false;
                return true;
            }
        }
        catch (e) {
            if (window.Exception) {
                window.Exception(e);
            }
        }
        return false;
    }
    Is.ValidDate = ValidDate;
    function ValidEmail(address) {
        var reg = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        if (reg.test(address) == false) {
            return false;
        }
        return true;
    }
    Is.ValidEmail = ValidEmail;
})(Is || (Is = {}));
//# sourceMappingURL=Is.js.map