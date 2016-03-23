import { Observable } from '../Observable';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class EmptyObservable extends Observable {
    constructor(scheduler) {
        super();
        this.scheduler = scheduler;
    }
    /**
     * @param scheduler
     * @return {Observable<T>}
     * @static true
     * @name empty
     * @owner Observable
     */
    static create(scheduler) {
        return new EmptyObservable(scheduler);
    }
    static dispatch({ subscriber }) {
        subscriber.complete();
    }
    _subscribe(subscriber) {
        const scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(EmptyObservable.dispatch, 0, { subscriber });
        }
        else {
            subscriber.complete();
        }
    }
}
//# sourceMappingURL=EmptyObservable.js.map