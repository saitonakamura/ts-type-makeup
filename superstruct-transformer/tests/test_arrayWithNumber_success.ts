import { validate } from "superstruct-transformer";

type TestType = number[];

export const obj = validate<TestType>(JSON.parse("[123, 321]"));
