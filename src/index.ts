import ts, { SourceFile, updateNew } from "typescript";

type TypeModels =
  | TypeModelString
  | TypeModelBoolean
  | TypeModelNumber
  | TypeModelObject
  | TypeModelUnidentified;

type TypeModelsWithName =
  | TypeModelString & WithName
  | TypeModelBoolean & WithName
  | TypeModelNumber & WithName
  | TypeModelObject & WithName
  | TypeModelUnidentified & WithName;

type WithName = {
  name: string;
};

type TypeModelString = {
  kind: "string";
};

type TypeModelBoolean = {
  kind: "boolean";
};

type TypeModelNumber = {
  kind: "number";
};

type TypeModelUnidentified = {
  kind: "unidentified";
};

type TypeModelObject = {
  kind: "object";
  props: Array<TypeModelsWithName>;
};

type TypeModelKinds = TypeModels["kind"];

const typeVisitor = (
  checker: ts.TypeChecker,
  node: ts.Node,
  type: ts.Type
): TypeModels => {
  if (type.flags & ts.TypeFlags.Object) {
    const props = type.getProperties();
    const propsDescriptor = props.map(prop => ({
      name: prop.name,
      ...typeVisitor(
        checker,
        node,
        checker.getTypeOfSymbolAtLocation(prop, node)
      )
    }));

    return {
      kind: "object",
      props: propsDescriptor
    };
  }

  if (type.flags & ts.TypeFlags.String) {
    return {
      kind: "string"
    };
  }

  if (type.flags & ts.TypeFlags.Boolean) {
    return {
      kind: "boolean"
    };
  }

  return {
    kind: "unidentified"
  };
};

const sett = new Set<TypeModels>();

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
};

const createSuperStructValidator = (typeModel: TypeModels) => {
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
    /* name */ "validate",
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

const createVisitor = (
  ctx: ts.TransformationContext,
  sf: ts.SourceFile,
  checker: ts.TypeChecker
) => {
  const visitor: ts.Visitor = (node: ts.Node) => {
    const pass = () => ts.visitEachChild(node, visitor, ctx);
    // if (ts.isVariableStatement(node)) {
    //   console.log('AAA')
    //   return [node, node]
    // }

    if (ts.isSourceFile(node)) {
      const newFileNode = pass() as SourceFile;
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

    // if (counter++ == 0)

    if (!ts.isCallExpression(node)) {
      return pass();
    }

    if (!node.typeArguments || node.typeArguments.length < 1) {
      return node;
    }

    const type = checker.getTypeFromTypeNode(node.typeArguments[0]);
    // console.log(checker.typeToString(type));
    const typeModel = typeVisitor(checker, node, type);
    sett.add(typeModel);
    // console.log(JSON.stringify(typeModel, undefined, "  "));

    return node;
  };

  return visitor;
};

function compile(fileNames: string[], options: ts.CompilerOptions): void {
  let program = ts.createProgram(fileNames, options);
  let checker = program.getTypeChecker();

  program.emit(undefined, undefined, undefined, undefined, {
    before: [createTrans(checker)]
  });
}

const createTrans = (checker: ts.TypeChecker) => (
  ctx: ts.TransformationContext
): ts.Transformer<ts.SourceFile> => (sf: ts.SourceFile) =>
  ts.visitNode(sf, createVisitor(ctx, sf, checker));

compile(["./example/example.ts"], {
  noEmitOnError: false,
  noImplicitAny: true,
  target: ts.ScriptTarget.ES5,
  module: ts.ModuleKind.CommonJS
});
