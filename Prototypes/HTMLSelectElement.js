HTMLSelectElement.prototype.AddOptions = function (arrayOrObject, valueProperty, displayProperty, selectedValue) {
    var select = this;
    var addOption = function (display, value) {
        var option = new Option(display, value);
        select["options"][select.options.length] = option;
        if (selectedValue && value === selectedValue) {
            option.selected = true;
        }
    };
    if (Is.Array(arrayOrObject)) {
        var tempArray = arrayOrObject;
        if (displayProperty && valueProperty) {
            tempArray.forEach(function (t) {
                addOption(t[displayProperty], t[valueProperty]);
            });
        }
        else if (tempArray.length > 1 && typeof tempArray[0] === 'string') {
            tempArray.forEach(function (t) {
                addOption(t, t);
            });
        }
    }
    else if (arrayOrObject) {
        for (var prop in arrayOrObject) {
            if (!(arrayOrObject[prop] && {}.toString.call(arrayOrObject[prop]) === '[object Function]')) {
                addOption(arrayOrObject[prop], arrayOrObject[prop]);
            }
        }
    }
    return select;
};
//# sourceMappingURL=HTMLSelectElement.js.map