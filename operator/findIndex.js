import { FindValueOperator } from './find';
/**
 * Returns an Observable that searches for the first item in the source Observable that
 * matches the specified condition, and returns the the index of the item in the source.
 * @param {function} predicate function called with each item to test for condition matching.
 * @return {Observable} an Observable of the index of the first item that matches the condition.
 * @method findIndex
 * @owner Observable
 */
export function findIndex(predicate, thisArg) {
    return this.lift(new FindValueOperator(predicate, this, true, thisArg));
}
//# sourceMappingURL=findIndex.js.map