var Autofill;
(function (Autofill) {
    var afapi = "autofillapi", afva = "value", afvm = "valuemember", afdm = "displaymember", afc = "completed", afl = "length", b = "busy", eleC = "cache", afodm = "objdisplaymember";
    function IsAutoFill(ele, obj) {
        var ret = Is.Alive(ele.dataset[afapi] && (ele.dataset[afvm] || ele.dataset[afdm])) && ele.tagName === "INPUT" && ele["type"] === "text";
        ret ? initialize(ele, obj) : null;
        return ret;
    }
    Autofill.IsAutoFill = IsAutoFill;
    function initialize(ele, obj) {
        var i = ele;
        i.onkeypress = null;
        i.onclick = function () {
            SetCaretPosition(i, 0);
        };
        i.onkeyup = function () {
            var code = (event["keyCode"] ? event["keyCode"] : event["which"]);
            if (i.value.length === 0 && code === 8) {
                SetValue(i);
            }
        };
        i.onkeypress = function () {
            KeyPress(event);
        };
        i.value = i.dataset[afodm] ? obj[i.dataset[afodm]] : "";
    }
    function SetCaretPosition(e, caretPos) {
        if (Is.Alive(e)) {
            if (e.selectionStart) {
                e.focus();
                e.setSelectionRange(caretPos, e.value.length);
            }
            else {
                e.focus();
            }
        }
    }
    function SetValue(ele) {
        var s = ele.tagName === "INPUT" && ele.dataset[afapi] ? ele :
            ele.parentElement.First(function (i) { return Is.Alive(i.dataset[afapi]); }), dc = s[eleC], ds = s.dataset, f = ds[afva], lf = LookupFields(s), arr = dc, dob = s.DataObject;
        var directSet = function () {
            ExecuteApi(s, s.value, function (ret) {
                s[eleC] = ret;
                if (ret && ret.length > 0) {
                    SetObjectValues(s, dob, f, ret[0], lf.VM, lf.DM);
                }
            });
        };
        if (s && Is.Alive(f) && !Is.NullOrEmpty(lf.VM) && dob) {
            if (arr && arr.length > 0) {
                var found = arr.First(function (o) { return o[lf.DM] === s.value; });
                if (Is.Alive(found)) {
                    SetObjectValues(s, dob, f, found, lf.VM, lf.DM);
                }
                else {
                    directSet();
                }
            }
            else if (!Is.NullOrEmpty(s.value)) {
                directSet();
            }
        }
    }
    Autofill.SetValue = SetValue;
    function ExecuteApi(s, v, fun) {
        var api = s.dataset[afapi];
        if (!Is.NullOrEmpty(api)) {
            api = api.slice(-1) !== "/" ? api + "/" : api;
            (api + v).Get(function (arg) {
                fun(arg.Sender.GetRequestData());
            });
        }
    }
    function SetObjectValues(s, dob, f, found, vm, dm) {
        if (s.value.length === 0) {
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
    function RunCompleted(obj, s) {
        var m = s.dataset[afc];
        if (m && obj) {
            m = m + "(obj);";
            var fun = new Function("obj", m);
            fun(obj);
        }
    }
    function LookupFields(s) {
        var r = { VM: "", DM: "" }, ds = s.dataset;
        r.DM = ds[afdm] ? ds[afdm] : ds[afvm];
        r.VM = ds[afvm] ? ds[afvm] : ds[afdm];
        return r;
    }
    function KeyPress(event) {
        var code = (event.keyCode ? event.keyCode : event.which);
        var k = event.char ? event.char : event.key, s = event.target, lf = LookupFields(s);
        if (s[b] === true) {
            return true;
        }
        var l = s.value.length, tl = s.dataset[afl] ? parseInt(s.dataset[afl]) : 3;
        var v;
        if (code === 13) {
            SetValue(s);
        }
        else if (l === tl) {
            s[b] = true;
            v = s.value + k;
            s["pv"] = v;
            ExecuteApi(s, v, function (ret) {
                s[eleC] = ret;
                if (ret && ret.length > 0) {
                    s.value = ret[0][lf.DM];
                }
                SetCaretPosition(s, 4);
                s[b] = false;
            });
        }
        else if (l > (tl + 1)) {
            v = s["pv"] + k;
            l = v.length;
            s["pv"] = v;
            setTimeout(function () {
                var arr = s[eleC];
                if (arr) {
                    var found = arr.First(function (o) { return o[lf.DM].toLowerCase().indexOf(v.toLowerCase()) > -1; });
                    if (found) {
                        s.value = found[lf.DM];
                    }
                    SetCaretPosition(s, l);
                }
            }, 10);
            return true;
        }
    }
})(Autofill || (Autofill = {}));
//# sourceMappingURL=Autofill.js.map