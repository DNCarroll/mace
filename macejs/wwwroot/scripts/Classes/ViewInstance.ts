class ViewInstance {
    Parameters: Array<any>;
    ViewContainer: IViewContainer;    
    Route: string;
    constructor(parameters: Array<any>, viewContainer: IViewContainer, route: string = null) {
        this.Route = route;
        this.Parameters = parameters;
        this.ViewContainer = viewContainer;        
    }
}
