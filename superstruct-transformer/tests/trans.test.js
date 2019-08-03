const test = require("tape");
const nodeEval = require("node-eval");
const ts = require("typescript");
const fs = require("fs");
const {
  createValidatorTransformer
} = require("superstruct-transformer/transformer");

test("test 1", t => shouldPassValidation(t, "test1.ts", { name: "Me" }));

test("test 2", t => shouldThrowError(t, "test2.ts"));

test("test 3", t =>
  shouldPassValidation(t, "test3.ts", {
    fieldStr: "test str",
    fieldNumber: 123,
    fieldBoolean: true
  }));

const compile = filename => {
  const compilerOptions = {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS
  };
  const program = ts.createProgram([filename], compilerOptions);
  const fileContent = fs.readFileSync(filename, { encoding: "utf-8" });
  const transpiledSource = ts.transpileModule(fileContent, {
    transformers: { before: [createValidatorTransformer(program)] },
    compilerOptions
  });
  return transpiledSource.outputText;
};

function shouldPassValidation(t, filename, expectedParsedObj) {
  t.plan(1);

  const compiledTsWithTransform = compile(__dirname + "/" + filename);
  let tsExports;

  try {
    tsExports = nodeEval(compiledTsWithTransform, __filename);
  } catch (error) {
    console.log(
      `The transpiled output:
=======================
${compiledTsWithTransform}
=======================`
    );
    t.fail(error);
  }

  t.deepEqual(tsExports.obj, expectedParsedObj);
}

function shouldThrowError(t, filename) {
  t.plan(1);

  const compiledTsWithTransform = compile(__dirname + "/" + filename);
  let tsExports;

  try {
    tsExports = nodeEval(compiledTsWithTransform, __filename);
  } catch (error) {
    t.pass("validate throwed as expected");
    return;
  }

  console.log(
    `The transpiled output:
=======================
${compiledTsWithTransform}
=======================`
  );

  t.fail("validate should throw");
}
