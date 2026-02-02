A simple responsive blog made using 11ty and Tailwind CSS.

The current design is heavily inspired by Windows 95, though every once in a while I'll get an urge to change it. In which case I'll use a new branch.

## Development
1. Clone the repo.
2. Navigate to local repo folder and execute `npm install`.
3. Start the 11ty development server by using `npm run dev`. The command also uses `tailwindcss-cli` to watch css.

## Deployment
I deploy the site via the included Dockerfile, which builds and serves the site using [Static Web Server](https://static-web-server.net/) with the included `sws.toml` config file.

You can also build the site manually using `npm run build` and serve it with your web server of choice.

## Contributing
Feel free to create a PR if you spot a spelling mistake or believe I've made a factual error in a blog post.

## Licensing
This repository contains two distinct categories of material that are licensed separately as described in the provided LICENSE file.