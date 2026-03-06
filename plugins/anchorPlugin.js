import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";

export default async function(config) {
    let library = markdownIt().use(markdownItAnchor, {
        permalink: markdownItAnchor.permalink.linkAfterHeader({
            style: "visually-hidden",
            assistiveText: (title) => `Permalink to “${title}”`,
            visuallyHiddenClass: "hidden",
            wrapper: ['<div class="anchor-heading">', '</div>'],
            class: "anchor",
        }),
    });

    config.setLibrary("md", library);
}
