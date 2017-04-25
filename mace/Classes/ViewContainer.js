var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var ViewContainers = new Array();
var ViewContainer = (function () {
    function ViewContainer() {
        this.Views = new Array();
        this.IsDefault = false;
        var n = Reflection.GetName(this.constructor);
        this.UrlBase = n.replace("ViewContainer", "");
        this.UrlBase = this.UrlBase.replace("Container", "");
        ViewContainers.push(this);
    }
    ViewContainer.prototype.Show = function (route) {
        var rp = route.Parameters, t = this;
        if (rp.length == 1 && t.IsDefault) {
            route.Parameters = new Array();
        }
        t.NumberViewsShown = 0;
        ProgressManager.Show();
        t.Views.forEach(function (s) {
            s.AddListener(EventType.Completed, t.ViewLoadCompleted.bind(t));
            s.Show(route);
        });
    };
    ViewContainer.prototype.IsUrlPatternMatch = function (url) {
        if (!Is.NullOrEmpty(url)) {
            var p = this.UrlPattern(), up = (url.indexOf("/") == 0 ? url.substr(1) : url).split("/")[0];
            if (p) {
                var regex = new RegExp(p, 'i');
                return up.match(regex) ? true : false;
            }
        }
        return false;
    };
    ViewContainer.prototype.ViewLoadCompleted = function (a) {
        if (a.EventType === EventType.Completed) {
            this.NumberViewsShown = this.NumberViewsShown + 1;
        }
        if (this.NumberViewsShown === this.Views.length) {
            ProgressManager.Hide();
        }
    };
    ViewContainer.prototype.Url = function (route) {
        var rp = route.Parameters, t = this;
        if (rp) {
            if (rp.length == 1 && t.IsDefault) {
                rp = new Array();
            }
            if (rp.length > 0) {
                var p = rp[0] == t.UrlBase ?
                    rp.slice(1).join("/") :
                    rp.join("/");
                return t.UrlBase + (p.length > 0 ? "/" + p : "");
            }
        }
        return t.UrlBase;
    };
    ViewContainer.prototype.DocumentTitle = function (route) {
        return this.UrlBase;
    };
    ViewContainer.prototype.UrlPattern = function () {
        return this.UrlBase;
    };
    ViewContainer.prototype.UrlTitle = function (route) {
        return this.UrlBase;
    };
    return ViewContainer;
}());
var SingleViewContainer = (function (_super) {
    __extends(SingleViewContainer, _super);
    function SingleViewContainer(cacheStrategy, containerId, isDefault) {
        if (cacheStrategy === void 0) { cacheStrategy = CacheStrategy.View; }
        if (containerId === void 0) { containerId = "content"; }
        if (isDefault === void 0) { isDefault = false; }
        var _this = _super.call(this) || this;
        var t = _this;
        t.IsDefault = isDefault;
        t.Views.push(new View(cacheStrategy, containerId, "/Views/" + t.UrlBase + ".html"));
        return _this;
    }
    return SingleViewContainer;
}(ViewContainer));
