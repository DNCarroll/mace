using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace mace.Api {

    [RoutePrefix("Api/UseOfAllTypeScriptObjects")]
    public class UseOfAllTypeScriptObjectsController : ApiController {

        [Route]
        public List<MaceTestObject> Get() {
            return Get(0);
        }

        [Route("{ID:int}")]
        public List<MaceTestObject> Get(int ID) {
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
                return list;
            }
            return list;
        }
        
        [Route]
        public MaceTestObject Put([FromBody]MaceTestObject obj) {
            obj.Name = $"dont change my name{obj.ID}";
            obj.Value = $"dont change my value{obj.ID}";
            return obj;
        }

        //does it send ID or the whole object?
        [Route("{ID:int}")]
        public void Delete(int ID) {
        }
    }
}