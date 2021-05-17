const fs = require("fs");
const path = require("path");
const babelParset = require("@babel/parser");

const srcIndexContent = fs.readFileSync(
  path.resolve(__dirname, "../src/index.js"),
  {
    encoding: "utf-8",
  }
);

const astResult = babelParset.parse(srcIndexContent, {
  sourceType: "module",
});

fs.createWriteStream("./ast-result.json").write(
  JSON.stringify(astResult, undefined, 2)
);
