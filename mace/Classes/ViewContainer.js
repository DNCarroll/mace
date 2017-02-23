var ViewContainers = new Array();
var ViewContainer = (function () {
    function ViewContainer() {
        this.Views = new Array();
        this.IsDefault = false;
        var n = Reflection.GetName(this.constructor);
        this.UrlBase = n.replace("Container", "");
    }
    ViewContainer.prototype.Show = function (route) {
        var _this = this;
        this.NumberViewsShown = 0;
        ProgressManager.Show();
        this.Views.forEach(function (s) {
            s.AddListener(EventType.Completed, _this.ViewLoadCompleted.bind(_this));
            s.Show(route);
        });
    };
    ViewContainer.prototype.IsUrlPatternMatch = function (url) {
        var pattern = this.UrlPattern();
        if (pattern) {
            var regex = new RegExp(pattern, 'i');
            return url.match(regex) ? true : false;
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
        var rp = route.Parameters;
        if (rp) {
            var part = rp[0] == this.UrlBase ?
                rp.slice(1).join("/") :
                rp.join("/");
            return this.UrlBase + (part.length > 0 ? "/" + part : "");
        }
        return this.UrlBase;
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
//# sourceMappingURL=ViewContainer.js.map