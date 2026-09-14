# Backend media checklist — `api.realestate.aajneeti.social`

Work for the Django/nginx side, arising from a Lighthouse audit of the frontend
on 14 Sep 2026 (mobile 60, desktop 69). The frontend fixes are done and
deployed separately; these four items are the remaining bottleneck and none of
them can be fixed from the frontend repo.

Ordered by payoff per hour of work.

All measurements below were re-verified against production on 14 Sep 2026.
Where they differ from the original audit, the live figure is given and the
discrepancy is called out — please re-measure from your own network before
sizing the work, since some of these numbers move a lot with location.

---

## 1. Add `Cache-Control` to `/media/` — smallest change, immediate win

`/media/` currently returns **no `Cache-Control` header at all**:

```
HTTP/1.1 200 OK
Server: nginx/1.24.0 (Ubuntu)
Content-Type: image/jpeg
Content-Length: 4473666
Last-Modified: Mon, 03 Aug 2026 08:50:58 GMT
ETag: "6a705672-444342"
Accept-Ranges: bytes
```

Without an explicit freshness lifetime, browsers fall back to heuristic caching
and revalidate far more often than they need to. Roughly 31 images per page view
hit this host, so that is 31 conditional round trips against a single origin
before anything renders.

Worth noting in your favour: the server **does** honour conditional requests —
`If-None-Match` correctly returns `304`. So this is a latency problem, not a
bandwidth one. That is also why it is cheap to fix.

```nginx
location /media/ {
    add_header Cache-Control "public, max-age=31536000, immutable";
}
```

**`immutable` is only safe once filenames are content-addressed.** If a file at a
given path can ever be replaced with different bytes, a one-year immutable cache
means some users never see the new version. Either:

- hash the content into the upload filename (see item 2, which you are touching
  anyway), or
- ship `public, max-age=2592000, stale-while-revalidate=604800` in the meantime.

The frontend took exactly this decision for its own static assets and chose the
30-day option, because those files are edited by hand. If your derivatives are
generated rather than hand-placed, content hashing is the better end state.

---

## 2. Stop serving original uploads — biggest single payload win

Django is storing and serving originals straight from the upload. Verified live:

| | |
|---|---|
| `cities/haridwar.jpg` | **6000 x 4000**, **4,473,666 bytes** |
| Rendered at | roughly 250px wide, as a thumbnail |

That is a 4.4 MB file delivered to paint a 250px box — about 24x more pixels in
each dimension than are used.

**Generate derivatives on upload and never serve the original.** Widths of
**320 / 640 / 960 / 1440** in WebP match what the frontend now requests for its
local images, so the two halves line up.

Suggested shape, using `sorl-thumbnail`, `django-imagekit` or a `post_save` hook
onto Pillow:

- store the original outside the public `/media/` root (it is an archival
  master, not a web asset)
- emit `<name>-<width>.webp` at each width, quality ~78
- never upscale — if the source is 900px wide, emit 320/640 and stop

A note on quality settings from doing the same job on the frontend side: q78
gave roughly 77% savings across a mixed set, but two heavily detailed
photographs barely moved. If a derivative comes out close to its source size,
the image is noisy rather than the pipeline being broken — do not chase it by
dropping quality on everything.

---

## 3. Return image dimensions in the API JSON — unblocks frontend work

**This one is a hard blocker on our side, and it is easy to miss because nothing
is visibly broken.**

The serializers return image URLs with no dimensions:

```json
{ "cover_image": "https://api.realestate.aajneeti.social/media/...jpg" }
```

Two consequences in the frontend, neither fixable without you:

1. **`srcset` cannot be generated for backend images.** The frontend now serves
   responsive variants for its own local images and cut the hero payload on a
   360px phone from 4,574 KB to about 40 KB. Every backend-hosted image —
   including all project tiles, which render at **251 x 164** on desktop — still
   gets the full-size file, because we have neither derivative URLs nor
   dimensions to build a `srcset` from.

2. **Two images cannot have their layout space reserved**, so they shift the
   page as they load: the project master-plan image and the gallery lightbox.
   Most images on the site sit in fixed-aspect containers and are fine, but
   these two have genuinely variable aspect ratios. We deliberately did not
   hardcode a guess — a wrong ratio silently crops or letterboxes real
   photographs, and an invented number in the codebase looks like verified data
   to whoever reads it next.

Please add to every serialized image:

```json
{
  "cover_image": {
    "url": "...-1440.webp",
    "width": 1440,
    "height": 960,
    "srcset": [
      { "url": "...-320.webp",  "width": 320 },
      { "url": "...-640.webp",  "width": 640 },
      { "url": "...-960.webp",  "width": 960 },
      { "url": "...-1440.webp", "width": 1440 }
    ]
  }
}
```

Shape is negotiable — a flat `cover_image_width` / `cover_image_height` pair
would unblock the layout-shift half on its own, and is a much smaller change if
you want to land something quickly. The `srcset` array is what unblocks the
bandwidth half.

If this changes the field type rather than adding fields, please version it or
add alongside — the frontend reads `cover_image` as a string today and a silent
type change would break project cards site-wide.

---

## 4. Put a CDN in front of the origin

There is no CDN. Everything resolves to a single DigitalOcean box:

```
168.144.65.209   nginx/1.24.0 (Ubuntu)   Bengaluru
```

**On timings — please re-measure yourselves.** The original audit recorded a
1.95s TTFB with 1.30s of it in the TLS handshake. Probing from a different
network on 14 Sep 2026 gave a much healthier picture:

```
dns=0.017s  tcp=0.094s  tls=0.169s  ttfb=0.328s  total=1.137s (4.4 MB)
```

Both can be true — that is the point. A single origin with no edge presence
gives you performance that swings with the user's distance from Bengaluru, and
this site serves NRI buyers. The variance between those two measurements is
itself the argument for an edge cache, more than either number alone.

Cloudflare in front of the origin is the obvious choice, and it would make items
1 and 2 substantially cheaper:

- **on-the-fly resizing** — Cloudflare Image Resizing can generate the
  320/640/960/1440 derivatives at the edge, so item 2 becomes a config change
  instead of a Django pipeline plus a backfill of existing uploads
- **format negotiation** — the origin currently ignores `Accept`. A request
  sending `image/webp,image/avif` still gets `Content-Type: image/jpeg`, with no
  `Vary` header. Cloudflare Polish handles WebP/AVIF negotiation per browser
- edge caching makes item 1's `immutable` far more valuable, since the origin
  stops being hit at all for repeat views

If you adopt Cloudflare resizing, item 2 shrinks to "stop serving originals at
their upload resolution" and item 3 to "return the base URL plus dimensions",
with the width variants derived at the edge.

---

## Summary

| # | Item | Effort | Payoff |
|---|---|---|---|
| 1 | `Cache-Control` on `/media/` | minutes | removes ~31 revalidation round trips per view |
| 2 | Derivatives on upload, stop serving originals | days | 4.4 MB to tens of KB on the worst offenders |
| 3 | Dimensions + `srcset` in API JSON | hours | unblocks responsive images and two layout shifts |
| 4 | Cloudflare in front of origin | hours | consistent TTFB worldwide; makes 2 and 3 much cheaper |

Item 3 is the one to talk to the frontend about before starting, since the
response shape needs agreeing. Items 1 and 4 are independent and can land
immediately.
