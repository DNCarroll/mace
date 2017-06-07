using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;
using System.Web.Http;

namespace mace.Api {
    [RoutePrefix("Api/BareBones")]
    public class BareBonesController : ApiController {
        [Route]
        public IHttpActionResult Get() {
            return Get(0);
        }

        
        [Route("{ID:int}")]
        public IHttpActionResult Get(int ID) {
            
            //this works:
            //return new CustomResult(this.Request, HttpStatusCode.Unauthorized, "http://localhost:58000/NotAllowed");            
            var list = new List<MaceTestObject>();
            if (ID < 120) {
                ID++;
                var end = ID + 25;
                while (ID < end) {
                    list.Add(new MaceTestObject { ID = ID, Name = $"Object with ID{ID}", Value = $"WithValue{ID}" });
                    if (ID == 120) {
                        break;
                    }
                    ID++;
                }
                return Ok(list);
            }
            return Ok(list);
        }

        [Route]
        public IHttpActionResult Put([FromBody]MaceTestObject obj) {
            obj.Name = $"dont change my name{obj.ID}";
            obj.Value = $"dont change my value{obj.ID}";
            return Ok(obj);
        }

        //does it send ID or the whole object?
        [Route("{ID:int}")]
        public void Delete(int ID) {
            //no content
        }
    }

    public class CustomResult : IHttpActionResult {
        public string Message { get; private set; }
        public HttpRequestMessage Request { get; private set; }
        public HttpStatusCode Status { get; set; }
        public string UriLocation { get; set; }

        public CustomResult(HttpRequestMessage request, string message, HttpStatusCode status, string uriLocation) {
            this.Request = request;
            this.Message = message;
            this.Status = status;
            this.UriLocation = uriLocation;
        }

        public CustomResult(HttpRequestMessage request, HttpStatusCode status, string uriLocation) {
            this.Request = request;         
            this.Status = status;
            this.UriLocation = uriLocation;
        }

        public Task<HttpResponseMessage> ExecuteAsync(CancellationToken cancellationToken) {
            return Task.FromResult(ExecuteResult());
        }

        public HttpResponseMessage ExecuteResult() {
            HttpResponseMessage response = new HttpResponseMessage(HttpStatusCode.NotFound);
            if (!string.IsNullOrEmpty(Message)) {
                response.Content = new StringContent(Message);
            }
            response.RequestMessage = Request;
            response.StatusCode = Status;
            if (!string.IsNullOrEmpty(this.UriLocation)) {
                response.Headers.Location = new Uri(this.UriLocation);
            }
            return response;
        }
    }
}