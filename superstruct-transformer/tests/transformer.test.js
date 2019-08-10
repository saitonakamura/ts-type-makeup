const tape = require("tape");
const nodeEval = require("node-eval");
const ts = require("typescript");
const fs = require("fs");
const {
  createValidatorTransformer
} = require("superstruct-transformer/transformer");

tape("test simple object with string field success", t =>
  shouldPassValidation(t, "test_simpleObjectWithStringField_success.ts", {
    name: "Me"
  })
);

tape("test simple object with string field fail", t =>
  shouldThrowError(t, "test_simpleObjectWithStringField_fail.ts")
);

tape("test simple object with string, number and boolean fields success", t =>
  shouldPassValidation(
    t,
    "test_simpleObjectWithStringNumberBooleanFields_success.ts",
    {
      fieldStr: "test str",
      fieldNumber: 123,
      fieldBoolean: true
    }
  )
);

tape(
  "test simple object with string, number and boolean fields fail because of no string field",
  t =>
    shouldThrowError(
      t,
      "test_simpleObjectWithStringNumberBooleanFields_failString.ts"
    )
);

tape(
  "test simple object with string, number and boolean fields fail because of no number field",
  t =>
    shouldThrowError(
      t,
      "test_simpleObjectWithStringNumberBooleanFields_failNumber.ts"
    )
);

tape(
  "test simple object with string, number and boolean fields fail because of no boolean field",
  t =>
    shouldThrowError(
      t,
      "test_simpleObjectWithStringNumberBooleanFields_failBoolean.ts"
    )
);

tape(
  "test simple object with optional string field success with field present",
  t =>
    shouldPassValidation(
      t,
      "test_simpleObjectWithOptionalStringField_successWithField.ts",
      { name: "Me" }
    )
);

tape(
  "test simple object with optional string field success with field missing",
  t =>
    shouldPassValidation(
      t,
      "test_simpleObjectWithOptionalStringField_successWithoutField.ts",
      {}
    )
);

tape("test simple object with optional string field, fail with number", t =>
  shouldThrowError(
    t,
    "test_simpleObjectWithOptionalStringField_failWithNumber.ts"
  )
);

tape("test simple object with string or null field, success with string", t =>
  shouldPassValidation(
    t,
    "test_simpleObjectWithStringOrNullField_successWithString.ts",
    { name: "Me" }
  )
);

tape("test simple object with string or null field, success with null", t =>
  shouldPassValidation(
    t,
    "test_simpleObjectWithStringOrNullField_successWithNull.ts",
    { name: null }
  )
);

tape(
  "test simple object with string or null field, fail with field missig",
  t =>
    shouldThrowError(
      t,
      "test_simpleObjectWithStringOrNullField_failWithFieldMissing.ts"
    )
);

tape(
  "test simple object with string field and non strict null checks, success with string",
  t =>
    shouldPassValidation(
      t,
      "test_simpleObjectWithStringFieldAndNonStrictNullChecks_successWithString.ts",
      { name: "Me" },
      false
    )
);

tape(
  "test simple object with string field and non strict null checks, success with null",
  t =>
    shouldPassValidation(
      t,
      "test_simpleObjectWithStringFieldAndNonStrictNullChecks_successWithNull.ts",
      { name: null },
      false
    )
);

tape(
  "test simple object with string field and non strict null checks, fail with field missing",
  t =>
    shouldThrowError(
      t,
      "test_simpleObjectWithStringFieldAndNonStrictNullChecks_failWithMissingField.ts",
      false
    )
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
 * @param {boolean} strictNullChecks
 */
const compile = (filename, strictNullChecks = true) => {
  const compilerOptions = {
    target: ts.ScriptTarget.ES2015,
    module: ts.ModuleKind.CommonJS,
    strictNullChecks: strictNullChecks
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
 * @param {boolean} strictNullChecks
 */
function shouldPassValidation(
  t,
  filename,
  expectedParsedObj,
  strictNullChecks
) {
  t.plan(1);

  const compiledTsWithTransform = compile(
    __dirname + "/" + filename,
    strictNullChecks
  );
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
 * @param {boolean} strictNullChecks
 */
function shouldThrowError(t, filename, strictNullChecks) {
  t.plan(1);

  const compiledTsWithTransform = compile(
    __dirname + "/" + filename,
    strictNullChecks
  );
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
