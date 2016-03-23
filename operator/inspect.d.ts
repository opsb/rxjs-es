import { Observable, SubscribableOrPromise } from '../Observable';
/**
 * @param durationSelector
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method inspect
 * @owner Observable
 */
export declare function inspect<T>(durationSelector: (value: T) => SubscribableOrPromise<any>): Observable<T>;
export interface InspectSignature<T> {
    (durationSelector: (value: T) => SubscribableOrPromise<any>): Observable<T>;
}
