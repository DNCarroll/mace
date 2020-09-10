var Exporter;
(function (Exporter) {
    function Execute(sender, name, includeSpans) {
        if (includeSpans === void 0) { includeSpans = true; }
        var t = sender.tagName === "TABLE" ? sender : sender.Ancestor(tag.table), h = t.First(tag.thead), ths = h.Get(function (e) { return e.tagName === "TH"; }), l = h.First(tag.any, function (e) { return Is.Alive(e.First(tag.any, function (e2) { return Is.Alive(e2.dataset.exportheader) || e2.tagName === "LABEL"; })); }).Get(function (e) { return Is.Alive(e.dataset.exportheader) || e.tagName === "LABEL"; }), r = t.Get(function (e) { return e.tagName == "TR" && Is.Alive(e.dataset.template); }), rows = new Array(), rh = "";
        ths.forEach(function (he) {
            if (he.style.display !== "none") {
                var hv = Exporter.GetHeaderElementInnerHtml(he);
                rh += (Is.NullOrEmpty(rh) ? "" : ",") + "\"" + hv + "\"";
            }
        });
        rows.Add(rh);
        r.forEach(function (e) {
            var td = e.querySelectorAll("td");
            var rv = "";
            for (var j = 0; j < td.length; j++) {
                if (td[j].style.display !== "none") {
                    var etd = td[j];
                    rv += (Is.NullOrEmpty(rv) ? "" : ",") + GetValue(etd);
                }
            }
            rows.Add(rv);
        });
        var csvContent = "";
        rows.forEach(function (rv) {
            csvContent += rv + "\r\n";
        });
        OpenCsv(csvContent, name);
    }
    Exporter.Execute = Execute;
    function GetHeaderElementInnerHtml(ele) {
        var exportheader = ele.First(tag.any, function (e) { return Is.Alive(e.dataset.exportheader); });
        exportheader = Is.Alive(exportheader) ? exportheader : ele.First(tag.label);
        return exportheader ? exportheader.innerHTML.trim() : "";
    }
    Exporter.GetHeaderElementInnerHtml = GetHeaderElementInnerHtml;
    function GetValue(td, inludeReadOnlys) {
        if (inludeReadOnlys === void 0) { inludeReadOnlys = true; }
        var eles = td.Get(function (e) { return e.tagName === "INPUT" || e.tagName === "SELECT" || e.tagName === "TEXTAREA"; });
        if (inludeReadOnlys) {
            td.Get(function (e) { return Is.Alive(e.dataset.innerhtml); }).forEach(function (e) { return eles.Add(e); });
        }
        if (eles.length === 0) {
            return td.innerHTML;
        }
        var v = "";
        if (eles.length > 0) {
            eles.forEach(function (e) {
                var tv = Exporter.GetExportValue(e);
                v += (!Is.NullOrEmpty(v) ? "-" : "") + tv;
            });
        }
        return "\"" + v + "\"";
    }
    Exporter.GetValue = GetValue;
    function GetExportValue(ele) {
        if (ele.tagName === "INPUT" && ele["type"] === "checkbox") {
            return ele["checked"] ? "true" : "false";
        }
        else if (ele.tagName === "INPUT" || ele.tagName === "SELECT" || ele.tagName === "TEXTAREA") {
            return ele["value"];
        }
        else if (ele.tagName === "SPAN" || ele.tagName === "DIV") {
            return ele.innerHTML;
        }
        else if (ele.tagName === "A") {
            if (Is.Alive(ele.dataset.exportvalue) && Is.Alive(ele.DataObject)) {
                return ele.DataObject[ele.dataset.exportvalue];
            }
            else if (ele["href"] === "javascript:") {
                return ele.innerHTML;
            }
            return ele["href"];
        }
    }
    Exporter.GetExportValue = GetExportValue;
    function OpenCsv(csvContent, name) {
        var link = document.createElement("a"), us = window.location.href.split("/");
        name = us[us.length - 2].RemoveSpecialCharacters() + "_" + name + ".csv";
        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, name);
        }
        else {
            var link = document.createElement("a");
            if (link.download !== undefined) {
                var url = URL.createObjectURL(blob);
                link.setAttribute("href", url);
                link.setAttribute("download", name);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        }
    }
    Exporter.OpenCsv = OpenCsv;
})(Exporter || (Exporter = {}));
//# sourceMappingURL=Exporter.js.map