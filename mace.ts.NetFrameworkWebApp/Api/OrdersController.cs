using System.Collections.Generic;
using System.Web.Http;

namespace $safeprojectname$
{

    [RoutePrefix("Api/Orders")]
    public class OrdersController : ApiController {

        [Route]
        public List<Order> Get() => Get(0);

        //this is the more method
        [Route("{Id:int}")]
        public List<Order> Get(int Id) {
            var list = new List<Order>();
            if (Id < 120) {
                Id++;
                var end = Id + 25;
                while (Id < end) {
                    list.Add(new Order { Id = Id, CustomerId = Id + 1, OrderAmount = Id + 2 });
                    if (Id == 120) {
                        break;
                    }
                    Id++;
                }
            }
            return list;
        }

        [Route]
        public void Post([FromBody]Order obj) {

        }

        [Route]
        public void Put([FromBody]Order obj) {

        }

        [Route]
        public void Delete([FromBody]Order obj) {

        }
    }
}

