import { validate } from "superstruct-transformer";

type TestType = { fieldNumber?: number };

export const obj = validate<TestType>(JSON.parse("{}"));
