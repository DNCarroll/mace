using System.Web.Routing;
using System.Web.Http;

namespace $safeprojectname$
{
    public static class WebApiConfig {
        public static void Register(HttpConfiguration config) {
            config.MapHttpAttributeRoutes();
            RouteTable.Routes.Add(new Route("", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}/{two}", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}/{two}/{three}", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}/{two}/{three}/{four}", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}/{two}/{three}/{four}/{five}", new RouteHandler()));
        }
    }
}