import markdownItMark from "markdown-it-mark";

export default async function(config) {
    config.amendLibrary("md", (library) => library.use(markdownItMark));
}
