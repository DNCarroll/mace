interface Window {
    Exception(parameters: any);
}
Window.prototype.Exception = function (parameters: any) {
    var a = alert, p = parameters;
    a(Is.Array(p) || !Is.String(p) ? JSON.stringify(p) : p.toString());
};