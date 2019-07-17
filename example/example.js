import superstruct from "superstruct";
export var what = Array.isArray([1, 2, 3]);
export var obj = validate_User(JSON.parse('{ "name": "Me", "alive": true }'));
export var obj2 = validate_Passport(JSON.parse('{ "number": 123, "series": 321 }'));
function validate_User(jsonObj) {
    var validator = superstruct.struct({
        name: "string",
        alive: "boolean",
        passport: {
            number: "string",
            series: "string"
        }
    });
    return validator(jsonObj);
}
function validate_Passport(jsonObj) {
    var validator = superstruct.struct({
        number: "string",
        series: "string"
    });
    return validator(jsonObj);
}
