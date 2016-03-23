import { InspectTimeSignature } from '../../operator/inspectTime';
declare module '../../Observable' {
    interface Observable<T> {
        inspectTime: InspectTimeSignature<T>;
    }
}
