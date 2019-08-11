import { validate } from "superstruct-transformer";

type TestType = { fieldNumber: number | null };

export const obj = validate<TestType>(JSON.parse('{ "fieldNumber": 123 }'));
