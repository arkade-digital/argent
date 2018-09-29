# :money_with_wings: Argent

Argent is a simple Javascript library for converting currency amounts to a second currency.

- Provides a simple conversion API for programmatic use
- Automatically manages session storage for user currency selection
- Optionally scan page and automatically convert amounts to target currency
- Listens to `?currency` parameter plus an optional dropdown for target selection
- Uses [Numeral](https://github.com/adamwdraper/Numeral-js) under the hood for configurable formatting of converted amounts

## Installation

### Imported module (recommended)

Use this method if you are transpiling your code with something like Webpack.

```bash
yarn add @arkade/argent
# or npm add @arkade/argent --save
```

```js
import Argent from "@arkade/argent"

const argent = new Argent({ ... });
```

### Standalone build

A standalone web build has been included at `dist/argent.js` and `dist/argent.min.js`. Include this file somewhere in your page (before the closing `</body>` recommended) before instantiating Argent.

Optionally, you could include the file from [unpkg.com](https://unpkg.com).

```html
<script src="https://unpkg.com/@arkade/argent/dist/argent.min.js"></script>
<script>
  var argent = new Argent({ ... });
</script>
```

## Usage

### Instantiating Argent

Before you can begin converting currencies, you will need an instance of Argent.

```js
const argent = new Argent({
  rates: { USD: 1, AUD: 0.720461, GBP: 1.30749 },
  baseCurrency: "AUD"
});
```

### Converting a single currency amount

To convert formatted amounts between two currencies, use the `convertFormatted` method.

```js
argent.convertFormatted("$300", "AUD", "GBP"); // Returns "$165 GBP"
```

The shortcut `convertFormatted` method internally does the following.

```js
let aud = argent.parse("$300"); // Returns a Numeral instance with value 300
let gbp = argent.convert(aud, "AUD", "GBP"); // Returns a numeral instance with value 165.31
argent.format(gbp, "GBP"); // Returns "$165 GBP"
```

### Converting all currencies on the page

Using the `convertFormattedNodes` method, you can easily parse the entire page for a particular [selector](https://developer.mozilla.org/en-US/docs/Web/API/Document/querySelectorAll) and convert to the target currency.

```js
argent.convertFormattedNodes(".currency", "AUD", "GBP");
```

## Session management

Argent contains an in-built mechanism for remembering which currency the user has selected. This allows you to ommit the `from` and `to` arguments in the usage methods as currencies will always be converted from your `baseCurrency` and to the target currency selected by the user.

Once a currency is selected, it will be remembered using LocalStorage or the compatible equivalent.

### Selecting a target currency

The following methods are available for currency selection:

- Append `?currency=AUD` to the URL
- Call the `argent.setCurrency('AUD')` method (refreshes the page by default)
- Change a bound currency selector input (see below)

### Binding a currency selector input

You will most likely wish to provide a `<select>` input for your users to select a target currency. If you have one, you can bind it using the `registerCurrencySelector` method. Any updates to the input will automatically trigger the `argent.setCurrency()` method and refresh the page.

```js
argent.registerCurrencySelector('select[name="currency"]');
```

### Getting the current target currency

```js
argent.getCurrency();
```

## Options reference

```js
new Argent({
  // Object containing exchange rates (required)
  rates: {
    USD: 1,
    GBP: 1.30749,
    EUR: 1.16364,
    AUD: 0.720461
  },

  // Object containing formatting rules for each currency (optional)
  // A default is provided, formats given here will merge
  formats: {
    AUD: { symbol: "$", code: "AUD" },
    EUR: { symbol: "€", code: "EUR" }
  },

  // Base currency to convert from (required)
  baseCurrency: "AUD",

  // Default currency to convert to (optional, defaults to baseCurrency)
  defaultCurrency: "AUD",

  // Numeral format string for amounts in base currency (optional, includes decimals)
  baseFormat: "0,0.00",

  // Numeral format string for amounts in converted currency (optional, excludes decimals)
  convertedFormat: "0,0"
});
```

## API reference

## Why the name Argent?

Argent means _Money_ in French :fr:
