# Typescript makeup aka Compile-time type-based emitters

<img src="/logo.svg" align="right"
     alt="Blue lipstick with a TS on it" height="180">

The idea of the project is that since we don't have an access to typescript types in the runtime (they're a subject to a type erasure), we can still emit some code to the runtime on compilation step. So this repository purpose is to

1. Brigde the gap between the idea and implementation by providing several helpers, such as `ts-type-visitor`, more on that later
2. Provide some ready-made libraries, such as `superstruct-ts-transformer` which a json validation library

## Superstruct transformer

[Superstruct transformer Docs](/superstruct-ts-transformer#readme)

It's a typescript transformer that will transforms `validate<MyType>(JSON.parse("{}"))` calls to an actual `superstruct` json validator

You write that code

```typescript
import { validate } from "superstruct-ts-transformer";

type User = {
  name: string;
  alive: boolean;
};

const obj = validate<User>(JSON.parse('{ "name": "Me", "alive": true }'));
```

and it will become

```js
import superstruct from "superstruct";
var obj = validate_User(JSON.parse('{ "name": "Me", "alive": true }'));

function validate_User(jsonObj) {
  var validator = superstruct.struct({
    name: "string",
    alive: "boolean"
  });
  return validator(jsonObj);
}
```

Looks cool, right? However it comes with a lot of limitations, take a look at the [docs](/superstruct-ts-transformer#readme)

## Type visitor

[Type visitor Docs](/ts-type-visitor#readme)

It's a visitor function for a type that gives you an easy-to-use (unlike typescript api) type tree. You can traverse it to either analyze it somehow or to emit someting to the runtime (e.g. json validation, react prop-types etc.). See [docs](/ts-type-visitor#readme) for more info.
