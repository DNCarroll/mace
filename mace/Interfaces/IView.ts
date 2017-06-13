interface IView extends IEventDispatcher<IView> {
    Url: () => string;
    Show: (route: ViewInstance) => void;
    ContainerID: () => string;
    CacheStrategy: CacheStrategy;
    Cache: (strategy: CacheStrategy) => void;
}
interface IBinder extends IEventDispatcher<IBinder> {
    Execute: (viewInstance: ViewInstance) => void;
    Dispose: () => void;
    Element: HTMLElement;
    DataObjects: Array<IObjectState>;
    Save(obj: IObjectState);
    //indicates that we will have delete and updates
    //SaveChanges();
    //put method doesnt know about deletes or inserts (presume inserts are granular, presume deletes are granular also?)
    //so would have to remove deletes to a cached location
    //then gather those up for the delete too
    //SaveChanges is any insert, updates or deletes
    //deletes are cached, how do you know about inserts, and updates
    //all this is getting complicated and indicates that something
    //might could happen and a user loses their work
    //which wouldnt be cool
    //if something is gone wrong then we shouldnt be attempting to save all changes
    //dont waste users time on bulking up changes when they have an issue saving 
    //just fail on the granular record level
    //what this all points to is doing this bulk savechanges is it something that is just fancy
    //its worth is not that great?
    //alternatively it saves a bunch of talking to server about chnages
    //say you are in a tabular view and are working way through the records
    //we may not want it talking back to server alot
    //alternatively what kinda volume are we talking about
    //but consider that we might be talking about thousands of users
    //do we want all of them doing this granular action all the time?
    SaveChanges();
}