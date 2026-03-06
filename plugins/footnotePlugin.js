import footnote_plugin from "markdown-it-footnote";

export default async function(config) {
    config.amendLibrary("md", (library) => library.use(footnote_plugin));
}
