//module AsyncAjax {
//    export async function Submit(method: string, url: string, parameter: any = null, asRaw: boolean = null): Promise<ICustomEventArg<Ajax>> {        
//        let r: ICustomEventArg<Ajax>;
//        var callback = (arg: ICustomEventArg<Ajax>): void => {
//            r = arg;
//            results();
//        };
//        var results = (): ICustomEventArg<Ajax> => {
//            return r;
//        }
//        var a = new Ajax(true);
//        a.AddListener(EventType.Any, callback);
//        a.Submit(method, url, parameter, asRaw);
//        return await results();
//    }
//    export async function Get(url: string, parameter: any = null, asRaw: boolean = null): Promise<ICustomEventArg<Ajax>> {
//        return await AsyncAjax.Submit("GET", url, parameter, asRaw);
//    }
//    export async function Post(url: string, parameter: any = null, asRaw: boolean = null): Promise<ICustomEventArg<Ajax>> {
//        return await AsyncAjax.Submit("POST", url, parameter, asRaw);
//    }
//}