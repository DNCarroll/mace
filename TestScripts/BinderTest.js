var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var BinderTestObject = (function (_super) {
    __extends(BinderTestObject, _super);
    function BinderTestObject() {
        _super.apply(this, arguments);
        this._makeCheckedChange = "no";
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
        _super.call(this);
    }
    BinderTest.prototype.NewObject = function (obj) {
        return new BinderTestObject(obj);
    };
    BinderTest.prototype.Execute = function () {
        var bo = new BinderTestObject();
        bo.Name = "Test the name";
        bo.ID = 1;
        bo.Value = "test the value";
        this.BindToDataObject(bo);
        this.Dispatch(EventType.Completed);
    };
    return BinderTest;
}(Binder));
var BinderTest2 = (function (_super) {
    __extends(BinderTest2, _super);
    function BinderTest2() {
        _super.call(this);
    }
    BinderTest2.prototype.NewObject = function (obj) {
        return new BinderTestObject(obj);
    };
    BinderTest2.prototype.Execute = function () {
        var bo = new BinderTestObject();
        bo.Name = "Test the name";
        bo.ID = 1;
        bo.Value = "test the value";
        this.BindToDataObject(bo);
        this.Dispatch(EventType.Completed);
    };
    return BinderTest2;
}(Binder));
var BinderView = (function (_super) {
    __extends(BinderView, _super);
    function BinderView() {
        _super.call(this);
    }
    BinderView.prototype.ViewUrl = function () { return "/Views/BinderView.html"; };
    ;
    BinderView.prototype.ContainerID = function () {
        return "content";
    };
    return BinderView;
}(View));
var BinderViewContainer = (function (_super) {
    __extends(BinderViewContainer, _super);
    function BinderViewContainer() {
        if (BinderViewContainer.instance) {
            return BinderViewContainer.instance;
        }
        _super.call(this);
        this.Views.push(new BinderView());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());
        this.IsDefault = true;
        BinderViewContainer.instance = this;
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
        _super.call(this);
    }
    MultipleViewBinder.prototype.ViewUrl = function () { return "/Views/MultipleBindings.html"; };
    ;
    MultipleViewBinder.prototype.ContainerID = function () {
        return "content";
    };
    return MultipleViewBinder;
}(View));
var MultipleBindingsContainer = (function (_super) {
    __extends(MultipleBindingsContainer, _super);
    function MultipleBindingsContainer() {
        if (MultipleBindingsContainer.instance) {
            return MultipleBindingsContainer.instance;
        }
        _super.call(this);
        this.Views.push(new MultipleViewBinder());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());
        this.IsDefault = true;
        MultipleBindingsContainer.instance = this;
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
        _super.call(this);
        var ajax = new Ajax();
        this.Preload = new DataLoaders(new DataLoader("/Api/GenericSelectData", this.AjaxLoadCompleted, function () { return !WebApiFormView.GenericSelectData; }));
        this.Cache();
    }
    WebApiFormView.prototype.ViewUrl = function () { return "/Views/WebApiFormView.html"; };
    ;
    WebApiFormView.prototype.ContainerID = function () {
        return "content";
    };
    WebApiFormView.prototype.AjaxLoadCompleted = function (arg) {
        WebApiFormView.GenericSelectData = arg.Sender.GetRequestData();
    };
    return WebApiFormView;
}(View));
var WebApiBindingContainer = (function (_super) {
    __extends(WebApiBindingContainer, _super);
    function WebApiBindingContainer() {
        if (WebApiBindingContainer.instance) {
            return WebApiBindingContainer.instance;
        }
        _super.call(this);
        this.Views.push(new WebApiFormView());
        this.Views.push(new ViewHeader());
        this.Views.push(new ViewFooter());
        this.IsDefault = true;
        WebApiBindingContainer.instance = this;
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
        _super.call(this);
        this.AutomaticallySelectsFromWebApi = true;
        this.AutomaticallyUpdatesToWebApi = true;
        this.WebApi = "/Api/WebApiBinder";
    }
    WebApiBinder.prototype.NewObject = function (obj) {
        return new BinderTestObject(obj);
    };
    return WebApiBinder;
}(Binder));
//# sourceMappingURL=BinderTest.js.map