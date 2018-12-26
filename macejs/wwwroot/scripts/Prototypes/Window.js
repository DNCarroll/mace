Window.prototype.Exception = function (parameters) {
    var a = alert, p = parameters;
    a(Is.Array(p) || !Is.String(p) ? JSON.stringify(p) : p.toString());
};
//# sourceMappingURL=Window.js.map