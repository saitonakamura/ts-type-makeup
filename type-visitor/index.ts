import { Node, TypeChecker, Type, TypeFlags, SymbolFlags } from "typescript";

export type TypeModel =
  | TypeModelString
  | TypeModelBoolean
  | TypeModelNumber
  | TypeModelObject
  | TypeModelUnidentified
  | TypeModelAny
  | TypeModelUnknown
  | TypeModelEnum
  | TypeModelBigInt;

type MapWithIntersect<TOrig, TAdd> = TOrig extends any ? TOrig & TAdd : never;

export type TypeModelWithPropFields = MapWithIntersect<TypeModel, PropFields>;

export type PropFields = {
  name: string;
  optional: boolean;
};

export type TypeModelAny = {
  kind: "any";
};

export type TypeModelUnknown = {
  kind: "unknown";
};

export type TypeModelString = {
  kind: "string";
};

export type TypeModelNumber = {
  kind: "number";
};

export type TypeModelBoolean = {
  kind: "boolean";
};

export type TypeModelEnum = {
  kind: "enum";
  // TODO Any other info for enum
};

export type TypeModelBigInt = {
  kind: "bigint";
};

export type TypeModelStringLiteral = {
  kind: "stringLiteral";
  value: string;
};

export type TypeModelUnidentified = {
  kind: "unidentified";
};

export type TypeModelObject = {
  kind: "object";
  props: Array<TypeModelWithPropFields>;
};

export type TypeModelKinds = TypeModel["kind"];

export const typeVisitor = (checker: TypeChecker, type: Type): TypeModel => {
  if (type.flags & TypeFlags.Any) {
    return {
      kind: "any"
    };
  }

  if (type.flags & TypeFlags.Unknown) {
    return {
      kind: "unknown"
    };
  }

  if (type.flags & TypeFlags.Enum) {
    return {
      kind: "enum"
      // TODO any other info for enum
    };
  }

  if (type.flags & TypeFlags.BigInt) {
    return {
      kind: "bigint"
    };
  }

  if (type.flags & TypeFlags.BigInt) {
    return {
      kind: "bigint"
    };
  }

  if (type.flags & TypeFlags.Object) {
    const props = type.getProperties();
    const propsDescriptor = props.map(prop => ({
      name: prop.name,
      optional: !!(prop.flags & SymbolFlags.Optional),
      ...typeVisitor(
        checker,
        checker.getTypeOfSymbolAtLocation(prop, prop.valueDeclaration)
      )
    }));

    return {
      kind: "object",
      props: propsDescriptor
    };
  }

  if (type.flags & TypeFlags.String) {
    return {
      kind: "string"
    };
  }

  if (type.flags & TypeFlags.Boolean) {
    return {
      kind: "boolean"
    };
  }

  if (type.flags & TypeFlags.Number) {
    return {
      kind: "number"
    };
  }

  return {
    kind: "unidentified"
  };
};
