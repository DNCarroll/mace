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
var ViewContainers = new Array();
var ViewContainer = (function () {
    function ViewContainer() {
        this.UrlPattern = null;
        this.UrlReplacePattern = null;
        this.ContainerLoaded = null;
        this.Views = new Array();
        this.IsDefault = false;
        var n = Reflection.GetName(this.constructor);
        this.Name = n.replace("ViewContainer", "");
        this.Name = this.Name.replace("Container", "");
        ViewContainers.push(this);
    }
    ViewContainer.prototype.Show = function (route) {
        var rp = route.Parameters, t = this;
        if (rp && rp.length == 1 && t.IsDefault) {
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
            url = url.lastIndexOf("/") == url.length - 1 ? url.substring(0, url.length - 1) : url;
            var p = this.UrlPattern ? this.UrlPattern() : "^" + this.Name;
            if (p) {
                var regex = new RegExp(p, 'i');
                return url.match(regex) ? true : false;
            }
        }
        return false;
    };
    ViewContainer.prototype.ViewLoadCompleted = function (a) {
        var t = this, nvs = t.NumberViewsShown;
        if (a.EventType === EventType.Completed) {
            t.NumberViewsShown = t.NumberViewsShown + 1;
        }
        if (t.NumberViewsShown === t.Views.length) {
            ProgressManager.Hide();
            window.scrollTo(0, 0);
            if (t.ContainerLoaded !== null) {
                t.ContainerLoaded();
            }
            t.Views.forEach(function (v) {
                t.LoadSubViews(v.ContainerID());
            });
        }
    };
    ViewContainer.prototype.LoadSubViews = function (eleId) {
        var subviews = eleId.Element().Get(function (e) { return Is.Alive(e.dataset.subview); });
        subviews.forEach(function (s) {
            var a = new Ajax(false);
            a.AddListener(EventType.Any, function (arg) {
                var r = arg.Sender.ResponseText;
                s.innerHTML = r;
                var ele = s.Get(function (ele) { return !Is.NullOrEmpty(ele.getAttribute("data-binder")); });
                if (ele.length > 0) {
                    ele.forEach(function (e) {
                        try {
                            var a_1 = e.getAttribute("data-binder");
                            if (a_1) {
                                var fun = new Function("return new " + a_1 + (a_1.indexOf("(") > -1 ? "" : "()"));
                                e.Binder = fun();
                                e.Binder.Element = e;
                            }
                        }
                        catch (e) {
                            window.Exception(e);
                        }
                    });
                    ele.forEach(function (e) {
                        if (e.Binder) {
                            try {
                                e.Binder.Refresh();
                            }
                            catch (ex) {
                                window.Exception(ex);
                            }
                        }
                    });
                }
            });
            a.Get(s.dataset.subview);
        });
    };
    ViewContainer.prototype.Url = function (viewInstance) {
        var t = this, vi = viewInstance, rp = viewInstance.Parameters, vp = ViewContainer.VirtualPath;
        var newUrl = "";
        if (vi.Route) {
            newUrl = vi.Route;
        }
        else if (t.UrlReplacePattern !== null) {
            var up = t.UrlReplacePattern().split("/"), pi = 0, nu = new Array();
            for (var i = 0; i < up.length; i++) {
                var p = up[i];
                if (p.indexOf("(?:") == 0) {
                    if (!rp) {
                        break;
                    }
                    if (pi < rp.length) {
                        nu.Add(rp[pi]);
                    }
                    else {
                        break;
                    }
                    pi++;
                }
                else {
                    nu.Add(up[i]);
                }
            }
            for (var i = 0; i < nu.length; i++) {
                nu[i] = encodeURIComponent(nu[i]);
            }
            newUrl = nu.join("/");
        }
        if (Is.NullOrEmpty(newUrl)) {
            var ecrp = new Array();
            if (rp) {
                for (var i = 0; i < rp.length; i++) {
                    ecrp.Add(encodeURIComponent(rp[i]));
                }
            }
            newUrl = t.Name + (ecrp.length > 0 ? "/" + ecrp.join("/") : "");
        }
        return (!Is.NullOrEmpty(vp) && newUrl.indexOf(vp) == -1 ? vp + "/" : "") + newUrl;
    };
    ViewContainer.prototype.UrlTitle = function () {
        return this.Name.replace(/\//g, " ");
    };
    ViewContainer.prototype.DocumentTitle = function (route) {
        return this.UrlTitle();
    };
    ViewContainer.prototype.Parameters = function (url) {
        var u = url;
        u = u ? u.replace(this.Name, '') : u;
        u = u ? u.indexOf('/') === 0 ? u.substring(1) : u : u;
        return u ? u.split('/') : new Array();
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
        t.Views.push(new View(cacheStrategy, containerId, "/Views/" + t.Name + ".html"));
        return _this;
    }
    return SingleViewContainer;
}(ViewContainer));
//# sourceMappingURL=ViewContainer.js.map