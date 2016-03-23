import { InspectSignature } from '../../operator/inspect';
declare module '../../Observable' {
    interface Observable<T> {
        inspect: InspectSignature<T>;
    }
}
