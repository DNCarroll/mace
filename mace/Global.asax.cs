using System;
using System.Web.Http;
using System.Web.Routing;

namespace mace {
    public class Global : System.Web.HttpApplication {

        protected void Application_Start(object sender, EventArgs e) {
            GlobalConfiguration.Configure(WebApiConfig.Register);

            RouteTable.Routes.Add(new Route("", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}/{two}", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}/{two}/{three}", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}/{two}/{three}/{four}", new RouteHandler()));
            RouteTable.Routes.Add(new Route("{one}/{two}/{three}/{four}/{five}", new RouteHandler()));
        }

        protected void Session_Start(object sender, EventArgs e) {

        }

        protected void Application_BeginRequest(object sender, EventArgs e) {

        }

        protected void Application_AuthenticateRequest(object sender, EventArgs e) {

        }

        protected void Application_Error(object sender, EventArgs e) {

        }

        protected void Session_End(object sender, EventArgs e) {

        }

        protected void Application_End(object sender, EventArgs e) {

        }
    }
}