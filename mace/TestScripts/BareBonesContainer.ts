class BareBonesContainer extends ViewContainer {
    private static instance: BareBonesContainer = new BareBonesContainer();
    constructor() {
        if (BareBonesContainer.instance) {
            return BareBonesContainer.instance;
        }
        super();
        this.Views.push(new View(CacheStrategy.View, "content", "/Views/BareBones.html"));        
    }
}