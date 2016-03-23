import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
/**
 * Converts a higher-order Observable into a first-order Observable by only the
 * most recently emitted of those nested Observables.
 *
 * <span class="informal">Flattens an Observable-of-Observables by dropping the
 * previous nested Observable once a new one appears.</span>
 *
 * <img src="./img/switch.png" width="100%">
 *
 * `switch` subscribes to an Observable that emits Observables,
 * also known as a higher-order Observable. Each time it observes one of these
 * emitted nested Observables, the output Observable begins emitting the items
 * emitted by that nested Observable. So far, it behaves like {@link mergeAll}.
 * However, when a new nested Observable is emitted, `switch` stops emitting
 * items from the earlier-emitted nested Observable and begins emitting items
 * from the new one. It continues to behave like this for subsequent nested
 * Observables.
 *
 * @example <caption>Rerun an interval Observable on every click event</caption>
 * var clicks = Rx.Observable.fromEvent(document, 'click');
 * // Each click event is mapped to an Observable that ticks every second
 * var higherOrder = clicks.map((ev) => Rx.Observable.interval(1000));
 * var switched = higherOrder.switch();
 * // The outcome is that `switched` is essentially a timer that restarts
 * // on every click. The interval Observables from older clicks do not merge
 * // with the current interval Observable.
 * switched.subscribe(x => console.log(x));
 *
 * @see {@link combineAll}
 * @see {@link concatAll}
 * @see {@link exhaust}
 * @see {@link mergeAll}
 * @see {@link zipAll}
 *
 * @return {Observable<T>} An Observable that emits the items emitted by the
 * Observable most recently emitted by the source Observable.
 * @method switch
 * @name switch
 * @owner Observable
 */
export function _switch() {
    return this.lift(new SwitchOperator());
}
class SwitchOperator {
    call(subscriber) {
        return new SwitchSubscriber(subscriber);
    }
}
class SwitchSubscriber extends OuterSubscriber {
    constructor(destination) {
        super(destination);
        this.active = 0;
        this.hasCompleted = false;
    }
    _next(value) {
        this.unsubscribeInner();
        this.active++;
        this.add(this.innerSubscription = subscribeToResult(this, value));
    }
    _complete() {
        this.hasCompleted = true;
        if (this.active === 0) {
            this.destination.complete();
        }
    }
    unsubscribeInner() {
        this.active = this.active > 0 ? this.active - 1 : 0;
        const innerSubscription = this.innerSubscription;
        if (innerSubscription) {
            innerSubscription.unsubscribe();
            this.remove(innerSubscription);
        }
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this.destination.next(innerValue);
    }
    notifyError(err) {
        this.destination.error(err);
    }
    notifyComplete() {
        this.unsubscribeInner();
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
    }
}
//# sourceMappingURL=switch.js.map