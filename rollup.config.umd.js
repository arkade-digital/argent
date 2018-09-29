import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";

export default {
  input: "src/Argent.js",
  output: {
    format: "umd",
    name: "Argent",
    file: "dist/argent.js"
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: "node_modules/**"
    })
  ]
};
