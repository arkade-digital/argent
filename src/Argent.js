import store from "store";
import numeral from "numeral";
import "url-search-params-polyfill";

export default class Argent {
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
  constructor(options) {
    this.rates = options.rates;

    if (!this.rates) {
      throw new Error("You must set rates when instantiating Argent");
    }

    this.baseCurrency = options.baseCurrency;

    this.hideCodeForBase = options.hideCodeForBase;

    if (!this.baseCurrency) {
      throw new Error("You must set baseCurrency when instantiating Argent");
    }

    this.defaultCurrency = options.defaultCurrency
      ? options.defaultCurrency
      : options.baseCurrency;

    this.baseFormat = options.baseFormat ? options.defaultBaseFormat : "0,0.00";

    this.convertedFormat = options.convertedFormat
      ? options.convertedFormat
      : "0,0";

    this.formats = this.defaultFormats();

    if (options.formats) {
      this.formats = { ...this.formats, ...options.formats };
    }

    this.currency = this.checkCurrency(this.resolveCurrency());
  }

  /**
   * Return an object containing default currency formats.
   *
   * @return  {object}
   */
  defaultFormats() {
    return {
      AUD: { symbol: "$", code: "AUD" },
      USD: { symbol: "$", code: "USD" },
      GBP: { symbol: "£", code: "GBP" },
      EUR: { symbol: "€", code: "EUR" },
      CAD: { symbol: "$", code: "CAD" }
    };
  }

  /**
   * Resolve currency from local storage or URL parameter.
   *
   * @return  {stirng}
   */
  resolveCurrency() {
    const urlCurrency = new URLSearchParams(window.location.search).get(
      "currency"
    );

    if (urlCurrency) {
      store.set("currency", urlCurrency);
      return urlCurrency;
    }

    const storedCurrency = store.get("currency");

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
  checkCurrency(currency) {
    if (!this.rates[currency] || !this.formats[currency]) {
      store.remove("currency");
      throw new Error(
        `No rate and/or format provided for selected currency ${currency}`
      );
    }

    return currency;
  }

  /**
   * Parse the given string to a Numeral instance.
   *
   * @param  {string}  formattedString
   * @return {Numeral} Parsed Numeral instance
   */
  parse(formattedString) {
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
  convert(amount, from, to) {
    return amount
      .clone()
      .multiply(this.rates[from])
      .divide(this.rates[to]);
  }

  /**
   * Format the given Numeral amount in the given currency.
   *
   * @param  {Numeral}  amount
   * @return {string}  ISO currency code
   */
  format(amount, currency) {
    const format = this.formats[currency];

    if (!format) {
      throw new Error(
        `Format ${format} not available for currency conversion.`
      );
    }

    let formattedAmount = amount.format(
      currency === this.baseCurrency ? this.baseFormat : this.convertedFormat
    );

    if (format.symbol) {
      formattedAmount = format.symbol + formattedAmount;
    }

    if (this.hideCodeForBase && currency == this.baseCurrency) {
      formattedAmount = `${formattedAmount}`;
    } else {
      formattedAmount = `${formattedAmount} ${format.code}`;
    }

    return formattedAmount;
  }

  /**
   * Return the currently selected currency.
   *
   * @return {string}
   */
  getCurrency() {
    return this.currency;
  }

  /**
   * Set the targetted currency.
   *
   * @param  {string}  currency
   * @param  {boolean}  refresh  Whether or not a page refresh will be triggered
   * @return {Argent}
   */
  setCurrency(currency, refresh) {
    this.checkCurrency(currency);

    this.currency = currency;

    store.set("currency", this.currency);

    const urlParams = new URLSearchParams(window.location.search);

    if (urlParams.get("currency")) {
      urlParams.delete("currency");
    }

    if (false !== refresh) {
      window.location.href = [
        window.location.protocol,
        "//",
        window.location.host,
        window.location.pathname,
        urlParams.toString() ? "?" + urlParams.toString() : null
      ].join("");
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
  convertFormatted(formattedString, fromCurrency, toCurrency) {
    if (!fromCurrency) fromCurrency = this.baseCurrency;
    if (!toCurrency) toCurrency = this.currency;

    return this.format(
      this.convert(this.parse(formattedString), fromCurrency, toCurrency),
      toCurrency
    );
  }

  /**
   * Convert all nodes matching given DOMString to the target currency.
   *
   * @param  {string}  selector  DOMString
   * @param  {string}  fromCurrency
   * @param  {string}  toCurrency
   * @return {Argent}
   */
  convertFormattedNodes(selector, fromCurrency, toCurrency) {
    if (!fromCurrency) fromCurrency = this.baseCurrency;
    if (!toCurrency) toCurrency = this.currency;

    // Polyfill NodeList.forEach for IE
    if (window.NodeList && !NodeList.prototype.forEach) {
      NodeList.prototype.forEach = Array.prototype.forEach;
    }

    document.querySelectorAll(selector).forEach(currentValue => {
      const baseAmount = this.parse(
        currentValue.dataset.amount
          ? currentValue.dataset.amount
          : currentValue.innerText
      );

      const convertedAmount = this.convert(
        baseAmount,
        this.defaultCurrency,
        this.currency
      );

      currentValue.dataset.currency = this.currency;
      currentValue.dataset.amount = baseAmount.value();

      currentValue.innerText = this.format(convertedAmount, this.currency);
    });

    return this;
  }

  /**
   * Register events on currency selector to trigger updates.
   *
   * @param  {string}  selector  DOMString
   * @return {Argent}
   */
  registerCurrencySelector(selector) {
    const nodes = document.querySelectorAll(selector);

    if (!nodes) {
      throw new Error(
        `Node with selector "${selector}" not found, could not register currency selector`
      );
    }

    for (var i = 0; i < nodes.length; ++i) {
      nodes[i].addEventListener("change", event =>
        this.setCurrency(event.target.value)
      );
      nodes[i].value = this.currency;
    }

    return this;
  }
}
