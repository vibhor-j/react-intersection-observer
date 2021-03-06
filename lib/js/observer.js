'use strict';

exports.__esModule = true;
exports.observerElementsMap = undefined;
exports.getPooled = getPooled;
exports.findObserverElement = findObserverElement;
exports.callback = callback;
exports.createObserver = createObserver;
exports.observeElement = observeElement;
exports.unobserveElement = unobserveElement;

require('intersection-observer');

var _utils = require('./utils');

var observerElementsMap = exports.observerElementsMap = new Map(); // polyfill
function getPooled() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    var root = options.root || null;
    var rootMargin = (0, _utils.parseRootMargin)(options.rootMargin);
    var threshold = Array.isArray(options.threshold) ? options.threshold : [options.threshold != null ? options.threshold : 0];
    var observers = observerElementsMap.keys();
    var observer = void 0;
    while (observer = observers.next().value) {
        var unmatched = root !== observer.root || rootMargin !== observer.rootMargin || (0, _utils.shallowCompare)(threshold, observer.thresholds);

        if (!unmatched) {
            return observer;
        }
    }
    return null;
}

function findObserverElement(observer, entry) {
    var elements = observerElementsMap.get(observer);
    if (elements) {
        var values = elements.values();
        var element = void 0;
        while (element = values.next().value) {
            if (element.target === entry.target) {
                return element;
            }
        }
    }
    return null;
}

/**
 * The Intersection Observer API callback that is called whenever one element,
 * called the target, intersects either the device viewport or a specified element.
 * Also will get caled whenever the visibility of the target element changes and
 * crosses desired amounts of intersection with the root.
 * @param {array} changes
 * @param {IntersectionObserver} observer
 */
function callback(changes, observer) {
    for (var i = 0; i < changes.length; i++) {
        var element = findObserverElement(observer, changes[i]);
        if (element) {
            element.handleChange(changes[i]);
        }
    }
}

function createObserver(options) {
    return getPooled(options) || new IntersectionObserver(callback, options);
}

function observeElement(element) {
    if (!observerElementsMap.has(element.observer)) {
        observerElementsMap.set(element.observer, new Set());
    }
    observerElementsMap.get(element.observer).add(element);
    element.observer.observe(element.target);
}

function unobserveElement(element) {
    if (observerElementsMap.has(element.observer)) {
        var targets = observerElementsMap.get(element.observer);
        if (targets.delete(element)) {
            if (targets.size > 0) {
                element.observer.unobserve(element.target);
            } else {
                element.observer.disconnect();
                observerElementsMap.delete(element.observer);
            }
        }
    }
}