import metadata from "./src/_data/metadata.js";
import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import shikiPlugin from "./plugins/shikiPlugin.js";
import footnotePlugin from "./plugins/footnotePlugin.js";
import anchorPlugin from "./plugins/anchorPlugin.js";

export const config = {
      htmlTemplateEngine: "njk",
};

export default function(config) {
    // Directories
    config.setInputDirectory("src");
    config.setOutputDirectory("dist");

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

    // Passthroughs
    config.addPassthroughCopy("src/assets/**/*");
    config.addPassthroughCopy("src/uploads/**/*");
    config.addPassthroughCopy("src/favicon.jpg");
    config.addPassthroughCopy("src/public_key.asc");

    // Plugins
    config.addPlugin(anchorPlugin);
    config.addPlugin(footnotePlugin);

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

    config.addPlugin(shikiPlugin, {
        themes: {
            light: "gruvbox-light-hard",
            dark: "dark-plus",
        },
        langs: ["asm", "bat", "c", "cmake", "cpp", "csharp", "css", "diff", "docker", "fsharp", "go", "html", "http", "ini", "java", "javascript", "json", "jsonc", "log", "lua", "make", "markdown", "nginx", "php", "powershell", "python", "regexp", "rust", "shellscript", "sql", "ssh-config", "toml", "typescript", "xml", "yaml"],
    });

    // Shortcodes
    config.addShortcode("year", () => `${new Date().getFullYear()}`);
};
