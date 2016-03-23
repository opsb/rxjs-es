import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
import { PromiseObservable } from './PromiseObservable';
import { EmptyObservable } from './EmptyObservable';
import { isPromise } from '../util/isPromise';
import { isArray } from '../util/isArray';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class ForkJoinObservable extends Observable {
    constructor(sources, resultSelector) {
        super();
        this.sources = sources;
        this.resultSelector = resultSelector;
    }
    /**
     * @param sources
     * @return {any}
     * @static true
     * @name forkJoin
     * @owner Observable
     */
    static create(...sources) {
        if (sources === null || arguments.length === 0) {
            return new EmptyObservable();
        }
        let resultSelector = null;
        if (typeof sources[sources.length - 1] === 'function') {
            resultSelector = sources.pop();
        }
        // if the first and only other argument besides the resultSelector is an array
        // assume it's been called with `forkJoin([obs1, obs2, obs3], resultSelector)`
        if (sources.length === 1 && isArray(sources[0])) {
            sources = sources[0];
        }
        if (sources.length === 0) {
            return new EmptyObservable();
        }
        return new ForkJoinObservable(sources, resultSelector);
    }
    _subscribe(subscriber) {
        const sources = this.sources;
        const len = sources.length;
        const context = { completed: 0,
            total: len,
            values: new Array(len),
            haveValues: new Array(len),
            selector: this.resultSelector };
        for (let i = 0; i < len; i++) {
            let source = sources[i];
            if (isPromise(source)) {
                source = new PromiseObservable(source);
            }
            subscriber.add(source
                .subscribe(new AllSubscriber(subscriber, i, context)));
        }
    }
}
class AllSubscriber extends Subscriber {
    constructor(destination, index, context) {
        super(destination);
        this.index = index;
        this.context = context;
    }
    _next(value) {
        const context = this.context;
        const index = this.index;
        context.values[index] = value;
        context.haveValues[index] = true;
    }
    _complete() {
        const destination = this.destination;
        const context = this.context;
        if (!context.haveValues[this.index]) {
            destination.complete();
        }
        context.completed++;
        const values = context.values;
        if (context.completed !== values.length) {
            return;
        }
        if (context.haveValues.every(hasValue)) {
            const value = context.selector ? context.selector.apply(this, values) :
                values;
            destination.next(value);
        }
        destination.complete();
    }
}
function hasValue(x) {
    return x === true;
}
//# sourceMappingURL=ForkJoinObservable.js.map