# tabnum

Puts the PR / issue / MR number first in GitHub and GitLab tab titles, so you can still read it when tabs get narrow.

**Before**

![Tabs without tabnum: titles cut off before the number](screenshots/before.png)

**After**

![Tabs with tabnum: PR, IS and MR numbers first, with a status dot on each icon](screenshots/after.png)

```
PR 1234 · Fix login redirect · octo/repo
IS 5678 · Crash on startup · octo/repo
MR 42 · Bump deps · Merge requests · group / project · GitLab
```

The tab's site icon also gets a status dot, using GitHub's colors:

| Dot | Meaning |
|---|---|
| green | open |
| grey | draft, or issue closed as not planned |
| purple | merged, or issue completed |
| red | PR / MR closed without merging |

Safari often ignores icon changes made after the page loads, so the dot may not show there; the number in the title still works.

Works on github.com and gitlab.com. There's no build step: the extension is in `extension/`.

## Install

- **Chrome / Edge / Brave:** open `chrome://extensions`, turn on Developer mode, click **Load unpacked**, and pick `extension/`.
- **Firefox:** open `about:debugging#/runtime/this-firefox`, click **Load Temporary Add-on**, and pick `extension/manifest.json`. It stays loaded until you restart Firefox. To keep it installed, sign it with `npx web-ext sign`.
- **Safari:** open `safari/tabnum/tabnum.xcodeproj` and run the `tabnum` scheme once. Then in Safari, go to Settings → Advanced → turn on *Show features for web developers*, choose Develop → **Allow Unsigned Extensions**, and enable tabnum in Settings → Extensions. The Xcode project uses the files in `extension/` directly, so after you edit them, just rebuild.

## Test

```
node test.mjs
```
