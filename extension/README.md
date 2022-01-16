# Hyperfov Browser Extension

This is the browser extension portion of Hyperfov that enables the system to collect pages as they're visited.

It's installable in Firefox and Chrome.

## Development

This extension uses [Mozilla's `web-ext`](https://github.com/mozilla/web-ext), so Firefox is the browser of choice for development. To install the extension to a fresh browser instance, run:

```
npm install
```

```
npm run dev
```

Any changes made to files in `src/` will cause the extension to automatically reload in the browser. 