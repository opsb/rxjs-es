import { ArrayObservable } from '../../observable/ArrayObservable';
import './of';
declare module '../../Observable' {
    namespace Observable {
        let fromArray: typeof ArrayObservable.create;
    }
}
