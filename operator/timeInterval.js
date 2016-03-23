import { Subscriber } from '../Subscriber';
import { async } from '../scheduler/async';
/**
 * @param scheduler
 * @return {Observable<TimeInterval<any>>|WebSocketSubject<T>|Observable<T>}
 * @method timeInterval
 * @owner Observable
 */
export function timeInterval(scheduler = async) {
    return this.lift(new TimeIntervalOperator(scheduler));
}
export class TimeInterval {
    constructor(value, interval) {
        this.value = value;
        this.interval = interval;
    }
}
;
class TimeIntervalOperator {
    constructor(scheduler) {
        this.scheduler = scheduler;
    }
    call(observer) {
        return new TimeIntervalSubscriber(observer, this.scheduler);
    }
}
class TimeIntervalSubscriber extends Subscriber {
    constructor(destination, scheduler) {
        super(destination);
        this.scheduler = scheduler;
        this.lastTime = 0;
        this.lastTime = scheduler.now();
    }
    _next(value) {
        let now = this.scheduler.now();
        let span = now - this.lastTime;
        this.lastTime = now;
        this.destination.next(new TimeInterval(value, span));
    }
}
//# sourceMappingURL=timeInterval.js.map