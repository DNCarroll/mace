interface HTMLSelectElement {
    AddOptions(arrayOrObject, valueProperty?: string, displayProperty?: string, selectedValue?): HTMLSelectElement;    
}
HTMLSelectElement.prototype.AddOptions= function(arrayOrObject, valueProperty ? : string, displayProperty?: string, selectedValue?): HTMLSelectElement {
    var select = <HTMLSelectElement>this;
    if (Is.Array(arrayOrObject)) {
        var tempArray = <Array<any>>arrayOrObject;
        if (displayProperty && valueProperty) {
            tempArray.forEach(t => {  
                var option = new Option(t[displayProperty], t[valueProperty]);              
                select["options"][select.options.length] = option;
                if (selectedValue &&
                    t[valueProperty] == selectedValue) {
                    option.selected = true;
                }
            });                        
        }
        else if (tempArray.length > 1 && Is.String(tempArray[0])) {
            tempArray.forEach(t => {
                var option = new Option(t, t);
                select["options"][select.options.length] = option;
                if (selectedValue &&
                    t == selectedValue) {
                    option.selected = true;
                }
            });
        }
    }
    else if (arrayOrObject) {        
        for (var prop in arrayOrObject) {
            if (Is.Function(prop)) {
                var option = new Option(prop, prop);
                select["options"][select.options.length] = option;
                if (selectedValue && selectedValue == prop) {
                    option.selected = true;
                }
            }
        }
    }    
    return select;
};
