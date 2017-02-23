using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace mace.Api {

    [RoutePrefix("Api/GenericSelectData")]
    public class GenericSelectDataController : ApiController {
        [Route]
        public IEnumerable<GenericSelectData> Get() {
            return new List<GenericSelectData> {
                new GenericSelectData { Value = "value1", Display="Value 1" },
                new GenericSelectData { Value = "value2", Display="Value 2" },
                new GenericSelectData { Value = "value3", Display="Value 3" }
            };        
        }
    }

    public class GenericSelectData {
        public string Value { get; set; }
        public string Display { get; set; }
    }

}