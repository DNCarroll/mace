HTMLSelectElement.prototype.AddOptions = function (arrayOrObject, valueProperty, displayProperty, selectedValue) {
    var s = this;
    var aoo = arrayOrObject;
    var ao = function (d, v) {
        var o = new Option(d, v);
        s["options"][s.options.length] = o;
        if (selectedValue && v === selectedValue) {
            o.selected = true;
        }
    };
    if (Is.Array(aoo)) {
        var ta = aoo;
        var dp = displayProperty;
        var vp = valueProperty;
        if (dp && vp) {
            ta.forEach(function (t) {
                ao(t[dp], t[vp]);
            });
        }
        else if (ta.length > 1 && typeof ta[0] === 'string') {
            ta.forEach(function (t) {
                ao(t, t);
            });
        }
    }
    else if (aoo) {
        for (var p in aoo) {
            if (!(aoo[p] && {}.toString.call(aoo[p]) === '[object Function]')) {
                ao(aoo[p], aoo[p]);
            }
        }
    }
    return s;
};
//# sourceMappingURL=HTMLSelectElement.js.map