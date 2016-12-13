using System.Web.Http;

namespace mace.Api {
    [RoutePrefix("Api/WebApiBinder")]
    public class WebApiBinderController : ApiController {
        // GET api/<controller>
        [Route]        
        public BindingTestObject Get() {
            return new BindingTestObject { ID = 100, Name = "bound object", Value = "bound value", Checked = true };
        }

        [Route("{id:int}")]
        public BindingTestObject Get(int id) {
            return new BindingTestObject { ID = id, Name = "bound object", Value = "bound value", Checked = true, SelectValue = "value2" };
        }

        [Route]
        public BindingTestObject Post([FromBody]BindingTestObject value) {
            return value;
        }

        [Route]
        public BindingTestObject Put([FromBody]BindingTestObject value) {
            return value;
        }

        [Route]
        public void Delete(int id) {
        }
    }
}

public class BindingTestObject {
    //private id: number;
    //private name: string;
    //private value: string;
    //private checkedValue: boolean = true;;
    //private makeCheckedChange: string = "no";
    //private containerBackground: string = "#FFFFFF";
    public int ID { get; set; }
    public string Name { get; set; }
    public string Value { get; set; }
    public bool Checked { get; set; }
    public int RadioChecked { get; set; } = 1;
    public string SelectValue { get; set; }

}