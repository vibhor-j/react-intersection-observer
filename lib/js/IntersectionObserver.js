'use strict';

exports.__esModule = true;

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _propTypes = require('prop-types');

var _propTypes2 = _interopRequireDefault(_propTypes);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _observer = require('./observer');

var _utils = require('./utils');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var observerOptions = ['root', 'rootMargin', 'threshold'];
var observerProps = ['disabled'].concat(observerOptions);
var objectProto = Object.prototype;

var IntersectionObserver = function (_React$Component) {
    _inherits(IntersectionObserver, _React$Component);

    function IntersectionObserver(props) {
        _classCallCheck(this, IntersectionObserver);

        var _this = _possibleConstructorReturn(this, _React$Component.call(this, props));

        _this.setMinThreshold = function () {
            if (Array.isArray(_this.props.threshold)) {
                _this.minThreshold = _this.props.threshold.reduce(function (a, b) {
                    return Math.min(a, b);
                });
            } else {
                _this.minThreshold = _this.props.threshold;
            }
        };

        _this.handleChange = function (event) {
            if (_this.props.onEntry && !_this.isEntered && event.intersectionRatio >= _this.minThreshold) {
                _this.props.onEntry(event, _this.unobserve);
                _this.isEntered = true;
                _this.waitForCertifiedView = setTimeout(function () {
                    if (_this.props.onCertifiedView) {
                        _this.props.onCertifiedView(event, _this.unobserve);
                    }
                }, _this.props.waitTime);
            }

            if (_this.props.onExit && _this.isEntered && event.intersectionRatio < _this.minThreshold) {
                _this.props.onExit(event, _this.unobserve);
                _this.isEntered = false;
                clearTimeout(_this.waitForCertifiedView);
            }

            _this.props.onChange(event, _this.unobserve);

            if (_this.props.onlyOnce) {
                // eslint-disable-next-line no-undef
                if (process.env.NODE_ENV !== 'production') {
                    (0, _invariant2.default)('isIntersecting' in event, "onlyOnce requires isIntersecting to exists in IntersectionObserverEntry's prototype. Either your browser or your polyfill lacks support.");
                }
                if (event.isIntersecting) {
                    _this.unobserve();
                }
            }
            // eslint-disable-next-line no-undef
            if (process.env.NODE_ENV !== 'production') {
                (0, _warning2.default)(!_this.props.hasOwnProperty('onlyOnce'), 'ReactIntersectionObserver: [deprecation] Use the second argument of onChange to unobserve a target instead of onlyOnce. This prop will be removed in the next major version.');
            }
        };

        _this.handleNode = function (target) {
            /**
             * Forward hijacked ref to user.
             */
            var nodeRef = _this.props.children.ref;
            if (nodeRef) {
                if (typeof nodeRef === 'function') {
                    nodeRef(target);
                } else if ((typeof nodeRef === 'undefined' ? 'undefined' : _typeof(nodeRef)) === 'object') {
                    nodeRef.current = target;
                }
            }

            /**
             * This is a bit ugly: would like to use getSnapshotBeforeUpdate(), but we do not want to depend on
             * react-lifecycles-compat to support React versions prior to 16.3 as this extra boolean gets the job done.
             */
            _this.targetChanged = (_this.renderedTarget && target) != null && _this.renderedTarget !== target;
            if (_this.targetChanged) {
                _this.unobserve();
            }
            _this.target = target;
        };

        _this.observe = function () {
            _this.target = (0, _utils.isDOMTypeElement)(_this.target) ? _this.target : (0, _reactDom.findDOMNode)(_this.target);
            _this.observer = (0, _observer.createObserver)(_this.options);
            (0, _observer.observeElement)(_this);
        };

        _this.unobserve = function () {
            if (_this.target != null) {
                (0, _observer.unobserveElement)(_this);
            }
        };

        _this.isEntered = false;
        _this.minThreshold = 0;
        return _this;
    }

    IntersectionObserver.prototype.componentDidMount = function componentDidMount() {
        // eslint-disable-next-line no-undef
        if (process.env.NODE_ENV !== 'production' && parseInt(_react2.default.version, 10) < 16) {
            (0, _invariant2.default)(this.target, 'Stateless function components cannot be given refs. Attempts to access this ref will fail.');
        }
        if (!this.props.disabled) {
            this.observe();
        }
        this.setMinThreshold();
    };

    IntersectionObserver.prototype.componentDidUpdate = function componentDidUpdate(prevProps) {
        var _this2 = this;

        var propsChanged = observerProps.some(function (prop) {
            return (0, _utils.shallowCompare)(_this2.props[prop], prevProps[prop]);
        });

        if (propsChanged) {
            this.unobserve();
        }

        if (this.targetChanged || propsChanged) {
            if (!this.props.disabled) {
                this.observe();
            }
        }
        this.setMinThreshold();
    };

    IntersectionObserver.prototype.componentWillUnmount = function componentWillUnmount() {
        this.unobserve();
    };

    IntersectionObserver.prototype.render = function render() {
        this.renderedTarget = this.target; // this value is null on the first render

        return _react2.default.cloneElement(_react2.default.Children.only(this.props.children), {
            ref: this.handleNode
        });
    };

    _createClass(IntersectionObserver, [{
        key: 'options',
        get: function get() {
            var _this3 = this;

            return observerOptions.reduce(function (options, key) {
                if (objectProto.hasOwnProperty.call(_this3.props, key)) {
                    var useQuery = key === 'root' && objectProto.toString.call(_this3.props[key]) === '[object String]';
                    options[key] = useQuery ? document.querySelector(_this3.props[key]) : _this3.props[key];
                }
                return options;
            }, {});
        }
    }]);

    return IntersectionObserver;
}(_react2.default.Component);

