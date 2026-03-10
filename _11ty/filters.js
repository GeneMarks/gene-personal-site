import { DateTime } from "luxon";

export default async function(config) {

    config.addFilter("exclude", (collection, stringToFilter) => {
        if (!stringToFilter) return collection;
        return (collection ?? []).filter(item => item !== stringToFilter);
    });

    config.addFilter("htmlDateTime", (value) => {
        return DateTime.fromJSDate(value);
    });

    config.addFilter("formatPostModifiedDate", (value) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short"
        }).format(value);
    });

    config.addFilter("formatPostCreatedDate", (value) => {
        return new Intl.DateTimeFormat("en-GB", {
            timeZone: "America/New_York",
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(value)
          .replace(/ (\d{4})$/, ", $1");
    });

}
