var Is;
(function (Is) {
    function Array(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }
    Is.Array = Array;
    function NullOrEmpty(value) {
        return value == null || (value.length && value.length == 0);
    }
    Is.NullOrEmpty = NullOrEmpty;
    function Property(property, inObject) {
        try {
            return typeof (inObject[property]) !== 'undefined';
        }
        catch (e) {
            window.Exception(e);
        }
        return false;
    }
    Is.Property = Property;
    function Style(value) {
        for (var prop in document.body.style) {
            if (prop.toLowerCase() === value.toLowerCase()) {
                return true;
            }
        }
        return false;
    }
    Is.Style = Style;
})(Is || (Is = {}));
//# sourceMappingURL=Is.js.map