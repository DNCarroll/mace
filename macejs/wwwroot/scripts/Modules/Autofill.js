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
            ele.parentElement.First(function (i) { return Is.Alive(i.dataset[afapi]); });
        var dc = s[eleC], ds = s.dataset, f = ds[afva], lf = LookupFields(s), arr = dc, found = arr.First(function (o) { return o[lf.DM] === s.value; });
        if (Is.Alive(f)) {
            var dob = s.DataObject;
            if (dob) {
                if (s.value.length === 0) {
                    dob[f] = null;
                }
                else if (found) {
                    dob[f] = found[lf.VM];
                    if (s.dataset[afodm]) {
                        dob[s.dataset[afodm]] = found[lf.DM];
                    }
                }
            }
        }
        var m = s.dataset[afc];
        if (m) {
            m = m + "(obj);";
            var fun = new Function("obj", m);
            fun(found);
        }
    }
    Autofill.SetValue = SetValue;
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
            var api = s.dataset[afapi];
            api = api.slice(-1) !== "/" ? api + "/" : api;
            (api + v).Get(function (arg) {
                var ret = arg.Sender.GetRequestData();
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