# Typescript type visitor

It's a function that takes a `ts.TypeChecker` and a `ts.Type` and traverses the type building easy-to-use `TypeModel`

```ts
const typeVisitor = (checker: TypeChecker, type: Type): TypeModel => {...}

export type TypeModel =
  | TypeModelString
  | TypeModelNumber
  | TypeModelUnion
  | ...

export interface TypeModelString {
  readonly kind: "string";
}

export interface TypeModelNumber {
  readonly kind: "number";
}

export interface TypeModelUnion {
  readonly kind: "union";
  readonly types: TypeModel[];
}

...
```

It's different from Typescript compiler API built-in model by the next properties

1. It has a `kind` field (`string`, `number`, `object`) which is string literal union so it allows you to do [exhaustive checks](https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html)
2. It simplifies the API itself, there's no methods, flags and this kind of stuff, only `kind` and additional data
3. It has a built-in special types, `array` and `tuple` namely, that is kinda tricky to detect using vanilla compiler API

Basically you want to use it along with a compiler API, just using it for the `ts.Type`, and using Typescript compiler API for everything else, e.g. emitting new code, analyzing AST etc.
