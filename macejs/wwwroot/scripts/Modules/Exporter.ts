module Exporter {
    export function Execute(sender: HTMLElement, name: string, includeSpans: boolean = true) {
        var t = sender.tagName === "TABLE" ? sender : sender.Ancestor(tag.table),
            h = t.First(tag.thead),
            ths = h.Get(e => e.tagName === "TH"),
            l = h.First(tag.any, e => Is.Alive(e.First(tag.any, e2 => Is.Alive(e2.dataset.exportheader) || e2.tagName === "LABEL"))).Get(e => Is.Alive(e.dataset.exportheader) || e.tagName === "LABEL"),
            r = t.Get(e => e.tagName == "TR" && Is.Alive(e.dataset.template)),
            rows = new Array<string>(),
            rh = "";

        ths.forEach(he => {
            if (he.style.display !== "none") {
                var hv = Exporter.GetHeaderElementInnerHtml(he);
                rh += (Is.NullOrEmpty(rh) ? "" : ",") + "\"" + hv + "\"";
            }
        });
        rows.Add(rh);
        r.forEach(e => {
            var td = e.querySelectorAll("td");
            var rv = "";
            for (var j = 0; j < td.length; j++) {
                if (td[j].style.display !== "none") {
                    var etd = td[j];
                    rv += (Is.NullOrEmpty(rv) ? "" : ",") + GetValue(etd);
                }
            }
            rows.Add(rv);
        })
        let csvContent = "";
        rows.forEach(rv => {
            csvContent += rv + "\r\n";
        });

        OpenCsv(csvContent, name);

    }
    export function GetHeaderElementInnerHtml(ele: HTMLElement) {
        var exportheader = ele.First(tag.any, e => Is.Alive(e.dataset.exportheader));
        exportheader = Is.Alive(exportheader) ? exportheader : ele.First(tag.label);
        return exportheader ? exportheader.innerHTML.trim() : "";
    }

    export function GetValue(td: HTMLTableCellElement, inludeReadOnlys: boolean = true) {
        var eles = td.Get(e => e.tagName === "INPUT" || e.tagName === "SELECT" || e.tagName === "TEXTAREA");
        if (inludeReadOnlys) {
            td.Get(e => Is.Alive(e.dataset.innerhtml)).forEach(e => eles.Add(e));
        }
        if (eles.length === 0) {
            return td.innerHTML;
        }
        var v = "";
        if (eles.length > 0) {
            eles.forEach(e => {
                var tv = Exporter.GetExportValue(e);
                v += (!Is.NullOrEmpty(v) ? "-" : "") + tv
            });

        }
        return "\"" + v + "\"";
    }
    export function GetExportValue(ele: HTMLElement): string {
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
    export function OpenCsv(csvContent: string, name: string) {
        var link = document.createElement("a"),
            us = window.location.href.split("/");

        name = us[us.length - 2].RemoveSpecialCharacters() + "_" + name + ".csv";

        var blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        if (navigator.msSaveBlob) {
            navigator.msSaveBlob(blob, name);
        } else {
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
}