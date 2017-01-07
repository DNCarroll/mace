using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace mace.Api {
    [RoutePrefix("Api/ListTestData")]
    public class ListTestController : ApiController {
        [Route]
        public List<BindingTestObject> Get() {
            return new List<BindingTestObject>() {
                new BindingTestObject { ID = 1, Name = "Obj1", Value = "Value1", Checked = true },
                new BindingTestObject { ID = 2, Name = "Obj2", Value = "Value2", Checked = false },
                new BindingTestObject { ID = 3, Name = "Obj3", Value = "Value3", Checked = true }
            };
        }

        [Route]
        public BindingTestObject Post([FromBody]BindingTestObject value) {
            return value;
        }

        [Route]
        public BindingTestObject Put([FromBody]BindingTestObject value) {
            value.Name = "Updated";
            return value;
        }

        [Route]
        public void Delete([FromBody]BindingTestObject obj) {
        }

    }
}
