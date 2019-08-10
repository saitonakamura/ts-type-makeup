import { validate } from "superstruct-transformer";

type TestType = { name: string | null };

export const obj = validate<TestType>(JSON.parse('{ "name": null }'));
