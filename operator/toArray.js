import { Subscriber } from '../Subscriber';
/**
 * @return {Observable<any[]>|WebSocketSubject<T>|Observable<T>}
 * @method toArray
 * @owner Observable
 */
export function toArray() {
    return this.lift(new ToArrayOperator());
}
class ToArrayOperator {
    call(subscriber) {
        return new ToArraySubscriber(subscriber);
    }
}
class ToArraySubscriber extends Subscriber {
    constructor(destination) {
        super(destination);
        this.array = [];
    }
    _next(x) {
        this.array.push(x);
    }
    _complete() {
        this.destination.next(this.array);
        this.destination.complete();
    }
}
//# sourceMappingURL=toArray.js.map