import { Subscriber } from '../Subscriber';
/**
 * Maps every value to the same value every time.
 *
 * <img src="./img/mapTo.png" width="100%">
 *
 * @param {any} value the value to map each incoming value to
 * @return {Observable} an observable of the passed value that emits every time the source does
 * @method mapTo
 * @owner Observable
 */
export function mapTo(value) {
    return this.lift(new MapToOperator(value));
}
class MapToOperator {
    constructor(value) {
        this.value = value;
    }
    call(subscriber) {
        return new MapToSubscriber(subscriber, this.value);
    }
}
class MapToSubscriber extends Subscriber {
    constructor(destination, value) {
        super(destination);
        this.value = value;
    }
    _next(x) {
        this.destination.next(this.value);
    }
}
//# sourceMappingURL=mapTo.js.map