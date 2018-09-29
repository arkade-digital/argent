import babel from "rollup-plugin-babel";
import commonjs from "rollup-plugin-commonjs";
import resolve from "rollup-plugin-node-resolve";
import minify from "rollup-plugin-babel-minify";

export default {
  input: "src/Argent.js",
  output: {
    format: "umd",
    name: "Argent",
    file: "dist/argent.min.js"
  },
  plugins: [
    resolve(),
    commonjs(),
    babel({
      exclude: "node_modules/**"
    }),
    minify({
      comments: false
    })
  ]
};
