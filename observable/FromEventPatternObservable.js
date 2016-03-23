import { Observable } from '../Observable';
import { Subscription } from '../Subscription';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class FromEventPatternObservable extends Observable {
    constructor(addHandler, removeHandler, selector) {
        super();
        this.addHandler = addHandler;
        this.removeHandler = removeHandler;
        this.selector = selector;
    }
    /**
     * @param addHandler
     * @param removeHandler
     * @param selector
     * @return {FromEventPatternObservable}
     * @static true
     * @name fromEventPattern
     * @owner Observable
     */
    static create(addHandler, removeHandler, selector) {
        return new FromEventPatternObservable(addHandler, removeHandler, selector);
    }
    _subscribe(subscriber) {
        const addHandler = this.addHandler;
        const removeHandler = this.removeHandler;
        const selector = this.selector;
        const handler = selector ? function (e) {
            let result = tryCatch(selector).apply(null, arguments);
            if (result === errorObject) {
                subscriber.error(result.e);
            }
            else {
                subscriber.next(result);
            }
        } : function (e) { subscriber.next(e); };
        let result = tryCatch(addHandler)(handler);
        if (result === errorObject) {
            subscriber.error(result.e);
        }
        subscriber.add(new Subscription(() => {
            //TODO: determine whether or not to forward to error handler
            removeHandler(handler);
        }));
    }
}
//# sourceMappingURL=FromEventPatternObservable.js.map