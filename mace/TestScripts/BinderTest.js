var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BinderTestObject = (function (_super) {
    __extends(BinderTestObject, _super);
    function BinderTestObject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._makeCheckedChange = "no";
        return _this;
    }
    Object.defineProperty(BinderTestObject.prototype, "ID", {
        get: function () {
            return this.ServerObject["ID"];
        },
        set: function (value) {
            this.SetServerProperty("ID", value);
            if (this.ID > 19) {
                this.ContainerBackground = "#FE2E2E";
            }
            else if (this.ID > 9) {
                this.ContainerBackground = "#DBA901";
            }
            else {
                this.ContainerBackground = "#FFFFFF";
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinderTestObject.prototype, "Name", {
        get: function () {
            return this.ServerObject["Name"];
        },
        set: function (value) {
            this.SetServerProperty("Name", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinderTestObject.prototype, "Value", {
        get: function () {
            return this.ServerObject["Value"];
        },
        set: function (value) {
            this.SetServerProperty("Value", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinderTestObject.prototype, "Checked", {
        get: function () {
            return this.ServerObject["Checked"];
        },
        set: function (value) {
            this.SetServerProperty("Checked", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinderTestObject.prototype, "RadioChecked", {
        get: function () {
            return this.ServerObject["RadioChecked"];
        },
        set: function (value) {
            this.SetServerProperty("RadioChecked", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinderTestObject.prototype, "SelectValue", {
        get: function () {
            return this.ServerObject["SelectValue"];
        },
        set: function (value) {
            this.SetServerProperty("SelectValue", value);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinderTestObject.prototype, "MakeCheckedChange", {
        get: function () {
            return this._makeCheckedChange;
        },
        set: function (value) {
            var change = value != this._makeCheckedChange;
            this._makeCheckedChange = value;
            if (change) {
                this.InstigatePropertyChangedListeners("MakeCheckedChange", false);
            }
            if (this._makeCheckedChange === "yes") {
                this.Checked = !this.Checked;
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(BinderTestObject.prototype, "ContainerBackground", {
        get: function () {
            if (!this._containerBackground) {
                if (this.ID > 19) {
                    this._containerBackground = "#FE2E2E";
                }
                else if (this.ID > 9) {
                    this._containerBackground = "#DBA901";
                }
                else {
                    this._containerBackground = "#FFFFFF";
                }
            }
            return this._containerBackground;
        },
        set: function (value) {
            var change = value != this._containerBackground;
            this._containerBackground = value;
            if (change) {
                this.InstigatePropertyChangedListeners("ContainerBackground", false);
            }
        },
        enumerable: true,
        configurable: true
    });
    return BinderTestObject;
}(DataObject));
var BinderTest = (function (_super) {
    __extends(BinderTest, _super);
    function BinderTest() {
        return _super.call(this) || this;
    }
    BinderTest.prototype.NewObject = function (obj) {
        return new BinderTestObject(obj);
    };
    BinderTest.prototype.Execute = function (viewInstance) {
        if (viewInstance === void 0) { viewInstance = null; }
        var bo = new BinderTestObject(null);
        bo.Name = "Test the name";
        bo.ID = 1;
        bo.Value = "test the value";
        this.Bind(bo);
        this.Dispatch(EventType.Completed);
    };
    return BinderTest;
}(Binder));
var BinderTest2 = (function (_super) {
    __extends(BinderTest2, _super);
    function BinderTest2() {
        return _super.call(this) || this;
    }
    BinderTest2.prototype.NewObject = function (obj) {
        return new BinderTestObject(obj);
    };
    BinderTest2.prototype.Execute = function (viewInstance) {
        if (viewInstance === void 0) { viewInstance = null; }
        var bo = new BinderTestObject(null);
        bo.Name = "Test the name";
        bo.ID = 1;
        bo.Value = "test the value";
        this.Bind(bo);
        this.Dispatch(EventType.Completed);
    };
    return BinderTest2;
}(Binder));
var BinderView = (function (_super) {
    __extends(BinderView, _super);
    function BinderView() {
        return _super.call(this) || this;
    }
    BinderView.prototype.Url = function () { return "/Views/BinderView.html"; };
    ;
    BinderView.prototype.ContainerID = function () {
        return "content";
    };
    return BinderView;
}(View));
var BinderViewContainer = (function (_super) {
    __extends(BinderViewContainer, _super);
    function BinderViewContainer() {
        var _this = this;
        if (BinderViewContainer.instance) {
            return BinderViewContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new BinderView());
        _this.Views.push(new ViewHeader());
        _this.Views.push(new ViewFooter());
        BinderViewContainer.instance = _this;
        return _this;
    }
    BinderViewContainer.prototype.DocumentTitle = function (route) { return "Bound content"; };
    BinderViewContainer.prototype.Url = function (route) { return "Bound"; };
    BinderViewContainer.prototype.UrlPattern = function () { return "Bound"; };
    BinderViewContainer.prototype.UrlTitle = function (route) { return "Bound Page"; };
    return BinderViewContainer;
}(ViewContainer));
var MultipleViewBinder = (function (_super) {
    __extends(MultipleViewBinder, _super);
    function MultipleViewBinder() {
        return _super.call(this) || this;
    }
    MultipleViewBinder.prototype.Url = function () { return "/Views/MultipleBindings.html"; };
    ;
    MultipleViewBinder.prototype.ContainerID = function () {
        return "content";
    };
    return MultipleViewBinder;
}(View));
var MultipleBindingsContainer = (function (_super) {
    __extends(MultipleBindingsContainer, _super);
    function MultipleBindingsContainer() {
        var _this = this;
        if (MultipleBindingsContainer.instance) {
            return MultipleBindingsContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new MultipleViewBinder());
        _this.Views.push(new ViewHeader());
        _this.Views.push(new ViewFooter());
        MultipleBindingsContainer.instance = _this;
        return _this;
    }
    MultipleBindingsContainer.prototype.DocumentTitle = function (route) { return "Multiple bindings"; };
    MultipleBindingsContainer.prototype.Url = function (route) { return "multiplebindings"; };
    MultipleBindingsContainer.prototype.UrlPattern = function () { return "multiplebindings"; };
    MultipleBindingsContainer.prototype.UrlTitle = function (route) { return "multiplebindings view"; };
    return MultipleBindingsContainer;
}(ViewContainer));
var WebApiFormView = (function (_super) {
    __extends(WebApiFormView, _super);
    function WebApiFormView() {
        var _this = _super.call(this, CacheStrategy.ViewAndPreload, "content") || this;
        _this.Preload = new DataLoaders(new DataLoader("/Api/GenericSelectData", _this.AjaxLoadCompleted, function () { return !WebApiFormView.GenericSelectData; }));
        return _this;
    }
    WebApiFormView.prototype.AjaxLoadCompleted = function (arg) {
        WebApiFormView.GenericSelectData = arg.Sender.GetRequestData();
    };
    return WebApiFormView;
}(View));
var WebApiBindingContainer = (function (_super) {
    __extends(WebApiBindingContainer, _super);
    function WebApiBindingContainer() {
        var _this = this;
        if (WebApiBindingContainer.instance) {
            return WebApiBindingContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new WebApiFormView());
        _this.Views.push(new ViewHeader());
        _this.Views.push(new ViewFooter());
        WebApiBindingContainer.instance = _this;
        return _this;
    }
    WebApiBindingContainer.prototype.DocumentTitle = function (route) { return "WebApi Data"; };
    WebApiBindingContainer.prototype.Url = function (route) {
        var routeVariable = "/";
        if (route.Parameters) {
            if (Is.Array(route.Parameters)) {
                routeVariable += route.Parameters.join("/");
            }
            else {
                routeVariable += route.Parameters.toString();
            }
        }
        return "WebApiData" + (routeVariable.length > 1 ? routeVariable : "");
    };
    WebApiBindingContainer.prototype.UrlPattern = function () { return "WebApiData"; };
    WebApiBindingContainer.prototype.UrlTitle = function (route) { return "webapi view"; };
    return WebApiBindingContainer;
}(ViewContainer));
var WebApiBinder = (function (_super) {
    __extends(WebApiBinder, _super);
    function WebApiBinder() {
        return _super.call(this, ["ID"], null, BinderTestObject) || this;
    }
    return WebApiBinder;
}(Binder));
var ListTestData = (function (_super) {
    __extends(ListTestData, _super);
    function ListTestData() {
        return _super.call(this, ["ID"]) || this;
    }
    return ListTestData;
}(Binder));
var ListTest = (function (_super) {
    __extends(ListTest, _super);
    function ListTest() {
        return _super.call(this, CacheStrategy.View, "content") || this;
    }
    return ListTest;
}(View));
var ListBinderContainer = (function (_super) {
    __extends(ListBinderContainer, _super);
    function ListBinderContainer() {
        var _this = this;
        if (ListBinderContainer.instance) {
            return ListBinderContainer.instance;
        }
        _this = _super.call(this) || this;
        _this.Views.push(new View(CacheStrategy.View, "content", "/Views/ListTest.html"));
        _this.Views.push(new View(CacheStrategy.View, "header", "/Views/header.html"));
        _this.Views.push(new View(CacheStrategy.View, "footer", "/Views/footer.html"));
        ListBinderContainer.instance = _this;
        return _this;
    }
    ListBinderContainer.prototype.DocumentTitle = function (route) { return "Listbinder Data"; };
    ListBinderContainer.prototype.Url = function (route) {
        var routeVariable = "/";
        if (route.Parameters) {
            if (Is.Array(route.Parameters)) {
                routeVariable += route.Parameters.join("/");
            }
            else {
                routeVariable += route.Parameters.toString();
            }
        }
        return "ListBinder" + (routeVariable.length > 1 ? routeVariable : "");
    };
    ListBinderContainer.prototype.UrlPattern = function () { return "ListBinder"; };
    ListBinderContainer.prototype.UrlTitle = function (route) { return "ListBinder view"; };
    return ListBinderContainer;
}(ViewContainer));
