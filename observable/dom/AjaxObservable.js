import { root } from '../../util/root';
import { tryCatch } from '../../util/tryCatch';
import { errorObject } from '../../util/errorObject';
import { Observable } from '../../Observable';
import { Subscriber } from '../../Subscriber';
function createXHRDefault() {
    let xhr = new root.XMLHttpRequest();
    if (this.crossDomain) {
        if ('withCredentials' in xhr) {
            xhr.withCredentials = true;
            return xhr;
        }
        else if (!!root.XDomainRequest) {
            return new root.XDomainRequest();
        }
        else {
            throw new Error('CORS is not supported by your browser');
        }
    }
    else {
        return xhr;
    }
};
function defaultGetResultSelector(response) {
    return response.response;
}
export function ajaxGet(url, resultSelector = defaultGetResultSelector, headers = null) {
    return new AjaxObservable({ method: 'GET', url, resultSelector, headers });
}
;
export function ajaxPost(url, body, headers) {
    return new AjaxObservable({ method: 'POST', url, body, headers });
}
;
export function ajaxDelete(url, headers) {
    return new AjaxObservable({ method: 'DELETE', url, headers });
}
;
export function ajaxPut(url, body, headers) {
    return new AjaxObservable({ method: 'PUT', url, body, headers });
}
;
export function ajaxGetJSON(url, resultSelector, headers) {
    const finalResultSelector = resultSelector ? (res) => resultSelector(res.response) : (res) => res.response;
    return new AjaxObservable({ method: 'GET', url, responseType: 'json', resultSelector: finalResultSelector, headers });
}
;
/**
 * Creates an observable for an Ajax request with either a request object with url, headers, etc or a string for a URL.
 *
 * @example
 *   source = Rx.Observable.ajax('/products');
 *   source = Rx.Observable.ajax( url: 'products', method: 'GET' });
 *
 * @param {Object} request Can be one of the following:
 *
 *  A string of the URL to make the Ajax call.
 *  An object with the following properties
 *   - url: URL of the request
 *   - body: The body of the request
 *   - method: Method of the request, such as GET, POST, PUT, PATCH, DELETE
 *   - async: Whether the request is async
 *   - headers: Optional headers
 *   - crossDomain: true if a cross domain request, else false
 *   - createXHR: a function to override if you need to use an alternate XMLHttpRequest implementation.
 *   - resultSelector: a function to use to alter the output value type of the Observable. Gets {AjaxResponse} as an argument
 * @returns {Observable} An observable sequence containing the XMLHttpRequest.
*/
export class AjaxObservable extends Observable {
    constructor(urlOrRequest) {
        super();
        const request = {
            async: true,
            createXHR: createXHRDefault,
            crossDomain: false,
            headers: {},
            method: 'GET',
            responseType: 'json',
            timeout: 0
        };
        if (typeof urlOrRequest === 'string') {
            request.url = urlOrRequest;
        }
        else {
            for (const prop in urlOrRequest) {
                if (urlOrRequest.hasOwnProperty(prop)) {
                    request[prop] = urlOrRequest[prop];
                }
            }
        }
        this.request = request;
    }
    _subscribe(subscriber) {
        return new AjaxSubscriber(subscriber, this.request);
    }
}
AjaxObservable.create = (() => {
    const create = (urlOrRequest) => {
        return new AjaxObservable(urlOrRequest);
    };
    create.get = ajaxGet;
    create.post = ajaxPost;
    create.delete = ajaxDelete;
    create.put = ajaxPut;
    create.getJSON = ajaxGetJSON;
    return create;
})();
export class AjaxSubscriber extends Subscriber {
    constructor(destination, request) {
        super(destination);
        this.request = request;
        this.done = false;
        const headers = request.headers = request.headers || {};
        // force CORS if requested
        if (!request.crossDomain && !headers['X-Requested-With']) {
            headers['X-Requested-With'] = 'XMLHttpRequest';
        }
        // ensure content type is set
        if (!('Content-Type' in headers)) {
            headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8';
        }
        // properly serialize body
        request.body = this.serializeBody(request.body, request.headers['Content-Type']);
        this.resultSelector = request.resultSelector;
        this.send();
    }
    next(e) {
        this.done = true;
        const { resultSelector, xhr, request, destination } = this;
        const response = new AjaxResponse(e, xhr, request);
        if (resultSelector) {
            const result = tryCatch(resultSelector)(response);
            if (result === errorObject) {
                this.error(errorObject.e);
            }
            else {
                destination.next(result);
            }
        }
        else {
            destination.next(response);
        }
    }
    send() {
        const { request, request: { user, method, url, async, password, headers, body } } = this;
        const createXHR = request.createXHR;
        const xhr = tryCatch(createXHR).call(request);
        if (xhr === errorObject) {
            this.error(errorObject.e);
        }
        else {
            this.xhr = xhr;
            // open XHR first
            let result;
            if (user) {
                result = tryCatch(xhr.open).call(xhr, method, url, async, user, password);
            }
            else {
                result = tryCatch(xhr.open).call(xhr, method, url, async);
            }
            if (result === errorObject) {
                this.error(errorObject.e);
                return;
            }
            // timeout and responseType can be set once the XHR is open
            xhr.timeout = request.timeout;
            xhr.responseType = request.responseType;
            // set headers
            this.setHeaders(xhr, headers);
            // now set up the events
            this.setupEvents(xhr, request);
            // finally send the request
            if (body) {
                xhr.send(body);
            }
            else {
                xhr.send();
            }
        }
    }
    serializeBody(body, contentType) {
        if (!body || typeof body === 'string') {
            return body;
        }
        const splitIndex = contentType.indexOf(';');
        if (splitIndex !== -1) {
            contentType = contentType.substring(0, splitIndex);
        }
        switch (contentType) {
            case 'application/x-www-form-urlencoded':
                return Object.keys(body).map(key => `${key}=${encodeURI(body[key])}`).join('&');
            case 'application/json':
                return JSON.stringify(body);
        }
    }
    setHeaders(xhr, headers) {
        for (let key in headers) {
            if (headers.hasOwnProperty(key)) {
                xhr.setRequestHeader(key, headers[key]);
            }
        }
    }
    setupEvents(xhr, request) {
        const progressSubscriber = request.progressSubscriber;
        xhr.ontimeout = function xhrTimeout(e) {
            const { subscriber, progressSubscriber, request } = xhrTimeout;
            if (progressSubscriber) {
                progressSubscriber.error(e);
            }
            subscriber.error(new AjaxTimeoutError(this, request)); //TODO: Make betterer.
        };
        xhr.ontimeout.request = request;
        xhr.ontimeout.subscriber = this;
        xhr.ontimeout.progressSubscriber = progressSubscriber;
        if (xhr.upload && 'withCredentials' in xhr && root.XDomainRequest) {
            if (progressSubscriber) {
                xhr.onprogress = function xhrProgress(e) {
                    const { progressSubscriber } = xhrProgress;
                    progressSubscriber.next(e);
                };
                xhr.onprogress.progressSubscriber = progressSubscriber;
            }
            xhr.onerror = function xhrError(e) {
                const { progressSubscriber, subscriber, request } = xhrError;
                if (progressSubscriber) {
                    progressSubscriber.error(e);
                }
                subscriber.error(new AjaxError('ajax error', this, request));
            };
            xhr.onerror.request = request;
            xhr.onerror.subscriber = this;
            xhr.onerror.progressSubscriber = progressSubscriber;
        }
        xhr.onreadystatechange = function xhrReadyStateChange(e) {
            const { subscriber, progressSubscriber, request } = xhrReadyStateChange;
            if (this.readyState === 4) {
                // normalize IE9 bug (http://bugs.jquery.com/ticket/1450)
                let status = this.status === 1223 ? 204 : this.status;
                let response = (this.responseType === 'text' ? (this.response || this.responseText) : this.response);
                // fix status code when it is 0 (0 status is undocumented).
                // Occurs when accessing file resources or on Android 4.1 stock browser
                // while retrieving files from application cache.
                if (status === 0) {
                    status = response ? 200 : 0;
                }
                if (200 <= status && status < 300) {
                    if (progressSubscriber) {
                        progressSubscriber.complete();
                    }
                    subscriber.next(e);
                    subscriber.complete();
                }
                else {
                    if (progressSubscriber) {
                        progressSubscriber.error(e);
                    }
                    subscriber.error(new AjaxError('ajax error ' + status, this, request));
                }
            }
        };
        xhr.onreadystatechange.subscriber = this;
        xhr.onreadystatechange.progressSubscriber = progressSubscriber;
        xhr.onreadystatechange.request = request;
    }
    unsubscribe() {
        const { done, xhr } = this;
        if (!done && xhr && xhr.readyState !== 4) {
            xhr.abort();
        }
        super.unsubscribe();
    }
}
/** A normalized AJAX response */
export class AjaxResponse {
    constructor(originalEvent, xhr, request) {
        this.originalEvent = originalEvent;
        this.xhr = xhr;
        this.request = request;
        this.status = xhr.status;
        this.responseType = xhr.responseType;
        switch (this.responseType) {
            case 'json':
                if ('response' in xhr) {
                    this.response = xhr.response;
                }
                else {
                    this.response = JSON.parse(xhr.responseText || '');
                }
                break;
            case 'xml':
                this.response = xhr.responseXML;
                break;
            case 'text':
            default:
                this.response = ('response' in xhr) ? xhr.response : xhr.responseText;
                break;
        }
    }
}
/** A normalized AJAX error */
export class AjaxError extends Error {
    constructor(message, xhr, request) {
        super(message);
        this.message = message;
        this.xhr = xhr;
        this.request = request;
        this.status = xhr.status;
    }
}
export class AjaxTimeoutError extends AjaxError {
    constructor(xhr, request) {
        super('ajax timeout', xhr, request);
    }
}
//# sourceMappingURL=AjaxObservable.js.map
