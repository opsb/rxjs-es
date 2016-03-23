import { Observable } from '../Observable';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ErrorObservable extends Observable {
    constructor(error, scheduler) {
        super();
        this.error = error;
        this.scheduler = scheduler;
    }
    /**
     * @param error
     * @param scheduler
     * @return {ErrorObservable}
     * @static true
     * @name throw
     * @owner Observable
     */
    static create(error, scheduler) {
        return new ErrorObservable(error, scheduler);
    }
    static dispatch({ error, subscriber }) {
        subscriber.error(error);
    }
    _subscribe(subscriber) {
        const error = this.error;
        const scheduler = this.scheduler;
        if (scheduler) {
            return scheduler.schedule(ErrorObservable.dispatch, 0, {
                error, subscriber
            });
        }
        else {
            subscriber.error(error);
        }
    }
}
//# sourceMappingURL=ErrorObservable.js.map