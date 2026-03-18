import { DateTime } from "luxon";

export function asLuxonUTC(value) {
    if (!value) return null;

    let dateTime;

    if (DateTime.isDateTime(value)) {
        dateTime = value;
    } else if (value instanceof Date) {
        dateTime = DateTime.fromJSDate(value);
    } else if (typeof(value) === "string") {
        dateTime = DateTime.fromFormat(value, "yyyy-MM-dd hh:mm:ss z");
    }

    return dateTime ? dateTime.toUTC() : null;
}
