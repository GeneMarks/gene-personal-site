import { execSync } from "node:child_process";
import { DateTime } from "luxon";
import metadata from "./src/_data/metadata.js";
import * as cheerio from "cheerio";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import shikiPlugin from "./plugins/shikiPlugin.js";
import footnotePlugin from "./plugins/footnotePlugin.js";
import anchorPlugin from "./plugins/anchorPlugin.js";
import attrsPlugin from "./plugins/attrsPlugin.js";
import markPlugin from "./plugins/markPlugin.js";
import tableWrapPlugin from "./plugins/tableWrapPlugin.js";

const buildDir = "dist";

export const config = {
      htmlTemplateEngine: "njk",
};

export default function(config) {
    // Directories
    config.setInputDirectory("src");
    config.setOutputDirectory(buildDir);

    // Passthroughs
    config.addPassthroughCopy("src/assets/**/*");
    config.addPassthroughCopy("src/uploads/**/*");
    config.addPassthroughCopy("src/favicon.jpg");
    config.addPassthroughCopy("src/public_key.asc");

    // Collections
    config.addCollection("postsByCreated", (collectionApi) =>
        collectionApi.getFilteredByTag("post")
                     .sort((a, b) => b.data.created - a.data.created));

    config.addCollection("tagList", (collectionApi) => {
        const filter = ["post"];
        const tagSet = new Set();

        collectionApi.getAll().forEach((item) => {
            (item.data.tags || []).forEach((tag) => {
                if (!filter.includes(tag)) {
                    tagSet.add(tag);
                }
            });
        });

        return [...tagSet].sort();
    });

    // Shortcodes
    config.addShortcode("year", () => `${new Date().getFullYear()}`);

    // Filters
    config.addFilter("exclude", (collection, stringToFilter) => {
        if (!stringToFilter) return collection;
        return (collection ?? []).filter(item => item !== stringToFilter);
    });

    config.addFilter("htmlDateTime", (value) => {
        return DateTime.fromJSDate(value);
    });

    config.addFilter("formatPostModifiedDate", (value) => {
        return new Intl.DateTimeFormat("en-US", {
            timeZone: "America/New_York",
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            timeZoneName: "short"
        }).format(value);
    });

    config.addFilter("formatPostCreatedDate", (value) => {
        return new Intl.DateTimeFormat("en-GB", {
            timeZone: "America/New_York",
            year: "numeric",
            month: "short",
            day: "2-digit",
        }).format(value)
          .replace(/ (\d{4})$/, ", $1");
    });

    // Transforms
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

    // Events
    config.on("eleventy.after", () => {
        execSync(`npx -y pagefind --site ${buildDir} --glob \"**/*.html\"`, { encoding: "utf-8" })
    });

    // Plugins
    config.addPlugin(attrsPlugin);
    config.addPlugin(anchorPlugin);
    config.addPlugin(footnotePlugin);
    config.addPlugin(markPlugin);
    config.addPlugin(tableWrapPlugin);

    config.addPlugin(shikiPlugin, {
        themes: {
            light: "gruvbox-light-hard",
            dark: "gruvbox-dark-hard",
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
