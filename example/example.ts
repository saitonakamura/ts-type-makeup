import { validate } from "superstruct-transformer";

type User = {
  name: string;
  alive: boolean;
  passport: Passport;
};

type Passport = {
  number: string;
  series: string;
};

export const obj = validate<User>(
  JSON.parse('{ "name": "Me", "alive": true }')
);

// export const obj2 = validate<Passport>(
//   JSON.parse('{ "name": "Me", "alive": true }')
// );
