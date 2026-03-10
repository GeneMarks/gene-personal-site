import { createHighlighter } from "shiki";
import { transformerNotationDiff,
         transformerNotationHighlight,
         transformerRenderIndentGuides } from "@shikijs/transformers";

export default async function (config, options) {
    const { light, dark } = options.themes;

    const highlighter = await createHighlighter({
        langs : options.langs,
        themes: [light, dark],
    });

    config.amendLibrary("md", (library) => {
        library.set({
            highlight: (code, language) => {
                return highlighter.codeToHtml(code, {
                    lang: language,
                    themes: options.themes,
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
