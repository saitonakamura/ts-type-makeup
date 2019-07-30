import superstruct from "superstruct";
export var what = Array.isArray([1, 2, 3]);
export var obj = validate_User(JSON.parse('{ "name": "Me", "alive": true }'));
export var obj2 = validate_Passport(JSON.parse('{ "number": 123, "series": 321 }'));
function validate_User(jsonObj) {
    var validator = superstruct.struct({
        name: "string",
        alive: "boolean?",
        passport: superstruct.struct.optional({
            number: "string",
            series: "string",
            type: superstruct.struct.literal("type-literal"),
            typeN: superstruct.struct.literal(123)
        })
    });
    return validator(jsonObj);
}
function validate_Passport(jsonObj) {
    var validator = superstruct.struct({
        number: "string",
        series: "string",
        type: superstruct.struct.literal("type-literal"),
        typeN: superstruct.struct.literal(123)
    });
    return validator(jsonObj);
}
