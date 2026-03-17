import metadata from "./src/_data/metadata.js";

import collections from "./_11ty/collections.js";
import filters from "./_11ty/filters.js";
import transforms from "./_11ty/transforms.js";
import events from "./_11ty/events.js";
import shortcodes from "./_11ty/shortcodes.js";

import { feedPlugin } from "@11ty/eleventy-plugin-rss";
import shikiPlugin from "./_11ty/plugins/shikiPlugin.js";
import footnotePlugin from "./_11ty/plugins/footnotePlugin.js";
import anchorPlugin from "./_11ty/plugins/anchorPlugin.js";
import attrsPlugin from "./_11ty/plugins/attrsPlugin.js";
import markPlugin from "./_11ty/plugins/markPlugin.js";
import tableWrapPlugin from "./_11ty/plugins/tableWrapPlugin.js";

const inputDir = "src";
const outputDir = "dist";

export const config = {
      htmlTemplateEngine: "njk",
};

export default function(config) {
    config.setInputDirectory(inputDir);
    config.setOutputDirectory(outputDir);

    config.ignores.add(`${inputDir}/_mermaid`);
    config.ignores.add(`${inputDir}/_tailwind`);

    config.addPassthroughCopy(`${inputDir}/assets/**/*`);
    config.addPassthroughCopy(`${inputDir}/uploads/**/*`);
    config.addPassthroughCopy(`${inputDir}/favicon.jpg`);
    config.addPassthroughCopy(`${inputDir}/public_key.asc`);

    config.addPlugin(collections);
    config.addPlugin(filters);
    config.addPlugin(transforms);
    config.addPlugin(shortcodes);
    config.addPlugin(events);

    config.addPlugin(attrsPlugin);
    config.addPlugin(anchorPlugin);
    config.addPlugin(footnotePlugin);
    config.addPlugin(markPlugin);
    config.addPlugin(tableWrapPlugin);

    config.addPlugin(shikiPlugin, {
        themes: {
            light: "light-plus",
            dark: "dark-plus",
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
