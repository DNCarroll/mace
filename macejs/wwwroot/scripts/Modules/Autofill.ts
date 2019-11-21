module Autofill {

    var afapi = "autofillapi", afva = "value", afvm = "valuemember", afdm = "displaymember",
        afc = "completed", afl = "length", b = "busy", eleC = "cache", afodm = "objdisplaymember", afas = "autoset";

    export function IsAutoFill(ele: HTMLElement, obj: IObjectState): boolean {
        var ret = Is.Alive(ele.dataset[afapi] && (ele.dataset[afvm] || ele.dataset[afdm])) && ((ele.tagName === "INPUT" && ele["type"] === "text") || ele.tagName === "TEXTAREA");
        ret ? initialize(ele, obj) : null;
        return ret;
    }

    function initialize(ele: HTMLElement, obj: IObjectState) {
        let i = ele;
        i.onkeypress = null;
        i.onclick = () => {
            SetCaretPosition(i, 0);
        };
        i.onkeyup = () => {
            var code = (event["keyCode"] ? event["keyCode"] : event["which"]);
            if (i["value"].length === 0 && code === 8) {
                SetValue(i);
            }
        };
        i.onkeypress = () => {
            KeyPress(event);
        };
        i["value"] = i.dataset[afodm] ? obj[i.dataset[afodm]] : "";
    }
    function SetCaretPosition(e: HTMLElement, caretPos) {
        if (Is.Alive(e)) {
            if (e["selectionStart"]) {
                e.focus();
                e["setSelectionRange"](caretPos, e["value"].length);
            }
            else {
                e.focus();
            }
        }
    }
    export function SetValue(ele: HTMLElement) {
        let s = (ele.tagName === "INPUT" || ele.tagName === "TEXTAREA") && ele.dataset[afapi] ? ele :
            ele.parentElement.First(tag.any, i => Is.Alive(i.dataset[afapi])),
            dc = s[eleC], ds = s.dataset, f = ds[afva],
            lf = LookupFields(s), arr = <Array<any>>dc,
            dob = <DataObject>s.DataObject;

        var directSet = () => {
            ExecuteApi(s, s["value"], (ret) => {
                s[eleC] = ret;
                if (ret && ret.length > 0) {
                    SetObjectValues(s, dob, f, ret[0], lf.VM, lf.DM);
                }
            });
        };

        if (s && Is.Alive(f) && !Is.NullOrEmpty(lf.VM) && dob) {
            if (arr && arr.length > 0) {
                var found = arr.First(o => o[lf.DM] === s["value"]);
                if (Is.Alive(found)) {
                    SetObjectValues(s, dob, f, found, lf.VM, lf.DM);
                }
                else {
                    directSet();
                }
            } else if (!Is.NullOrEmpty(s["value"])) {
                directSet();
            }
        }
    }

    function ExecuteApi(s: HTMLElement, v: string, fun: (ret) => void) {
        var api = s.dataset[afapi];
        if (!Is.NullOrEmpty(api)) {
            api = api.slice(-1) !== "/" ? api + "/" : api;
            (api + v).Get((arg) => {
                fun(arg.Sender.GetRequestData());
            });
        }
    }

    function SetObjectValues(s: HTMLElement, dob: any, f: string, found: any, vm: string, dm: string) {
        if (s["value"].length === 0) {
            dob[f] = null;
        }
        else if (found) {
            dob[f] = found[vm];
            if (s.dataset[afodm]) {
                dob[s.dataset[afodm]] = found[dm];
            }
        }
        RunCompleted(found, s);
    }

    function RunCompleted(obj: any, s: HTMLElement) {
        let m = s.dataset[afc];
        if (m && obj) {
            m = m + "(obj);";
            let fun = new Function("obj", m);
            fun(obj);
        }
    }

    function LookupFields(s: HTMLElement): { VM: string, DM: string } {
        var r = { VM: "", DM: "" },
            ds = s.dataset;
        r.DM = ds[afdm] ? ds[afdm] : ds[afvm];
        r.VM = ds[afvm] ? ds[afvm] : ds[afdm];
        return r;
    }
    function KeyPress(event) {

        var code = (event.keyCode ? event.keyCode : event.which);
        let k = event.char ? event.char : event.key,
            s = <HTMLElement>event.target,
            lf = LookupFields(s);

        if (s[b] === true) {
            return true;
        }

        var l = s["value"].length,
            tl = s.dataset[afl] ? parseInt(s.dataset[afl]) : 3;
        let v: string;
        if (code === 13) {
            SetValue(s);
        }
        else if (l === tl) {
            s[b] = true;
            v = s["value"] + k;
            s["pv"] = v;
            ExecuteApi(s, v, (ret) => {
                s[eleC] = ret;
                if (ret && ret.length > 0) {
                    SetDisplayValue(s, ret[0], lf);
                }
                SetCaretPosition(s, 4);
                s[b] = false;
            });
        }
        else if (l > (tl + 1)) {
            v = s["pv"] + k;
            l = v.length;
            s["pv"] = v;
            setTimeout(() => {
                var arr = <Array<any>>s[eleC];
                if (arr) {
                    var found = arr.First(o => o[lf.DM].toLowerCase().indexOf(v.toLowerCase()) > -1);
                    SetDisplayValue(s, found, lf);
                    SetCaretPosition(s, l)
                }
            }, 10);
            return true;
        }
    }
    function SetDisplayValue(s: HTMLElement, o: any, lf: { VM: string, DM: string }) {
        if (o) {
            s["value"] = o[lf.DM];
            var sas = s.dataset[afas];
            if (sas === "true") {
                s.DataObject[s.dataset[afva]] = o[lf.VM];
                s.DataObject[s.dataset[afodm]] = o[lf.DM];
            }
        }
    }
}