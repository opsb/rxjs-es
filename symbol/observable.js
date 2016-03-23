import { root } from '../util/root';
const Symbol = root.Symbol;
export let $$observable;
if (typeof Symbol === 'function') {
    if (!Symbol.observable) {
        if (typeof Symbol.for === 'function') {
            $$observable = Symbol.for('observable');
        }
        else {
            $$observable = Symbol('observable');
        }
        Symbol.observable = $$observable;
    }
}
else {
    $$observable = '@@observable';
}
//# sourceMappingURL=observable.js.map