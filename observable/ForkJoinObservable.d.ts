import { Observable } from '../Observable';
import { Subscriber } from '../Subscriber';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export declare class ForkJoinObservable<T> extends Observable<T> {
    private sources;
    private resultSelector;
    constructor(sources: Array<Observable<any> | Promise<any>>, resultSelector?: (...values: Array<any>) => T);
    /**
     * @param sources
     * @return {any}
     * @static true
     * @name forkJoin
     * @owner Observable
     */
    static create<T>(...sources: Array<Observable<any> | Promise<any> | Array<Observable<any>> | ((...values: Array<any>) => any)>): Observable<T>;
    protected _subscribe(subscriber: Subscriber<any>): void;
}
