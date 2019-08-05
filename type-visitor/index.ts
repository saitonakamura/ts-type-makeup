import {
  TypeChecker,
  Type,
  TypeFlags,
  SymbolFlags,
  BigIntLiteralType,
  PseudoBigInt
} from "typescript";

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
  | TypeModelNull
  | TypeModelNever
  | TypeModelTypeParameter
  | TypeModelUnion
  | TypeModelIntersection
  | TypeModelIndex
  | TypeModelIndexedAccess
  | TypeModelConditional
  | TypeModelSubstitution
  | TypeModelNonPrimitive;

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
  readonly values: TypeModel[];
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
  readonly values: TypeModel[];
}

export interface TypeModelBigIntLiteral {
  readonly kind: "bigintLiteral";
  readonly value: PseudoBigInt;
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

export interface TypeModelNever {
  readonly kind: "never";
}

export interface TypeModelTypeParameter {
  readonly kind: "typeParameter";
}

export interface TypeModelUnion {
  readonly kind: "union";
  readonly types: TypeModel[];
}

export interface TypeModelIntersection {
  readonly kind: "intersection";
  readonly types: TypeModel[];
}

export interface TypeModelIndex {
  readonly kind: "index";
}

export interface TypeModelIndexedAccess {
  readonly kind: "indexedAccess";
}

export interface TypeModelConditional {
  readonly kind: "conditional";
}

export interface TypeModelSubstitution {
  readonly kind: "substitution";
}

export interface TypeModelNonPrimitive {
  readonly kind: "nonPrimitive";
}

export interface TypeModelUnidentified {
  readonly kind: "unidentified";
}

export interface TypeModelObject {
  readonly kind: "object";
  readonly props: Array<TypeModelWithPropFields>;
}

export type TypeModelKinds = TypeModel["kind"];

function isBigIntLiteral(type: Type): type is BigIntLiteralType {
  return !!(type.flags & TypeFlags.BigIntLiteral);
}

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

  if (type.flags & TypeFlags.EnumLiteral && type.isUnion()) {
    return {
      kind: "enumLiteral",
      values: type.types.map(t => typeVisitor(checker, t))
    };
  }

  if (isBigIntLiteral(type)) {
    return {
      kind: "bigintLiteral",
      value: type.value
    };
  }

  if (type.flags & TypeFlags.String || type.flags & TypeFlags.StringLike) {
    return {
      kind: "string"
    };
  }

  if (type.flags & TypeFlags.Boolean || type.flags & TypeFlags.BooleanLike) {
    return {
      kind: "boolean"
    };
  }

  if (type.flags & TypeFlags.Number || type.flags & TypeFlags.NumberLike) {
    return {
      kind: "number"
    };
  }

  if (
    (type.flags & TypeFlags.Enum || type.flags & TypeFlags.EnumLike) &&
    type.isUnion()
  ) {
    return {
      kind: "enum",
      values: type.types.map(t => typeVisitor(checker, t))
    };
  }

  if (type.flags & TypeFlags.BigInt || type.flags & TypeFlags.BigIntLike) {
    return {
      kind: "bigint"
    };
  }

  if (type.flags & TypeFlags.ESSymbol || type.flags & TypeFlags.ESSymbolLike) {
    return {
      kind: "esSymbol"
    };
  }

  if (type.flags & TypeFlags.UniqueESSymbol) {
    return {
      kind: "uniqueEsSymbol"
    };
  }

  if (type.flags & TypeFlags.Void || type.flags & TypeFlags.VoidLike) {
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

  if (type.flags & TypeFlags.Never) {
    return {
      kind: "never"
    };
  }

  if (type.flags & TypeFlags.TypeParameter) {
    return {
      kind: "typeParameter"
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

  if (type.isUnion()) {
    return {
      kind: "union",
      types: type.types.map(t => typeVisitor(checker, t))
    };
  }

  if (type.isIntersection()) {
    return {
      kind: "intersection",
      types: type.types.map(t => typeVisitor(checker, t))
    };
  }

  if (type.flags & TypeFlags.Index) {
    return {
      kind: "index"
    };
  }

  if (type.flags & TypeFlags.IndexedAccess) {
    return {
      kind: "indexedAccess"
    };
  }

  if (type.flags & TypeFlags.Conditional) {
    return {
      kind: "conditional"
    };
  }

  if (type.flags & TypeFlags.Substitution) {
    return {
      kind: "substitution"
    };
  }

  if (type.flags & TypeFlags.NonPrimitive) {
    return {
      kind: "nonPrimitive"
    };
  }

  return {
    kind: "unidentified"
  };
};
