import markdownItAnchor from "markdown-it-anchor";

export default async function(config) {
    config.amendLibrary("md", (library) => library.use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.linkAfterHeader({
            style: "visually-hidden",
            assistiveText: (title) => `Permalink to “${title}”`,
            visuallyHiddenClass: "hidden",
            wrapper: ['<div class="anchor-heading">', '</div>'],
            class: "anchor",
        }),
    }));
}
