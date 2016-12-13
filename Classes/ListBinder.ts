abstract class ListBinder extends Binder {
    DataObjects: Array<IObjectState> = new Array<IObjectState>();
    abstract NewObject(rawObj: any): IObjectState;
    OnAjaxComplete(arg: CustomEventArg<Ajax>) {
        if (arg.EventType === EventType.Completed) {
            //presumably this should be an array
            var data = arg.Sender.GetRequestData();
            if (data) {
                //get the bindings
                //gonna need template and such
            }
        }
    }
}