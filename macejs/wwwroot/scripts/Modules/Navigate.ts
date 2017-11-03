﻿module Navigate {
    export function Spa<T extends IViewContainer>(type: { new(): T; }, parameters: any = null) {
        var p: Array<any>;
        if (!Is.Array(parameters)) {
            p = new Array<any>();
            p.Add(parameters)
        }
        else {
            p = <Array<any>>parameters;
        }
        p = p && p.length == 1 && p[0] === "" ? null : p;
        var vc = Reflection.NewObject(type),
            vi = new ViewInstance(p, vc);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
    export function Url(url: string) {
        var vc: IViewContainer = url.length === 0 ? ViewContainers.First(vc => vc.IsDefault) : ViewContainers.Where(vc => !vc.IsDefault).First(d => d.IsUrlPatternMatch(url));
        vc = vc == null ? ViewContainers.First(d => d.IsDefault) : vc;
        if (vc) {
            var p = vc.Parameters(url),
                vi = new ViewInstance(p, vc, url);
            vc.Show(vi);
            HistoryManager.Add(vi);
        }
    }
}