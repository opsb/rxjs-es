import { Observable } from '../../Observable';
import { ErrorObservable } from '../../observable/ErrorObservable';
Observable.throw = ErrorObservable.create;
//# sourceMappingURL=throw.js.map