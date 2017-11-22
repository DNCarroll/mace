interface IView extends IEventDispatcher<IView> {
    Url: () => string;
    Show: (route: ViewInstance) => void;
    ContainerID: () => string;
    CacheStrategy: CacheStrategy;
    Cache: (strategy: CacheStrategy) => void;
}
interface IBinder extends IEventDispatcher<IBinder> {
    Add(obj: IObjectState);
    Insert(obj);
    Execute: (viewInstance: ViewInstance) => void;
    Dispose: () => void;
    Element: HTMLElement;
    DataObjects: DataObjectCacheArray<IObjectState>;
    Save(obj: IObjectState);
    SaveDirty();
    RunWhenObjectsChange: () => void;
    Delete(sender: HTMLElement, ajaxDeleteFunction: (a: CustomEventArg<Ajax>) => void);
}
