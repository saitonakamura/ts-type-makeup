import { validate } from "superstruct-transformer";

type TestType = { fieldNumber: number; [key: string]: number };

export const obj = validate<TestType>(
  JSON.parse('{ "fieldNumber": "str", "field1": 123, "field2": 321 }')
);
