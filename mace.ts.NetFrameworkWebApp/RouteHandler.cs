using System.Web;
using System.Web.Routing;

namespace $safeprojectname$
{
    public class RouteHandler : IRouteHandler {
        public IHttpHandler GetHttpHandler(RequestContext requestContext) {
            return new HttpHandler();
        }
    }

    public class HttpHandler : IHttpHandler {
        public bool IsReusable {
            get {
                return true;
            }
        }

        public void ProcessRequest(HttpContext context) {
            context.Response.ClearContent();
            context.Response.ClearHeaders();
            context.Response.ContentType = "text/html";
            context.Response.WriteFile("~\\default.html");
            context.Response.Flush();
            context.Response.Close();
        }
    }
}
