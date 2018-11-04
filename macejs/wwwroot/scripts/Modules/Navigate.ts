module Navigate {
    export function Spa<T extends IViewContainer>(type: { new(): T; }, parameters: any = null) {
        var p = Is.Array(parameters) ? <Array<any>>parameters : new Array<any>();
        if (Is.Alive(parameters) && !Is.Array(parameters)) {
            p.Add(parameters)
        }
        p = p && p.length == 1 && p[0] === "" ? null : p;
        var vc = Reflection.NewObject(type),
            vi = new ViewInstance(p, vc);
        vc.Show(vi);
        HistoryManager.Add(vi);
    }
    export function Url(url: string) {
        var vp = ViewContainer.VirtualPath, vcs = ViewContainers;
        url = vp && url.length > 0 ? url.replace(vp, '') : url;
        url = url.length > 0 && url.indexOf("/") === 0 ? url.substr(1) : url;
        var vc: IViewContainer = url.length === 0 ? vcs.First(vc => vc.IsDefault) : vcs.Where(vc => !vc.IsDefault).First(d => d.IsUrlPatternMatch(url));
        vc = vc == null ? vcs.First(d => d.IsDefault) : vc;
        if (vc) {
            var p = vc.Parameters(url),
                vi = new ViewInstance(p, vc, url);
            p = vi.Parameters;
            if (p && p.length && !Is.NullOrEmpty(ViewContainer.VirtualPath) && p[0] == ViewContainer.VirtualPath) {
                p.splice(0, 1);
            }
            while (p.length && p.length > 0 && Is.NullOrEmpty(p[0])) {
                p.splice(0, 1);
            }
            vc.Show(vi);
            HistoryManager.Add(vi);
        }
    }
}