import { Scheduler } from '../Scheduler';
import { Observable } from '../Observable';
/**
 * @param delay
 * @param scheduler
 * @return {Observable<R>|WebSocketSubject<T>|Observable<T>}
 * @method inspectTime
 * @owner Observable
 */
export declare function inspectTime<T>(delay: number, scheduler?: Scheduler): Observable<T>;
export interface InspectTimeSignature<T> {
    (delay: number, scheduler?: Scheduler): Observable<T>;
}
