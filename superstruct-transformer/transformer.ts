import ts from "typescript";
import { TypeModels, typeVisitor } from "type-visitor";

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

const createSuperStructValidator = (tuple: [TypeModels, string]) => {
  const [typeModel, functionName] = tuple;

  const superstructValidator = ts.createCall(
    /* expression */ ts.createIdentifier("struct"),
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

const sett = new Set<[TypeModels, string]>();

const createVisitor = (
  ctx: ts.TransformationContext,
  sf: ts.SourceFile,
  checker: ts.TypeChecker
) => {
  const visitor: ts.Visitor = (node: ts.Node) => {
    const pass = () => ts.visitEachChild(node, visitor, ctx);
    ts.nodeModuleNameResolver;
    if (ts.isSourceFile(node)) {
      const newFileNode = ts.visitEachChild(node, visitor, ctx);
      console.log(sett.size);
      const newValidators = Array.from(sett.values()).map(
        createSuperStructValidator
      );
      const fileNodeWithValidators = ts.updateSourceFileNode(newFileNode, [
        ...newFileNode.statements,
        ...newValidators
      ]);
      sett.clear();
      return fileNodeWithValidators;
    }

    if (ts.isCallExpression(node)) {
      if (!node.typeArguments || node.typeArguments.length < 1) {
        return node;
      }

      const type = checker.getTypeFromTypeNode(node.typeArguments[0]);
      const typeModel = typeVisitor(checker, node, type);
      let newNode: ts.CallExpression;

      if (ts.isPropertyAccessExpression(node.expression)) {
        newNode = ts.updateCall(
          /* node */ node,
          /* expression */ node.expression.name,
          /* typeArguments */ node.typeArguments,
          /* arguments */ node.arguments
        );
      } else {
        newNode = node;
      }

      if (ts.isIdentifier(newNode.expression)) {
        sett.add([typeModel, newNode.expression.text]);
      } else {
        console.warn("newNode.expression should be Identifier");
        sett.add([typeModel, "validate"]);
      }

      return newNode;
    }

    return pass();
  };

  return visitor;
};

export const createValidatorTransformer = (program: ts.Program) => (
  ctx: ts.TransformationContext
): ts.Transformer<ts.SourceFile> => (sf: ts.SourceFile) =>
  ts.visitNode(sf, createVisitor(ctx, sf, program.getTypeChecker()));
