import { validate } from "superstruct-ts-transformer";

type User = {
  name: string;
  alive?: boolean;
  passport: Passport;
};

type Passport = {
  number: string;
  series: string;
  type: "russian" | "foreign";
  typeN?: 123;
};

export const what = Array.isArray([1, 2, 3]);

export const obj = validate<User>(
  JSON.parse('{ "name": "Me", "alive": true }')
);

export const obj2 = validate<Passport>(
  JSON.parse('{ "number": 123, "series": 321 }')
);
