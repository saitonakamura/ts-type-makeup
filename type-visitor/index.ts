import { TypeChecker, Type, TypeFlags, SymbolFlags } from "typescript";

export type TypeModel =
  | TypeModelString
  | TypeModelBoolean
  | TypeModelNumber
  | TypeModelObject
  | TypeModelUnidentified
  | TypeModelAny
  | TypeModelUnknown
  | TypeModelEnum
  | TypeModelBigInt
  | TypeModelStringLiteral
  | TypeModelNumberLiteral
  | TypeModelBooleanLiteral
  | TypeModelEnumLiteral
  | TypeModelBigIntLiteral
  | TypeModelESSymbol
  | TypeModelUniqueESSymbol
  | TypeModelVoid
  | TypeModelUndefined
  | TypeModelNull;

type MapWithIntersect<TOrig, TAdd> = TOrig extends any ? TOrig & TAdd : never;

export type TypeModelWithPropFields = MapWithIntersect<TypeModel, PropFields>;

export interface PropFields {
  readonly name: string;
  readonly optional: boolean;
}

export interface TypeModelAny {
  readonly kind: "any";
}

export interface TypeModelUnknown {
  readonly kind: "unknown";
}

export interface TypeModelString {
  readonly kind: "string";
}

export interface TypeModelNumber {
  readonly kind: "number";
}

export interface TypeModelBoolean {
  readonly kind: "boolean";
}

export interface TypeModelEnum {
  readonly kind: "enum";
  // TODO Any other info for enum
}

export interface TypeModelBigInt {
  readonly kind: "bigint";
}

export interface TypeModelStringLiteral {
  readonly kind: "stringLiteral";
  readonly value: string;
}

export interface TypeModelNumberLiteral {
  readonly kind: "numberLiteral";
  readonly value: number;
}

export interface TypeModelBooleanLiteral {
  readonly kind: "booleanLiteral";
  readonly value: boolean;
}

export interface TypeModelEnumLiteral {
  readonly kind: "enumLiteral";
  readonly value: any; // TODO implement enum literal
}

export interface TypeModelBigIntLiteral {
  readonly kind: "bigintLiteral";
  readonly value: BigInt;
}

export interface TypeModelESSymbol {
  readonly kind: "esSymbol";
}

export interface TypeModelUniqueESSymbol {
  readonly kind: "uniqueEsSymbol";
}

export interface TypeModelVoid {
  readonly kind: "void";
}

export interface TypeModelUndefined {
  readonly kind: "undefined";
}

export interface TypeModelNull {
  readonly kind: "null";
}

export interface TypeModelUnidentified {
  readonly kind: "unidentified";
}

export interface TypeModelObject {
  readonly kind: "object";
  readonly props: Array<TypeModelWithPropFields>;
}

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

  if (type.isStringLiteral()) {
    return {
      kind: "stringLiteral",
      value: type.value
    };
  }

  if (type.isNumberLiteral()) {
    return {
      kind: "numberLiteral",
      value: type.value
    };
  }

  if (type.flags & TypeFlags.BooleanLiteral) {
    // TODO implement handle boolean literal
    throw new Error("implement handle boolean literal");
    // return {
    //   kind: "booleanLiteral",
    //   value: type.value
    // };
  }

  if (type.flags & TypeFlags.EnumLiteral) {
    // TODO implement handle enum literal
    throw new Error("implement handle enum literal");
    // return {
    //   kind: "enumLiteral",
    //   value: type.value
    // };
  }

  if (type.flags & TypeFlags.BigIntLiteral) {
    // TODO implement handle bigint literal
    throw new Error("implement handle bigint literal");
    // return {
    //   kind: "bigintLiteral",
    //   value: type.value
    // };
  }

  if (type.flags & TypeFlags.ESSymbol) {
    return {
      kind: "esSymbol"
    };
  }

  if (type.flags & TypeFlags.UniqueESSymbol) {
    return {
      kind: "uniqueEsSymbol"
    };
  }

  if (type.flags & TypeFlags.Void) {
    return {
      kind: "void"
    };
  }

  if (type.flags & TypeFlags.Undefined) {
    return {
      kind: "undefined"
    };
  }

  if (type.flags & TypeFlags.Null) {
    return {
      kind: "null"
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
