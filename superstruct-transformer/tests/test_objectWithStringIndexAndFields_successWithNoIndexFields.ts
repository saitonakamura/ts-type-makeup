import { validate } from "superstruct-transformer";

type TestType = { fieldNumber: number; [key: string]: number };

export const obj = validate<TestType>(JSON.parse('{ "fieldNumber": 123 }'));
