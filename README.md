# Indy-HVAC-Pros
Demo site

## Homepage (`public/index.html`)
Group A emergency homepage for the Indy HVAC Pros demo. Styles in `public/home.css`, form behaviour in `public/home.js`.
The other pages (`services`, `contact`, `blog`) still use `global-css-tokens.css` and haven't been rebranded yet.

- Brand files: `public/brand/` (from the Indy HVAC Pros brand kit) · photos: `public/images/` · font: `public/fonts/` (Inter, SIL OFL)
- **Forms:** set `data-endpoint="https://…"` on each `<form>` to send requests (JSON POST). Until then the forms say
  "not connected, please call" and never show a false success.
- **Search engines:** the page has `noindex` because this is a demo. Remove it when the business details are real.
- Docs (requirements, style brief, intake answers) live in the UIGEN repo under `docs/group-a-*`.
