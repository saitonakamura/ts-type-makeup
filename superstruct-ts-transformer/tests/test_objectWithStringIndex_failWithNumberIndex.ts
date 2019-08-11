import { validate } from "superstruct-transformer";

type TestType = { [key: string]: number };

export const obj = validate<TestType>(JSON.parse('{ "field1": 123, 0: 321 }'));
