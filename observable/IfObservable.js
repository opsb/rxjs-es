import { Observable } from '../Observable';
/**
 * We need this JSDoc comment for affecting ESDoc.
 * @extends {Ignored}
 * @hide true
 */
export class IfObservable extends Observable {
    constructor(condition, thenSource, elseSource) {
        super();
        this.condition = condition;
        this.thenSource = thenSource;
        this.elseSource = elseSource;
    }
    static create(condition, thenSource, elseSource) {
        return new IfObservable(condition, thenSource, elseSource);
    }
    _subscribe(subscriber) {
        const { condition, thenSource, elseSource } = this;
        let result, error, errorHappened = false;
        try {
            result = condition();
        }
        catch (e) {
            error = e;
            errorHappened = true;
        }
        if (errorHappened) {
            subscriber.error(error);
        }
        else if (result && thenSource) {
            return thenSource.subscribe(subscriber);
        }
        else if (elseSource) {
            return elseSource.subscribe(subscriber);
        }
        else {
            subscriber.complete();
        }
    }
}
//# sourceMappingURL=IfObservable.js.map