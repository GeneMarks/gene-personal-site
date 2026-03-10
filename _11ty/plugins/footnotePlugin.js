import markdownItFootnote from "markdown-it-footnote";

export default async function(config) {
    config.amendLibrary("md", (library) => library.use(markdownItFootnote));
}
