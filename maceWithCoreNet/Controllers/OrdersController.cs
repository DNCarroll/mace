using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;

namespace maceWithCoreNet.Controllers {

    [Route("api/[controller]")]
    public class OrdersController : Controller {

        [HttpGet]
        public IActionResult Get() => Get(0);

        //this is the more method
        [HttpGet("{id}")]
        public IActionResult Get(int Id) {
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
            return Ok(list);
        }

        [HttpPost]
        public IActionResult Post([FromBody]Order obj) {
            return Ok(obj);
        }

        [HttpPut]
        public IActionResult Put([FromBody]Order obj) {
            return Ok(obj);
        }

        [HttpDelete]
        public IActionResult Delete([FromBody]Order obj) {
            return NoContent();
        }
    }
}
