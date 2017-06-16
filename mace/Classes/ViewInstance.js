var ViewInstance = (function () {
    function ViewInstance(parameters, viewContainer, route) {
        if (route === void 0) { route = null; }
        this.Route = route;
        this.Parameters = parameters;
        this.ViewContainer = viewContainer;
    }
    return ViewInstance;
}());
//# sourceMappingURL=ViewInstance.js.map