interface IView extends IEventDispatcher<IView> {
    Url: () => string;
    Show: (route: ViewInstance) => void;
    ContainerID: () => string;
    CacheStrategy: CacheStrategy;
    Cache: (strategy: CacheStrategy) => void;
}
interface IBinder extends IEventDispatcher<IBinder> {


    Append(obj: any);
    PostAndAppend(obj: any);
    InsertBefore(obj: any, index: number);   
    PostAndInsertBefore(obj: any, childIndex: number);

    Execute: (viewInstance: ViewInstance) => void;
    Refresh: (viewInstance: ViewInstance) => void;
    Dispose: () => void;
    Element: HTMLElement;
    DataObjects: DataObjectCacheArray<IObjectState>;
    Save(obj: IObjectState);
    SaveDirty();
    RunWhenObjectsChange: () => void;
    Delete(sender: HTMLElement, ajaxDeleteFunction: (a: CustomEventArg<Ajax>) => void);
    NewObject(obj: any): IObjectState;     
    
}
