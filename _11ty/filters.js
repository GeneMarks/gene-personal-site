import metadata from "../src/_data/metadata.js";
import { DateTime } from "luxon";

export default async function(config) {

    config.addFilter("exclude", (collection, stringToFilter) => {
        if (!stringToFilter) return collection;
        return (collection ?? []).filter(item => item !== stringToFilter);
    });

    config.addFilter("toIsoDateTime", (value) => {
        return DateTime.fromJSDate(value, { zone: metadata.timeZone });
    });

    config.addFilter("formatPostModifiedDate", (value) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: metadata.timeZone,
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
            timeZone: metadata.timeZone,
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(value)
          .replace(/ (\d{4})$/, ", $1");
    });

}
