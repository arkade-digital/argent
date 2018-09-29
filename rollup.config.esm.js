import babel from "rollup-plugin-babel";

export default {
  input: "src/Argent.js",
  output: {
    format: "esm",
    file: "dist/argent.esm.js"
  },
  plugins: [
    babel({
      exclude: "node_modules/**"
    })
  ],
  external: ["store", "numeral", "url-search-params-polyfill"]
};
