import { isNumeric } from '../util/isNumeric';
import { Observable } from '../Observable';
import { async } from '../scheduler/async';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class IntervalObservable extends Observable {
    constructor(period = 0, scheduler = async) {
        super();
        this.period = period;
        this.scheduler = scheduler;
        if (!isNumeric(period) || period < 0) {
            this.period = 0;
        }
        if (!scheduler || typeof scheduler.schedule !== 'function') {
            this.scheduler = async;
        }
    }
    /**
     * @param period
     * @param scheduler
     * @return {IntervalObservable}
     * @static true
     * @name interval
     * @owner Observable
     */
    static create(period = 0, scheduler = async) {
        return new IntervalObservable(period, scheduler);
    }
    static dispatch(state) {
        const { index, subscriber, period } = state;
        subscriber.next(index);
        if (subscriber.isUnsubscribed) {
            return;
        }
        state.index += 1;
        this.schedule(state, period);
    }
    _subscribe(subscriber) {
        const index = 0;
        const period = this.period;
        const scheduler = this.scheduler;
        subscriber.add(scheduler.schedule(IntervalObservable.dispatch, period, {
            index, subscriber, period
        }));
    }
}
//# sourceMappingURL=IntervalObservable.js.map