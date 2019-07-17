import superstruct from "superstruct";
export var obj = validate(JSON.parse('{ "name": "Me", "alive": true }'));
function validate(jsonObj) {
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
