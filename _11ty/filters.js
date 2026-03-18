import { asLuxonUTC } from "./utils.js";

export default async function(config) {

    config.addFilter("exclude", (collection, stringToFilter) => {
        if (!stringToFilter) return collection;
        return (collection ?? []).filter(item => item !== stringToFilter);
    });

    config.addFilter("toIsoDateTime", (value) =>
        asLuxonUTC(value).toISO());

    config.addFilter("formatPostModifiedDate", (value) =>
        asLuxonUTC(value).toFormat("ccc, LLL dd, yyyy, hh:mm a ZZZZ"));

    config.addFilter("formatPostCreatedDate", (value) =>
        asLuxonUTC(value).toFormat("dd LLL, yyyy"));

}
