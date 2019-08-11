import ts from "typescript";
import { createValidatorTransformer } from "superstruct-transformer/transformer";

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  let program = ts.createProgram(fileNames, options);

  program.emit(undefined, undefined, undefined, undefined, {
    before: [createValidatorTransformer(program)]
  });
}

compile(["./example/example.ts"], {
  noEmitOnError: false,
  noImplicitAny: true,
  strictNullChecks: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
});
