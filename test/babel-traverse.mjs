import * as parser from "@babel/parser";
import traverse from "@babel/traverse";
import fs from "fs";

const code = `function square(n) {
  return n * n;
}`;

const ast = parser.parse(code);

fs.createWriteStream("./babel-traverse-before.json").write(
  JSON.stringify(ast, undefined, 2)
);

traverse.default(ast, {
  enter(path) {
    console.log(path);
    if (path.isIdentifier({ name: "n" })) {
      path.node.name = "x";
    }
  },
});

fs.createWriteStream("./babel-traverse-after.json").write(
  JSON.stringify(ast, undefined, 2)
);
