const tape = require("tape");
const nodeEval = require("node-eval");
const ts = require("typescript");
const fs = require("fs");
const {
  createValidatorTransformer
} = require("superstruct-transformer/transformer");

tape("test 1", t => shouldPassValidation(t, "test1.ts", { name: "Me" }));

tape("test 2", t => shouldThrowError(t, "test2.ts"));

tape("test 3", t =>
  shouldPassValidation(t, "test3.ts", {
    fieldStr: "test str",
    fieldNumber: 123,
    fieldBoolean: true
  })
);

tape("test auto enum success", t =>
  shouldPassValidation(t, "testEnum1Success.ts", {
    fieldEnum: 2
  })
);

tape("test auto enum failure", t => shouldThrowError(t, "testEnum1Fail.ts"));

tape("test int-initialized enum success", t =>
  shouldPassValidation(t, "testEnum2Success.ts", {
    fieldEnum: 4
  })
);

tape("test int-initialized enum failure", t =>
  shouldThrowError(t, "testEnum2Fail.ts")
);

tape("test string-initialized enum success", t =>
  shouldPassValidation(t, "testEnum3Success.ts", {
    fieldEnum: "foo"
  })
);

tape("test string-initialized enum failure 1", t =>
  shouldThrowError(t, "testEnum3Fail1.ts")
);

tape("test string-initialized enum failure 2", t =>
  shouldThrowError(t, "testEnum3Fail2.ts")
);

/**
 * @param {string} filename
 */
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

/**
 * @param {tape.Test} t
 * @param {string} filename
 * @param {{}} expectedParsedObj
 */
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

/**
 * @param {tape.Test} t
 * @param {string} filename
 */
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
