interface Window {
    Exception(parameters: any);
}
Window.prototype.Exception = function (parameters: any) {
    var a = alert, p = parameters;
    if (Is.Array(p)) {
        var o = {};
        for (var i = 0; i < p.length; i++) {
            o["parameter" + i] = p[i];
        }
        a(JSON.stringify(o));
    }
    else if (p.length > 1) {
        a(JSON.stringify(p[0]));
    }
    else {
        a(p.toString());
    }
};