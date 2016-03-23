import { Observable } from '../Observable';
import { noop } from '../util/noop';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class NeverObservable extends Observable {
    constructor() {
        super();
    }
    /**
     * @return {NeverObservable<T>}
     * @static true
     * @name never
     * @owner Observable
     */
    static create() {
        return new NeverObservable();
    }
    _subscribe(subscriber) {
        noop();
    }
}
//# sourceMappingURL=NeverObservable.js.map