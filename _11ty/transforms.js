import * as cheerio from "cheerio";

export default async function(config) {

    config.addTransform("updateLinks", (content, outputPath) => {
        if (!outputPath || !outputPath.endsWith(".html")) return content;

        const externalLinkSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" d="M6 1h5v5L8.86 3.85 4.7 8 4 7.3l4.15-4.16L6 1ZM2 3h2v1H2v6h6V8h1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"></path></svg>';
        const $ = cheerio.load(content);

        $('a[href^="http"]')
            .filter((_, a) => $(a).text().trim() != '')
            .each((_, a) => {
                const el = $(a);
                const text = el.text();

                el.empty().append(`<span>${text}</span>`);

                el.append(externalLinkSvg)
                   .addClass("external")
                   .attr("target", "_blank")
                   .attr("rel", "noopener");
            });

        return $.html();
    });

}
