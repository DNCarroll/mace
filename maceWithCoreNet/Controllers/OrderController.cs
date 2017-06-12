using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace maceWithCoreNet.Controllers
{
    [Route("api/[controller]")]
    public class OrderController : Controller {
        [HttpGet("{id}")]
        public IActionResult Get(int Id) {
            return Ok(new Order { Id = Id, CustomerId = Id + 1, OrderAmount = Id + 2 });
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
