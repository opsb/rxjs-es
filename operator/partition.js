import { not } from '../util/not';
import { filter } from './filter';
/**
 * @param predicate
 * @param thisArg
 * @return {Observable<T>[]}
 * @method partition
 * @owner Observable
 */
export function partition(predicate, thisArg) {
    return [
        filter.call(this, predicate),
        filter.call(this, not(predicate, thisArg))
    ];
}
//# sourceMappingURL=partition.js.map