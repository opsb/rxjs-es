import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { OuterSubscriber } from '../OuterSubscriber';
import { subscribeToResult } from '../util/subscribeToResult';
/**
 * Returns an Observable where for each item in the source Observable, the supplied function is applied to each item,
 * resulting in a new value to then be applied again with the function.
 * @param {function} project the function for projecting the next emitted item of the Observable.
 * @param {number} [concurrent] the max number of observables that can be created concurrently. defaults to infinity.
 * @param {Scheduler} [scheduler] The Scheduler to use for managing the expansions.
 * @returns {Observable} an Observable containing the expansions of the source Observable.
 */
export function expand(project, concurrent = Number.POSITIVE_INFINITY, scheduler = undefined) {
    concurrent = (concurrent || 0) < 1 ? Number.POSITIVE_INFINITY : concurrent;
    return this.lift(new ExpandOperator(project, concurrent, scheduler));
}
export class ExpandOperator {
    constructor(project, concurrent, scheduler) {
        this.project = project;
        this.concurrent = concurrent;
        this.scheduler = scheduler;
    }
    call(subscriber) {
        return new ExpandSubscriber(subscriber, this.project, this.concurrent, this.scheduler);
    }
}
export class ExpandSubscriber extends OuterSubscriber {
    constructor(destination, project, concurrent, scheduler) {
        super(destination);
        this.project = project;
        this.concurrent = concurrent;
        this.scheduler = scheduler;
        this.index = 0;
        this.active = 0;
        this.hasCompleted = false;
        if (concurrent < Number.POSITIVE_INFINITY) {
            this.buffer = [];
        }
    }
    static dispatch({ subscriber, result, value, index }) {
        subscriber.subscribeToProjection(result, value, index);
    }
    _next(value) {
        const destination = this.destination;
        if (destination.isUnsubscribed) {
            this._complete();
            return;
        }
        const index = this.index++;
        if (this.active < this.concurrent) {
            destination.next(value);
            let result = tryCatch(this.project)(value, index);
            if (result === errorObject) {
                destination.error(errorObject.e);
            }
            else if (!this.scheduler) {
                this.subscribeToProjection(result, value, index);
            }
            else {
                const state = { subscriber: this, result, value, index };
                this.add(this.scheduler.schedule(ExpandSubscriber.dispatch, 0, state));
            }
        }
        else {
            this.buffer.push(value);
        }
    }
    subscribeToProjection(result, value, index) {
        this.active++;
        this.add(subscribeToResult(this, result, value, index));
    }
    _complete() {
        this.hasCompleted = true;
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
    }
    notifyNext(outerValue, innerValue, outerIndex, innerIndex, innerSub) {
        this._next(innerValue);
    }
    notifyComplete(innerSub) {
        const buffer = this.buffer;
        this.remove(innerSub);
        this.active--;
        if (buffer && buffer.length > 0) {
            this._next(buffer.shift());
        }
        if (this.hasCompleted && this.active === 0) {
            this.destination.complete();
        }
    }
}
//# sourceMappingURL=expand.js.map