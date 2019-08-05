import { validate } from "superstruct-transformer";

enum TestEnum {
  Foo = "foo",
  Bar = "bar",
  Xyzzy = "xyzzy"
}

type TestType = {
  fieldEnum: TestEnum;
};

export const obj = validate<TestType>(JSON.parse('{ "fieldEnum": 0 }'));
