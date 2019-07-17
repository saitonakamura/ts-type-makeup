import ts from "typescript";
import { TypeModels, typeVisitor } from "type-visitor";

const flatten = <T>(arr: T[][]) =>
  arr.reduce((acc, curr) => [...acc, ...curr], []);

const createSuperStructValidatorObjectLiteral = (
  typeModel: TypeModels
): ts.ObjectLiteralExpression | ts.StringLiteral => {
  switch (typeModel.kind) {
    case "object":
      return ts.createObjectLiteral(
        /* properties */
        typeModel.props.map(prop =>
          ts.createPropertyAssignment(
            prop.name,
            createSuperStructValidatorObjectLiteral(prop)
          )
        ),
        /* mutiline */ true
      );
    case "string":
      return ts.createStringLiteral("string");
    case "number":
      return ts.createStringLiteral("number");
    case "boolean":
      return ts.createStringLiteral("boolean");
    case "unidentified":
      return ts.createStringLiteral("string");
  }

  const _exhaustiveCheck: never = typeModel;
};

const createSuperStructValidator = (
  typeModel: TypeModels,
  functionName: string
) => {
  const superstructValidator = ts.createCall(
    /* expression */ ts.createPropertyAccess(
      ts.createIdentifier("superstruct"),
      "struct"
    ),
    /* typeParameters */ undefined,
    /* arguments */ [createSuperStructValidatorObjectLiteral(typeModel)]
  );

  const superstructValidatorVariable = ts.createVariableStatement(
    /* modifiers */ undefined,
    /* declarations */ [
      ts.createVariableDeclaration(
        /* name */ "validator",
        /* type */ undefined,
        /* initializer */ superstructValidator
      )
    ]
  );

  const validatorCall = ts.createCall(
    /* expression */ ts.createIdentifier("validator"),
    /* typeParameters */ undefined,
    /* arguments */ [ts.createIdentifier("jsonObj")]
  );

  const body = ts.createBlock(
    [superstructValidatorVariable, ts.createReturn(validatorCall)],
    /* multiline */ true
  );

  const asd = ts.createFunctionDeclaration(
    /* decorators */ undefined,
    /* modifiers */ undefined,
    /* asteriskToken */ undefined,
    /* name */ functionName,
    /* typeParameters */ undefined,
    /* parameters */ [
      ts.createParameter(
        undefined,
        undefined,
        undefined,
        "jsonObj",
        undefined,
        undefined,
        undefined
      )
    ],
    /* type */ undefined,
    /* body */ body
  );

  return asd;
  // return ts.createDebuggerStatement()
};

// const sett = new Set<[TypeModels, string]>();

const typeModels = new Map<ts.SourceFile, TypeModels[]>();
const importedFunctions = new Map<ts.SourceFile, string>();

const findImportedFunctionName = (
  importClause: ts.ImportClause,
  nameToSeek: string
) => {
  if (
    !!importClause.namedBindings &&
    ts.isNamedImports(importClause.namedBindings)
  ) {
    const renamedBinding = importClause.namedBindings.elements.find(
      x => !!x.propertyName && x.propertyName.text == nameToSeek
    );

    if (!!renamedBinding) {
      return renamedBinding.name.text;
    }

    const originalBinding = importClause.namedBindings.elements.find(
      x => x.name.text == nameToSeek
    );

    if (!!originalBinding) {
      return originalBinding.name.text;
    }

    return null;
  }
};

const createVisitor = (
  ctx: ts.TransformationContext,
  sf: ts.SourceFile,
  checker: ts.TypeChecker
) => {
  const visitor: ts.Visitor = (node: ts.Node) => {
    const pass = () => ts.visitEachChild(node, visitor, ctx);

    if (
      ts.isImportDeclaration(node) &&
      ts.isStringLiteral(node.moduleSpecifier) &&
      node.moduleSpecifier.text == "superstruct-transformer" &&
      !!node.importClause
    ) {
      const nameOfImportedFunction = findImportedFunctionName(
        node.importClause,
        "validate"
      );

      if (!!nameOfImportedFunction) {
        importedFunctions.set(node.getSourceFile(), nameOfImportedFunction);
      }

      // const superstructStructNamedImport = ts.createNamedImports([
      //   ts.createImportSpecifier(
      //     /* propertyName */ undefined,
      //     /* name */ ts.createIdentifier("struct")
      //   )
      // ]);

      const superstructStructImportClause = ts.createImportClause(
        /* name */ ts.createIdentifier("superstruct"),
        /* named bindings */ undefined
      );

      return ts.createImportDeclaration(
        /* decorators */ node.decorators,
        /* modifiers */ node.modifiers,
        /* import clause */ superstructStructImportClause,
        /* module specifier */ ts.createStringLiteral("superstruct")
      );
    }

    if (ts.isSourceFile(node)) {
      const newFileNode = ts.visitEachChild(node, visitor, ctx);

      const newValidators = flatten(
        Array.from(typeModels.entries())
          .filter(([sourceFile, _]) => importedFunctions.has(sourceFile))
          .map(([sourceFile, typeModels]) =>
            typeModels.map(typeModel =>
              createSuperStructValidator(
                typeModel,
                importedFunctions.get(sourceFile)!
              )
            )
          )
      );

      const fileNodeWithValidators = ts.updateSourceFileNode(newFileNode, [
        ...newFileNode.statements,
        ...newValidators
      ]);

      return fileNodeWithValidators;
    }

    if (ts.isCallExpression(node)) {
      if (!node.typeArguments || node.typeArguments.length < 1) {
        return node;
      }

      const type = checker.getTypeFromTypeNode(node.typeArguments[0]);
      const typeModel = typeVisitor(checker, node, type);

      const sourceFile = node.getSourceFile();
      if (typeModels.has(sourceFile)) {
        typeModels.set(sourceFile, [...typeModels.get(sourceFile)!, typeModel]);
      } else {
        typeModels.set(sourceFile, [typeModel]);
      }

      return ts.createCall(
        /* expression */ ts.createIdentifier("validate"),
        /* type argmuents */ undefined,
        /* arguments */ node.arguments
      );
    }

    return pass();
  };

  return visitor;
};

export const createValidatorTransformer = (program: ts.Program) => (
  ctx: ts.TransformationContext
): ts.Transformer<ts.SourceFile> => (sf: ts.SourceFile) =>
  ts.visitNode(sf, createVisitor(ctx, sf, program.getTypeChecker()));
