var ViewContainers = new Array();
var ViewContainer = (function () {
    function ViewContainer() {
        this.Views = new Array();
        this.IsDefault = false;
        var n = Reflection.GetName(this.constructor);
        this.UrlBase = n.replace("Container", "");
        ViewContainers.push(this);
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
        var rp = route.Parameters;
        if (rp) {
            var p = rp[0] == this.UrlBase ?
                rp.slice(1).join("/") :
                rp.join("/");
            return this.UrlBase + (p.length > 0 ? "/" + p : "");
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