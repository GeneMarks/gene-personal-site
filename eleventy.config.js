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
};
