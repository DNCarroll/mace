interface HTMLSelectElement {
    AddOptions(arrayOrObject, valueProperty?: string, displayProperty?: string, selectedValue?): HTMLSelectElement;    
}
HTMLSelectElement.prototype.AddOptions= function(arrayOrObject, valueProperty ? : string, displayProperty?: string, selectedValue?): HTMLSelectElement {
    var select = <HTMLSelectElement>this;
    var addOption = (display, value) => {
        var option = new Option(display, value);
        select["options"][select.options.length] = option;
        if (selectedValue && value === selectedValue) {
            option.selected = true;
        }
    };
    if (Is.Array(arrayOrObject)) {
        var temp = <Array<any>>arrayOrObject;
        if (displayProperty && valueProperty) {
            temp.forEach(t => {  
                addOption(t[displayProperty], t[valueProperty]);              
            });                        
        }
        else if (temp.length > 1 && Is.String(temp[0])) {
            temp.forEach(t => {
                addOption(t, t);
            });
        }
    }
    else if (arrayOrObject) {        
        for (var prop in arrayOrObject) {
            if (!(arrayOrObject[prop] && {}.toString.call(arrayOrObject[prop]) === '[object Function]')){
                addOption(arrayOrObject[prop], arrayOrObject[prop]);
            }
        }
    }    
    return select;
};
