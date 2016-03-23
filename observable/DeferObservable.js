import { Observable } from '../Observable';
import { subscribeToResult } from '../util/subscribeToResult';
import { OuterSubscriber } from '../OuterSubscriber';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class DeferObservable extends Observable {
    constructor(observableFactory) {
        super();
        this.observableFactory = observableFactory;
    }
    /**
     * @param observableFactory
     * @return {DeferObservable}
     * @static true
     * @name defer
     * @owner Observable
     */
    static create(observableFactory) {
        return new DeferObservable(observableFactory);
    }
    _subscribe(subscriber) {
        return new DeferSubscriber(subscriber, this.observableFactory);
    }
}
class DeferSubscriber extends OuterSubscriber {
    constructor(destination, factory) {
        super(destination);
        this.factory = factory;
        this.tryDefer();
    }
    tryDefer() {
        try {
            const result = this.factory.call(this);
            if (result) {
                this.add(subscribeToResult(this, result));
            }
        }
        catch (err) {
            this._error(err);
        }
    }
}
//# sourceMappingURL=DeferObservable.js.map