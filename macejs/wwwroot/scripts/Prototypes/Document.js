Document.prototype.NewE = function (tagName, objectProperties) {
    var ele = document.createElement(tagName.toUpperCase()), op = objectProperties;
    if (op) {
        ele.Set(op);
    }
    return ele;
};
//# sourceMappingURL=Document.js.map