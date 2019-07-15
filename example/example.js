"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var superstruct_transformer_1 = require("superstruct-transformer");
exports.obj = superstruct_transformer_1.validate(JSON.parse('{ "name": "Me", "alive": true }'));
function validate(jsonObj) {
    var validator = struct({
        name: "string",
        alive: "boolean",
        passport: {
            number: "string",
            series: "string"
        }
    });
    return validator(jsonObj);
}
