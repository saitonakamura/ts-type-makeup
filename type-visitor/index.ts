import { Node, TypeChecker, Type, TypeFlags } from "typescript";

export type TypeModels =
  | TypeModelString
  | TypeModelBoolean
  | TypeModelNumber
  | TypeModelObject
  | TypeModelUnidentified;

export type TypeModelsWithName =
  | TypeModelString & WithName
  | TypeModelBoolean & WithName
  | TypeModelNumber & WithName
  | TypeModelObject & WithName
  | TypeModelUnidentified & WithName;

export type WithName = {
  name: string;
};

export type TypeModelString = {
  kind: "string";
};

export type TypeModelBoolean = {
  kind: "boolean";
};

export type TypeModelNumber = {
  kind: "number";
};

export type TypeModelUnidentified = {
  kind: "unidentified";
};

export type TypeModelObject = {
  kind: "object";
  props: Array<TypeModelsWithName>;
};

export type TypeModelKinds = TypeModels["kind"];

export const typeVisitor = (
  checker: TypeChecker,
  node: Node,
  type: Type
): TypeModels => {
  if (type.flags & TypeFlags.Object) {
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

  return {
    kind: "unidentified"
  };
};
