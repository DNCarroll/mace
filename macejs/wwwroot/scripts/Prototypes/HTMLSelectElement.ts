interface HTMLSelectElement {
    AddOptions(arrayOrObject, valueProperty?: string, displayProperty?: string, selectedValue?): HTMLSelectElement;
}
HTMLSelectElement.prototype.AddOptions = function (arrayOrObject, valueProperty?: string, displayProperty?: string, selectedValue?): HTMLSelectElement {
    var s = <HTMLSelectElement>this,
        sv = selectedValue,
        aoo = arrayOrObject,
        ao = (d, v) => {
            var o = new Option(d, v);
            s["options"][s.options.length] = o;
            if (sv && v === sv) {
                o.selected = true;
            }
        };
    if (Is.Array(aoo)) {
        var ta = <Array<any>>aoo,
            dp = displayProperty,
            vp = valueProperty;
        if (dp && vp) {
            ta.forEach(t => {
                ao(t[dp], t[vp]);
            });
        }
        else if (ta.length > 1 && typeof ta[0] === 'string') {
            ta.forEach(t => {
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