IntersectionObserver.displayName = 'IntersectionObserver';
exports.default = IntersectionObserver;
process.env.NODE_ENV !== "production" ? IntersectionObserver.propTypes = {
    /**
     * The element that is used as the target to observe.
     */
    children: _propTypes2.default.element.isRequired,

    /**
     * The element that is used as the viewport for checking visibility of the target.
     * Can be specified as string for selector matching within the document.
     * Defaults to the browser viewport if not specified or if null.
     */
    root: _propTypes2.default.oneOfType([_propTypes2.default.string].concat(typeof HTMLElement === 'undefined' ? [] : _propTypes2.default.instanceOf(HTMLElement))),

    /**
     * Margin around the root. Can have values similar to the CSS margin property,
     * e.g. "10px 20px 30px 40px" (top, right, bottom, left).
     * If the root element is specified, the values can be percentages.
     * This set of values serves to grow or shrink each side of the root element's
     * bounding box before computing intersections.
     * Defaults to all zeros.
     */
    rootMargin: _propTypes2.default.string,

    /**
     * Either a single number or an array of numbers which indicate at what percentage
     * of the target's visibility the observer's callback should be executed.
     * If you only want to detect when visibility passes the 50% mark, you can use a value of 0.5.
     * If you want the callback run every time visibility passes another 25%,
     * you would specify the array [0, 0.25, 0.5, 0.75, 1].
     * The default is 0 (meaning as soon as even one pixel is visible, the callback will be run).
     * A value of 1.0 means that the threshold isn't considered passed until every pixel is visible.
     */
    threshold: _propTypes2.default.oneOfType([_propTypes2.default.number, _propTypes2.default.arrayOf(_propTypes2.default.number)]),

    /**
     * When true indicate that events fire only until the element is intersecting.
     * Different browsers behave differently towards the isIntersecting property, make sure
     * you polyfill and/or override the IntersectionObserverEntry object's prototype to your needs.
     * Defaults to false.
     */
    onlyOnce: _propTypes2.default.bool,

    /**
     * Controls whether the element should stop being observed by its IntersectionObserver instance.
     * Defaults to false.
     */
    disabled: _propTypes2.default.bool,

    /**
     * Function that will be invoked whenever the intersection value for this element changes.
     */
    onChange: _propTypes2.default.func.isRequired,

    /**
     * Function that will be invoked whenever the intersection ratio for this element goes above least value of threshold
     */
    onEntry: _propTypes2.default.func,

    /**
     * Function that will be invoked whenever the intersection ratio for this element goes below least value of threshold
     */
    onExit: _propTypes2.default.func,

    /**
     * Function that will be invoked after specified waitTime after entry.
     */
    onCertifiedView: _propTypes2.default.func,

    /**
     * Time interval in miliseconds to wait after entry to call certified view.
     */
    waitTime: _propTypes2.default.number
} : void 0;