export const config = {
      htmlTemplateEngine: "njk",
};

export default function(config) {
    //Collections
    config.addCollection("sortedProjects", (collectionsApi) => {
        return collectionsApi.getFilteredByTag("projects").sort((a, b) =>
            a.data.priority - b.data.priority);
    });

    // Directories
    config.setInputDirectory("src");
    config.setOutputDirectory("dist");

    // Filters
    config.addFilter("formatDetailedDateTime", (value) => {
        const formatted = new Intl.DateTimeFormat("en-US", {
            timeZone: "UTC",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short"
        }).format(value);

        return formatted;
    });

    config.addFilter("formatPostDate", (value) => {
        const formatted = new Intl.DateTimeFormat("en-US", {
            timeZone: "UTC",
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "2-digit",
        }).format(value);

        return formatted;
    });

    // Global data
    config.addGlobalData("build", new Date());

    // Passthroughs
    config.addPassthroughCopy("src/assets/**/*");
    config.addPassthroughCopy("src/public_key.asc");
    config.addPassthroughCopy("src/favicon.jpg");

    // Plugins

    // Shortcodes
    config.addShortcode("year", () => `${new Date().getFullYear()}`);
};
