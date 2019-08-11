import { validate } from "superstruct-transformer";

type TestType = [number, string];

export const obj = validate<TestType>(JSON.parse('[123, "testStr"]'));
