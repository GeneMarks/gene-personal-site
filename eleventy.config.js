import metadata from "./src/_data/metadata.js";
import * as cheerio from "cheerio";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import shikiPlugin from "./plugins/shikiPlugin.js";
import footnotePlugin from "./plugins/footnotePlugin.js";
import anchorPlugin from "./plugins/anchorPlugin.js";
import attrsPlugin from "./plugins/attrsPlugin.js";
import markPlugin from "./plugins/markPlugin.js";

export const config = {
      htmlTemplateEngine: "njk",
};

export default function(config) {
    // Directories
    config.setInputDirectory("src");
    config.setOutputDirectory("dist");

    // Passthroughs
    config.addPassthroughCopy("src/assets/**/*");
    config.addPassthroughCopy("src/uploads/**/*");
    config.addPassthroughCopy("src/favicon.jpg");
    config.addPassthroughCopy("src/public_key.asc");

    // Shortcodes
    config.addShortcode("year", () => `${new Date().getFullYear()}`);

    // Transforms
    config.addTransform("updateLinks", (content, outputPath) => {
        if (!outputPath || !outputPath.endsWith(".html")) return content;

        const externalLinkSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12"><path fill="currentColor" d="M6 1h5v5L8.86 3.85 4.7 8 4 7.3l4.15-4.16L6 1ZM2 3h2v1H2v6h6V8h1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z"></path></svg>';
        const $ = cheerio.load(content);

        $('a[href^="http"]')
            .filter((_, a) => $(a).text().trim() != '')
            .each((_, a) => {
                $(a)
                    .append(externalLinkSvg)
                    .addClass("external")
                    .attr("target", "_blank")
                    .attr("rel", "noopener");
            });

        return $.html();
    });

    // Filters
    config.addFilter("formatDetailedDateTime", (value) => {
        const formatted = new Intl.DateTimeFormat("en-US", {
            timeZone: "UTC",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short"
        }).format(value);

        return formatted;
    });

    config.addFilter("formatPostDate", (value) => {
        const formatted = new Intl.DateTimeFormat("en-GB", {
            timeZone: "UTC",
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(value);

        return formatted.replace(/ (\d{4})$/, ", $1");
    });

    // Plugins
    config.addPlugin(attrsPlugin);
    config.addPlugin(anchorPlugin);
    config.addPlugin(footnotePlugin);
    config.addPlugin(markPlugin);

    config.addPlugin(shikiPlugin, {
        themes: {
            light: "gruvbox-light-hard",
            dark: "houston",
        },
        langs: ["asm", "bat", "c", "cmake", "cpp", "csharp", "css", "diff", "docker", "fsharp", "go", "html", "http", "ini", "java", "javascript", "json", "jsonc", "log", "lua", "make", "markdown", "nginx", "php", "powershell", "python", "regexp", "rust", "shellscript", "sql", "ssh-config", "toml", "typescript", "xml", "yaml"],
    });

    config.addPlugin(feedPlugin, {
        type: "atom",
        outputPath: "/feed.xml",
        collection: {
            name: "post",
            limit: 10, // 0 for no limit
        },
        metadata: {
            language: "en",
            title: metadata.siteName,
            subtitle: metadata.siteDesc,
            base: metadata.url,
            author: {
                name: metadata.authorName,
                email: metadata.authorEmail,
            }
        }
    });
};
