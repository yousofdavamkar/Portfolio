# Home design reference

The Home layout follows the original Figma frames inspected and exported through Helium on October 28, 2026:

- [Desktop Home, 1440 × 810](https://www.figma.com/design/Gis2vvOMoRcwh63BEEAmuW/portfolio?node-id=66-351)
- [Mobile Home, 428 × 926](https://www.figma.com/design/Gis2vvOMoRcwh63BEEAmuW/portfolio?node-id=79-1296)

At the desktop reference size, the conversation starts at x=765, y=252. Its main bubbles are 450 × 100 at y=456 and y=580. The portrait retains its original transparent 850 × 585 asset bounds, starting at x=0, y=225. Container-relative units preserve these proportions without stretching the bitmap. The mobile conversation starts at x=33, y=100, with the portrait below it; smaller viewports scroll naturally.

Home-specific rules live with the Home page and the `home` variant of `Portrait`. Shared navigation remains in `layout.css`. Avoid adding viewport-height-driven portrait scaling, forced headline line breaks, or decorative overlays to this composition.

Intentional differences from the reference: the name is Yousof Davamkar; theme controls are removed; the last bubble links to contact until a real CV exists in the dashboard. The three experience labels in the reference are retained visually, with duplicates hidden from assistive technology. Page transitions, reduced-motion handling, skeletons, and the mobile navigation remain functional.
