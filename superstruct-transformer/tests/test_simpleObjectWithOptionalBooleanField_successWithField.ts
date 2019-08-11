import { validate } from "superstruct-transformer";

type TestType = { fieldBoolean?: boolean };

export const obj = validate<TestType>(JSON.parse('{ "fieldBoolean": true }'));
