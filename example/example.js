"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var superstruct = require("superstruct");
exports.what = Array.isArray([1, 2, 3]);
exports.obj = validate_User(JSON.parse('{ "name": "Me", "alive": true }'));
exports.obj2 = validate_Passport(JSON.parse('{ "number": 123, "series": 321 }'));
function validate_User(jsonObj) {
    var validator = superstruct.struct({
        name: "string",
        alive: "boolean?",
        passport: {
            number: "string",
            series: "string",
            type: superstruct.struct.union(["string", "string"]),
            typeN: "number?"
        }
    });
    return validator(jsonObj);
}
function validate_Passport(jsonObj) {
    var validator = superstruct.struct({
        number: "string",
        series: "string",
        type: superstruct.struct.union(["string", "string"]),
        typeN: "number?"
    });
    return validator(jsonObj);
}
