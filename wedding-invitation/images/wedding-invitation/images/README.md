# Images

Place your photos here as **JPEG** (recommended):

- `photo1.jpg` — first polaroid (e.g. groom)
- `photo2.jpg` — second polaroid (e.g. bride)

Also supported: `.jpeg`, or `.svg` for placeholders.

Paths are set in locale files (`locales/ua.json`, etc.) under `images.photo1` and `images.photo2`.

If `photo1.jpg` is missing, the site automatically tries `photo1.jpeg`, then `photo1.svg`.

Example in `locales/ua.json`:

```json
"images": {
  "photo1": "images/photo1.jpg",
  "photo2": "images/photo2.jpg"
}
```

You can use other filenames — just update the path in all locale files.
