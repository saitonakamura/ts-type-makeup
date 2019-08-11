import { validate } from "superstruct-transformer";

type TestType = { [key: string]: number };

export const obj = validate<TestType>(
  JSON.parse('{ "field1": true, "field2": 321 }')
);
