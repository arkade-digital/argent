import store from 'store';
import numeral from 'numeral';
import 'url-search-params-polyfill';

function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}

function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  return Constructor;
}

function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
}

function _objectSpread(target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i] != null ? arguments[i] : {};
    var ownKeys = Object.keys(source);

    if (typeof Object.getOwnPropertySymbols === 'function') {
      ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
        return Object.getOwnPropertyDescriptor(source, sym).enumerable;
      }));
    }

    ownKeys.forEach(function (key) {
      _defineProperty(target, key, source[key]);
    });
  }

  return target;
}

var Argent =
/*#__PURE__*/
function () {
  /**
   * Construct a new instance of Argent.
   *
   * options.rates
   *   Object containing rates e.g. { USD: 1, GBP: 1.30749 }
   *
   * options.formats
   *   Optional object containing formatting rules
   *
   * options.baseCurrency
   *   Base currency to convert from
   *
   * options.defaultCurrency
   *   Default currency to convert to (defaults to baseCurrency)
   *
   * options.baseFormat
   *   Numeral format string for amounts in base currency
   *
   * options.convertedFormat
   *   Numeral format string for amounts in converted currency
   *
   * options.hideCodeForBase
   *   Hide currency code (e.g. AUD) suffix for the base currency
   *
   * @param  {Object}  options
   */
  function Argent(options) {
    _classCallCheck(this, Argent);

    this.rates = options.rates;

    if (!this.rates) {
      throw new Error("You must set rates when instantiating Argent");
    }

    this.baseCurrency = options.baseCurrency;
    this.hideCodeForBase = options.hideCodeForBase;

    if (!this.baseCurrency) {
      throw new Error("You must set baseCurrency when instantiating Argent");
    }

    this.defaultCurrency = options.defaultCurrency ? options.defaultCurrency : options.baseCurrency;
    this.baseFormat = options.baseFormat ? options.defaultBaseFormat : "0,0.00";
    this.convertedFormat = options.convertedFormat ? options.convertedFormat : "0,0";
    this.formats = this.defaultFormats();

    if (options.formats) {
      this.formats = _objectSpread({}, this.formats, options.formats);
    }

    this.currency = this.checkCurrency(this.resolveCurrency());
  }
  /**
   * Return an object containing default currency formats.
   *
   * @return  {object}
   */


  _createClass(Argent, [{
    key: "defaultFormats",
    value: function defaultFormats() {
      return {
        AUD: {
          symbol: "$",
          code: "AUD"
        },
        USD: {
          symbol: "$",
          code: "USD"
        },
        GBP: {
          symbol: "£",
          code: "GBP"
        },
        EUR: {
          symbol: "€",
          code: "EUR"
        },
        CAD: {
          symbol: "$",
          code: "CAD"
        }
      };
    }
    /**
     * Resolve currency from local storage or URL parameter.
     *
     * @return  {stirng}
     */

  }, {
    key: "resolveCurrency",
    value: function resolveCurrency() {
      var urlCurrency = new URLSearchParams(window.location.search).get("currency");

      if (urlCurrency) {
        store.set("currency", urlCurrency);
        return urlCurrency;
      }

      var storedCurrency = store.get("currency");

      if (storedCurrency) {
        return storedCurrency;
      }

      return this.defaultCurrency;
    }
    /**
     * Throw error and clear store if currency not supported.
     *
     * @param  {string}  currency
     * @return {string}
     */

  }, {
    key: "checkCurrency",
    value: function checkCurrency(currency) {
      if (!this.rates[currency] || !this.formats[currency]) {
        store.remove("currency");
        throw new Error("No rate and/or format provided for selected currency ".concat(currency));
      }

      return currency;
    }
    /**
     * Parse the given string to a Numeral instance.
     *
     * @param  {string}  formattedString
     * @return {Numeral} Parsed Numeral instance
     */

  }, {
    key: "parse",
    value: function parse(formattedString) {
      return numeral(formattedString);
    }
    /**
     * Convert Numeral instance between currencies.
     *
     * @param  {Numeral}  amount  Amount as a Numeral instance
     * @param  {string}  from  ISO currency string to convert from
     * @param  {String}  to  ISO currency string to convert to
     * @return {Numeral}  Converted numeral instance
     */

  }, {
    key: "convert",
    value: function convert(amount, from, to) {
      return amount.clone().multiply(this.rates[from]).divide(this.rates[to]);
    }
    /**
     * Format the given Numeral amount in the given currency.
     *
     * @param  {Numeral}  amount
     * @return {string}  ISO currency code
     */

  }, {
    key: "format",
    value: function format(amount, currency) {
      var format = this.formats[currency];

      if (!format) {
        throw new Error("Format ".concat(format, " not available for currency conversion."));
      }

      var formattedAmount = amount.format(currency === this.baseCurrency ? this.baseFormat : this.convertedFormat);

      if (format.symbol) {
        formattedAmount = format.symbol + formattedAmount;
      }

      if (this.hideCodeForBase && currency == this.baseCurrency) {
        formattedAmount = "".concat(formattedAmount);
      } else {
        formattedAmount = "".concat(formattedAmount, " ").concat(format.code);
      }

      return formattedAmount;
    }
    /**
     * Return the currently selected currency.
     *
     * @return {string}
     */

  }, {
    key: "getCurrency",
    value: function getCurrency() {
      return this.currency;
    }
    /**
     * Set the targetted currency.
     *
     * @param  {string}  currency
     * @param  {boolean}  refresh  Whether or not a page refresh will be triggered
     * @return {Argent}
     */

  }, {
    key: "setCurrency",
    value: function setCurrency(currency, refresh) {
      this.checkCurrency(currency);
      this.currency = currency;
      store.set("currency", this.currency);
      var urlParams = new URLSearchParams(window.location.search);

      if (urlParams.get("currency")) {
        urlParams.delete("currency");
      }

      if (false !== refresh) {
        window.location.href = [window.location.protocol, "//", window.location.host, window.location.pathname, urlParams.toString() ? "?" + urlParams.toString() : null].join("");
      }

      return this;
    }
    /**
     * Convert a formatted string between currencies.
     *
     * @param  {string}  formattedString
     * @param  {string}  fromCurrency
     * @param  {string}  toCurrency
     * @return {string}
     */

  }, {
    key: "convertFormatted",
    value: function convertFormatted(formattedString, fromCurrency, toCurrency) {
      if (!fromCurrency) fromCurrency = this.baseCurrency;
      if (!toCurrency) toCurrency = this.currency;
      return this.format(this.convert(this.parse(formattedString), fromCurrency, toCurrency), toCurrency);
    }
    /**
     * Convert all nodes matching given DOMString to the target currency.
     *
     * @param  {string}  selector  DOMString
     * @param  {string}  fromCurrency
     * @param  {string}  toCurrency
     * @return {Argent}
     */

  }, {
    key: "convertFormattedNodes",
    value: function convertFormattedNodes(selector, fromCurrency, toCurrency) {
      var _this = this;

      if (!fromCurrency) fromCurrency = this.baseCurrency;
      if (!toCurrency) toCurrency = this.currency; // Polyfill NodeList.forEach for IE

      if (window.NodeList && !NodeList.prototype.forEach) {
        NodeList.prototype.forEach = Array.prototype.forEach;
      }

      document.querySelectorAll(selector).forEach(function (currentValue) {
        var baseAmount = _this.parse(currentValue.dataset.amount ? currentValue.dataset.amount : currentValue.innerText);

        var convertedAmount = _this.convert(baseAmount, _this.defaultCurrency, _this.currency);

        currentValue.dataset.currency = _this.currency;
        currentValue.dataset.amount = baseAmount.value();
        currentValue.innerText = _this.format(convertedAmount, _this.currency);
      });
      return this;
    }
    /**
     * Register events on currency selector to trigger updates.
     *
     * @param  {string}  selector  DOMString
     * @return {Argent}
     */

  }, {
    key: "registerCurrencySelector",
    value: function registerCurrencySelector(selector) {
      var _this2 = this;

      var nodes = document.querySelectorAll(selector);

      if (!nodes) {
        throw new Error("Node with selector \"".concat(selector, "\" not found, could not register currency selector"));
      }

      for (var i = 0; i < nodes.length; i++) {
        nodes[i].addEventListener("change", function (event) {
          return _this2.setCurrency(event.target.value);
        });
        nodes[i].value = this.currency;
      }

      return this;
    }
  }]);

  return Argent;
}();

export default Argent;
