abstract class ListBinder extends Binder {

    abstract NewObject(rawObj: any): IObjectState;
    //add row method here
    //it should be mindfull of it is an array not an object
}