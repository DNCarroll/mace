using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using BattleAxe;

namespace mace.Api {
    [RoutePrefix("Api/ListTestData")]
    public class ListTestController : ApiController {
        [Route]
        public List<Dynamic> Get() {
            var lastChecked = false;
            var ret = new List<Dynamic>();
            for (int i = 0; i < 10; i++) {
                var obj = new Dynamic();
                obj["ID"] = i;
                obj["Name"] = $"Obj{i}";
                obj["Value"] = $"Value{i}";
                obj["Checked"] = !lastChecked;
                ret.Add(obj);
                lastChecked = !lastChecked;
            }
            return ret;
        }

        [Route]
        public Dynamic Post([FromBody]Dynamic value) {
            return value;
        }

        [Route]
        public Dynamic Put([FromBody]Dynamic value) {
            dynamic d = value;
            d.Name = "Updated";
            return value;
        }

        [Route]
        public void Delete([FromBody]Dynamic obj) {
        }

    }
}
