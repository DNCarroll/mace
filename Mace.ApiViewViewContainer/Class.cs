using System.Collections.Generic;
using System.Web.Http;

namespace $rootnamespace$
{
 [RoutePrefix("Api/$ApiViewControllerName$")]
public class $ApiViewControllerName$Controller : ApiController {

        [Route]
        public List<$objectType$> Get() => Get(0);

        [Route("{Id:int}")]
        public List<$objectType$> Get(int Id) {
            var list = new List<$objectType$>();

            return list;
        }

        [Route]
        public void Post([FromBody]$objectType$ obj) {

        }

        [Route]
        public void Put([FromBody]$objectType$ obj) {

        }

        [Route]
        public void Delete([FromBody]$objectType$ obj) {

        }
    }
}