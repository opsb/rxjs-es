import { Observable } from '../Observable';
import { tryCatch } from '../util/tryCatch';
import { errorObject } from '../util/errorObject';
import { AsyncSubject } from '../subject/AsyncSubject';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class BoundCallbackObservable extends Observable {
    constructor(callbackFunc, selector, args, scheduler) {
        super();
        this.callbackFunc = callbackFunc;
        this.selector = selector;
        this.args = args;
        this.scheduler = scheduler;
    }
    /* tslint:enable:max-line-length */
    /**
     * Converts a callback function to an observable sequence.
     * @param {function} callbackFunc Function with a callback as the last
     * parameter.
     * @param {function} selector A selector which takes the arguments from the
     * callback to produce a single item to yield on next.
     * @param {Scheduler} [scheduler] The scheduler on which to schedule
     * the callbacks.
     * @return {function(...params: *): Observable<T>} a function which returns the
     * Observable that corresponds to the callback.
     * @static true
     * @name bindCallback
     * @owner Observable
     */
    static create(callbackFunc, selector = undefined, scheduler) {
        return (...args) => {
            return new BoundCallbackObservable(callbackFunc, selector, args, scheduler);
        };
    }
    _subscribe(subscriber) {
        const callbackFunc = this.callbackFunc;
        const args = this.args;
        const scheduler = this.scheduler;
        let subject = this.subject;
        if (!scheduler) {
            if (!subject) {
                subject = this.subject = new AsyncSubject();
                const handler = function handlerFn(...innerArgs) {
                    const source = handlerFn.source;
                    const { selector, subject } = source;
                    if (selector) {
                        const result = tryCatch(selector).apply(this, innerArgs);
                        if (result === errorObject) {
                            subject.error(errorObject.e);
                        }
                        else {
                            subject.next(result);
                            subject.complete();
                        }
                    }
                    else {
                        subject.next(innerArgs.length === 1 ? innerArgs[0] : innerArgs);
                        subject.complete();
                    }
                };
                // use named function instance to avoid closure.
                handler.source = this;
                const result = tryCatch(callbackFunc).apply(this, args.concat(handler));
                if (result === errorObject) {
                    subject.error(errorObject.e);
                }
            }
            return subject.subscribe(subscriber);
        }
        else {
            return scheduler.schedule(dispatch, 0, { source: this, subscriber });
        }
    }
}
function dispatch(state) {
    const self = this;
    const { source, subscriber } = state;
    const { callbackFunc, args, scheduler } = source;
    let subject = source.subject;
    if (!subject) {
        subject = source.subject = new AsyncSubject();
        const handler = function handlerFn(...innerArgs) {
            const source = handlerFn.source;
            const { selector, subject } = source;
            if (selector) {
                const result = tryCatch(selector).apply(this, innerArgs);
                if (result === errorObject) {
                    self.add(scheduler.schedule(dispatchError, 0, { err: errorObject.e, subject }));
                }
                else {
                    self.add(scheduler.schedule(dispatchNext, 0, { value: result, subject }));
                }
            }
            else {
                const value = innerArgs.length === 1 ? innerArgs[0] : innerArgs;
                self.add(scheduler.schedule(dispatchNext, 0, { value, subject }));
            }
        };
        // use named function to pass values in without closure
        handler.source = source;
        const result = tryCatch(callbackFunc).apply(this, args.concat(handler));
        if (result === errorObject) {
            subject.error(errorObject.e);
        }
    }
    self.add(subject.subscribe(subscriber));
}
function dispatchNext({ value, subject }) {
    subject.next(value);
    subject.complete();
}
function dispatchError({ err, subject }) {
    subject.error(err);
}
//# sourceMappingURL=BoundCallbackObservable.js.map