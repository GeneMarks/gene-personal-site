export const config = {
      htmlTemplateEngine: "njk",
};

export default function(config) {
    // Directories
    config.setInputDirectory("src");
    config.setOutputDirectory("dist");

    // Passthroughs
    config.addPassthroughCopy("src/assets/fonts/**/*");
    config.addPassthroughCopy("src/assets/images/**/*");
    config.addPassthroughCopy("src/assets/js/**/*");

    // Filters
    config.addFilter("formatBuildDate", (value) => {
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
};
