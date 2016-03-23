import { Observable } from '../Observable';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class UsingObservable extends Observable {
    constructor(resourceFactory, observableFactory) {
        super();
        this.resourceFactory = resourceFactory;
        this.observableFactory = observableFactory;
    }
    static create(resourceFactory, observableFactory) {
        return new UsingObservable(resourceFactory, observableFactory);
    }
    _subscribe(subscriber) {
        const { resourceFactory, observableFactory } = this;
        let resource, source, error, errorHappened = false;
        try {
            resource = resourceFactory();
        }
        catch (e) {
            error = e;
            errorHappened = true;
        }
        if (errorHappened) {
            subscriber.error(error);
        }
        else {
            subscriber.add(resource);
            try {
                source = observableFactory(resource);
            }
            catch (e) {
                error = e;
                errorHappened = true;
            }
            if (errorHappened) {
                subscriber.error(error);
            }
            else {
                return source.subscribe(subscriber);
            }
        }
    }
}
//# sourceMappingURL=UsingObservable.js.map