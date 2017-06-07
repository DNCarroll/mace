class NotAllowedContainer extends SingleViewContainer {
    private static instance: NotAllowedContainer = new NotAllowedContainer();
    constructor() {
        if (NotAllowedContainer.instance) {
            return NotAllowedContainer.instance;
        }
        super();
        this.IsDefault = false;
    }
}
