import { validate } from "superstruct-transformer";

type TestType = { fieldChild: TestChildType };

type TestChildType = { fieldNumber: number };

export const obj = validate<TestType>(JSON.parse('{ "fieldChild": null }'));
