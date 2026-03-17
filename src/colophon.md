---
title: Colophon
created: 2026-03-07T00:00:00-05:00
layout: layouts/post.html
---

As time goes on, this site continues to grow, shrink, and evolve (and hopefully not devolve). This page will stay updated as the de facto window into the technical and philosophical components that make up the blog.

### Basic Information

| Component | Link |
|-----------|------|
| Source Code | [{{ metadata.sourceUrl }}]({{ metadata.sourceUrl }}) |
| SSG | [Eleventy](https://www.11ty.dev/) [^2] |
| CSS Framework | [Tailwind CSS](https://tailwindcss.com/) |
| Hosting | <a href="https://www.digitalocean.com/" title="DigitalOcean (Not a referral link)"><img src="/uploads/digitalocean.svg" alt="DigitalOcean" class="max-w-28 m-0!"></a> |
| Server OS | [Debian 13 "trixie"](https://www.debian.org/) |
| Syntax Highlighting | [Shiki](https://shiki.style/) |
| Diagramming | [Mermaid](https://github.com/mermaid-js/mermaid-cli) |
| Search | [Pagefind](https://pagefind.app/) |
| Comments | [Isso](https://isso-comments.de/) [^1] |
| Web Analytics | [GoatCounter](https://www.goatcounter.com/) [^1] |
| Licensing | [Written content licensed under CC BY-NC-SA 4.0; Source code licensed under MIT]({{ metadata.sourceUrl }}/blob/main/LICENSE) |

### Privacy
Privacy and transparency are at the forefront of my mind while developing this site. When you use this site, you may come into contact with:

- 1 `localStorage` entry for saving your theme preference (if you click the button)
- 3 `localStorage` entries for saving your commenting information (if you comment)
- 1 `cookie` that lasts a few minutes after commenting to determine if you can still edit/delete

Here is a more detailed look at each:

<div class="table-wrapper">
<table class="min-w-180">
<thead>
<tr>
<th>Type</th>
<th>Entry</th>
<th>Value</th>
<th>Description</th>
<th>Lifetime</th>
</tr>
</thead>
<tbody>
<tr>
<td>localStorage</td>
<td>theme</td>
<td>(light|dark)</td>
<td>Set if you explicitly change the site theme by the button in the header</td>
<td>∞</td>
</tr>
<tr>
<td>localStorage</td>
<td>isso-author</td>
<td>&lt;username&gt;</td>
<td>Set if you submit a comment with the <code>Name</code> field filled out</td>
<td>∞</td>
</tr>
<tr>
<td>localStorage</td>
<td>isso-email</td>
<td>&lt;email address&gt;</td>
<td>Set if you submit a comment with the <em>optional</em> <code>Email</code> field filled out</td>
<td>∞</td>
</tr>
<tr>
<td>localStorage</td>
<td>isso-website</td>
<td>&lt;website&gt;</td>
<td>Set if you submit a comment with the <em>optional</em> <code>Website</code> field filled out</td>
<td>∞</td>
</tr>
<tr>
<td>cookie</td>
<td>isso-&lt;comment #&gt;</td>
<td>&lt;hash&gt;</td>
<td>Set when you submit a comment to determine if you can still edit/delete it</td>
<td>&lt;30min</td>
</tr>
</tbody>
</table>
</div>

If you choose not to use these features, these entries won't affect you.

I **do not** use any first-party or third-party tracking on this site. For basic, anonymized web analytics, I use a self-hosted service that you can read more about [below](#web-analytics).

### Services
Self-hosting is very important to me. Every service that my site uses (e.g. commenting, analytics) is run on my own headless Debian server. I am firm in keeping this site's technologies local.

#### Comments
This site uses [Isso](https://isso-comments.de/) with fully custom css. I've also implemented minimizing/maximizing comment chain functionality like on Reddit.

I know the site would be lighter without them... but as someone who's been on forums since the early 00's I just like them too much.

#### Web Analytics {#web-analytics}
This server hosts an instance of [GoatCounter](https://www.goatcounter.com/) that you can check out at [{{ metadata.goatCounterHost }}](https://{{ metadata.goatCounterHost }}/). I chose GoatCounter because it is lean and respectful to site users' privacy.

> GoatCounter doesn’t store IP addresses, the full User-Agent header, or any tracker ID. It also doesn’t store any information in the browser with cookies, localStorage, cache, or any other method.
> <cite>[GoatCounter Privacy Policy](https://www.goatcounter.com/help/privacy)</cite>

### Design Ideology
I burn through different design phases more often than I'd like to admit. While you might see the site change every once in a while, I hold a few persistent values that aren't going anywhere.

#### Simplicity
The site should be as simple and intuitive as possible. The site is merely a way to present the data to the user in an easily-digestible fashion. I won't use web fonts, icon sets, or animation libraries.

#### Usability
Don't get me wrong, I love wacky or "themed" websites. I grew up on sites like Nitrome and spent countless hours surfing the web via badge clicks. But after being indecisive on this site's layouts and theming, I now target the user experience first.

The site should be made of simple, left-to-right top-to-bottom pages with elements rooted in the original design of the web that users are familiar with.

#### Accessibility
Approaching web development from an accessibility standpoint is admittedly not something I had even considered for the majority of my time on the internet. Now, making my work accessible is an ongoing learning experience that I remain committed to. I will strive to keep up with best practices and gladly update the site with improvements for users with disabilities.

### AI
This site does not use any generative AI. The source code and articles are always written and reviewed by {{ metadata.authorName }}.

### Contact
If you have any questions at all, feel free to drop me a line at [{{ metadata.authorEmail }}](mailto:{{ metadata.authorEmail }}).

[^1]: This service is self-hosted.
[^2]: I'm not sure what the future holds for 11ty as my go-to SSG. They've recently launched a Kickstarter regarding a rebrand/reshaping that I honestly hold quite skeptical first impressions of. We'll see what happens.
