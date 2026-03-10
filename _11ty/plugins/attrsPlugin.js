import markdownItAttrs from "markdown-it-attrs";

export default async function(config) {
    config.amendLibrary("md", (library) => library.use(markdownItAttrs));
}
