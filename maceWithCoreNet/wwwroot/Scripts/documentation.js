var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
window["IsDebug"] = true;
var DocumentationContainer = (function (_super) {
    __extends(DocumentationContainer, _super);
    function DocumentationContainer() {
        var _this = this;
        if (DocumentationContainer.instance) {
            return DocumentationContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "../Views/Landing.html"));
        _this.IsDefault = true;
        _this.UrlPattern = function () {
            return "^" + _this.Name + "%";
        };
        return _this;
    }
    return DocumentationContainer;
}(ViewContainer));
DocumentationContainer.instance = new DocumentationContainer();
var BinderContainer = (function (_super) {
    __extends(BinderContainer, _super);
    function BinderContainer() {
        var _this = this;
        if (BinderContainer.instance) {
            return BinderContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/Binder.html"));
        _this.IsDefault = false;
        _this.Name = "Documentation/Binder";
        return _this;
    }
    return BinderContainer;
}(ViewContainer));
BinderContainer.instance = new BinderContainer();
var DataObjectContainer = (function (_super) {
    __extends(DataObjectContainer, _super);
    function DataObjectContainer() {
        var _this = this;
        if (DataObjectContainer.instance) {
            return DataObjectContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/DataObject.html"));
        _this.IsDefault = false;
        _this.Name = "Documentation/DataObject";
        return _this;
    }
    return DataObjectContainer;
}(ViewContainer));
DataObjectContainer.instance = new DataObjectContainer();
var ViewContainerContainer = (function (_super) {
    __extends(ViewContainerContainer, _super);
    function ViewContainerContainer() {
        var _this = this;
        if (ViewContainerContainer.instance) {
            return ViewContainerContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/ViewContainer.html"));
        _this.IsDefault = false;
        _this.Name = "Documentation/ViewContainer";
        return _this;
    }
    return ViewContainerContainer;
}(ViewContainer));
ViewContainerContainer.instance = new ViewContainerContainer();
var ViewDocumentationContainer = (function (_super) {
    __extends(ViewDocumentationContainer, _super);
    function ViewDocumentationContainer() {
        var _this = this;
        if (ViewDocumentationContainer.instance) {
            return ViewDocumentationContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Documentation/View.html"));
        _this.IsDefault = false;
        _this.Name = "Documentation/View";
        return _this;
    }
    return ViewDocumentationContainer;
}(ViewContainer));
ViewDocumentationContainer.instance = new ViewDocumentationContainer();
var Documentation;
(function (Documentation) {
    function Navigate(type) {
        var parameters = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            parameters[_i - 1] = arguments[_i];
        }
        "menu-btn".Element().checked = false;
        window.Show(type, parameters);
    }
    Documentation.Navigate = Navigate;
})(Documentation || (Documentation = {}));
var VcDocumentation;
(function (VcDocumentation) {
    var position = 1;
    function ChangePage(isNext) {
        var lastposition = position, previousElement = ("page" + lastposition).Element();
        position = isNext ? position === 4 ? 1 : position + 1 : position === 1 ? 4 : position - 1;
        var currentElement = ("page" + position).Element();
        previousElement.style.opacity = "0";
        previousElement.style.display = "none";
        currentElement.style.opacity = "1";
        currentElement.style.display = "block";
    }
    VcDocumentation.ChangePage = ChangePage;
})(VcDocumentation || (VcDocumentation = {}));
HistoryManager.AddListener(EventType.Completed, function (e) {
    var n = e.Sender.Name.replace("Documentation/", ""), bc = "breadCrumbWhere".Element();
    "ViewHeader".Element().innerHTML = n;
    bc.style.opacity = n === "Documentation" ? "0" : "1";
    bc.innerHTML = n;
    "DocumentationCrumb".Element().className = n === "Documentation" ? "active" : null;
});
//# sourceMappingURL=documentation.js.map