import { validate } from "superstruct-transformer";

type TestType = { name?: string };

export const obj = validate<TestType>(JSON.parse('{ "name": "Me" }'));
