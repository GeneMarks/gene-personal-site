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
    config.addFilter("printDate", (value) => {
        const formatted = new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            timeZoneName: "short"
        }).format(value);

        return formatted;
    });
};
