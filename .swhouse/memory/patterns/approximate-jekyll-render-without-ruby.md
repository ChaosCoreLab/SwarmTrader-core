---
discovered: 2026-10-11
cycle: 010
applicability: "Checking how a Markdown page of the Jekyll site looks (tables, overflow, console) on a machine without Ruby, Jekyll or Bundler, before the GitHub Pages build"
---

## Problem
Jekyll is not installed on the Ubuntu workstation, so a new document cannot be built or opened before merge; layout defects (wide tables, long URLs) are found only on Pages, after the merge.

## Solution
Render an approximation and measure it:
1. Convert the Markdown to HTML with the Python `markdown` module (extensions `tables`, `fenced_code`), after the front matter.
2. Wrap the HTML in the same structure as `_layouts/doc.html` (`doc-shell`, `doc-content`) and link the site's `assets/css/style.css`.
3. Open it with Chromium through the repository's Playwright at 1280 px and 390 px.
4. Read `document.documentElement.scrollWidth` against the window width, list the tables and blocks wider than their container, and read the console.
5. After a fix, repeat the measurement. Cycle 010: 390 px gave `scrollWidth` 856 before the fix and 747 after wrapping the tables, because long reference URLs also overflowed; the local `overflow-wrap` rule brought it to 390.

Also run the static checks that need no Jekyll: search the prose for the two Liquid openers (double curly brace, curly-percent), count columns per table, resolve relative links to existing files, and parse `_data/docs.yml` with a YAML parser.

## Limits
- It is **not** the Jekyll/kramdown output: heading attributes, handling of `[n]`, raw `<style>` blocks and special characters may differ. A defect found here is real; a pass here is not proof. The Pages build and a look at the published page stay `PENDING_HUMAN` (validation matrix target `github-pages`).
- Liquid is not processed at all, so Liquid errors are caught only by the static grep.
- The scripts of cycle 010 lived in the session scratchpad and were not kept in the repository; rebuild them from this recipe.

## Example
Cycle 010, Step 9 section 5 and the corrections after it in `.swhouse/cycles/current-010.md`. Style fix: see [[jekyll-stakeholder-docs]] ("Wide tables and long URLs").
