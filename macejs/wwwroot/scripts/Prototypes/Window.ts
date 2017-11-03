interface Window {
    Exception(parameters: any);
}
Window.prototype.Exception = function (parameters: any) {
    if (Is.Array(parameters)) {
        var o = {};
        for (var i = 0; i < parameters.length; i++) {
            o["parameter" + i] = parameters[i];
        }
        alert(JSON.stringify(o));
    }
    else if (parameters.length > 1) {
        alert(JSON.stringify(parameters[0]));
    }
    else {
        alert(parameters.toString());
    }
};