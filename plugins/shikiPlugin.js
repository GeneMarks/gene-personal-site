import { createHighlighter } from "shiki";
import { transformerNotationDiff,
         transformerNotationHighlight,
         transformerRenderIndentGuides } from "@shikijs/transformers";

export default async function (config, options) {
    const highlighter = await createHighlighter(options);

    config.amendLibrary("md", (library) => {
        library.set({
            highlight: (code, language) => {
                return highlighter.codeToHtml(code, {
                    lang: language,
                    theme: options.theme,
                    transformers: [
                        transformerNotationDiff(),
                        transformerNotationHighlight(),
                        transformerRenderIndentGuides(),
                    ],
                });
            },
        });
    });
}
