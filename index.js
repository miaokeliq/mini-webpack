// Inpath
import fs from "fs";
import path from "path";
import parser from "@babel/parser";
import traverse from "@babel/traverse";

function createAsset(filePath) {
  // 1. 获取文件的内容
  // 获取 ast -> 抽象语法树

  // Tpp
  const source = fs.readFileSync(filePath, {
    encoding: "utf-8",
  });

  // 2. 获取依赖关系
  const ast = parser.parse(source, {
    sourceType: "module",
  });

  const deps = [];
  // babel api  用于对树的搜索
  traverse.default(ast, {
    // 当访问到该类型的节点时会调用该callback
    ImportDeclaration({ node }) {
      // 收集依赖
      deps.push(node.source.value); // ./foo.js
    },
  });

  // 以上两个统称为资源
  return {
    filePath,
    source,
    deps,
  };
}

function createGraph() {
  const mainAsset = createAsset("./example/main.js");
  // 基于依赖关系找到下一个模块， 这里应该找到 foo.js ，再把 它的路径给 createAsset ,
  // 广度优先搜索搜索图
  const queue = [mainAsset];

  for (const asset of queue) {
    asset.deps.forEach((relativePath) => {
      // path.resolve() 将 路径解析为绝对路径
      const child = createAsset(path.resolve("./example", relativePath));
      queue.push(child);
    });
  }

  return queue;
}

const graph = createGraph();
console.log(graph);
