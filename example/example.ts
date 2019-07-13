import * as sps from "../superstruct-transformer";

type User = {
  name: string;
  alive: boolean;
  passport: Passport;
};

type Passport = {
  number: string;
  series: string;
};

export const obj = sps.validate<User>(
  JSON.parse('{ "name": "Me", "alive": true }')
);
