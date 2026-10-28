# Home design reference

The Home layout follows the original Figma frames inspected and exported through Helium on October 28, 2026:

- [Desktop Home, 1440 × 810](https://www.figma.com/design/Gis2vvOMoRcwh63BEEAmuW/portfolio?node-id=66-351)
- [Mobile Home, 428 × 926](https://www.figma.com/design/Gis2vvOMoRcwh63BEEAmuW/portfolio?node-id=79-1296)

At the desktop reference size, the conversation starts at x=765, y=252. Its main bubbles are 450 × 100 at y=456 and y=580. The portrait retains its original transparent 850 × 585 asset bounds, starting at x=0, y=225. Container-relative units preserve these proportions without stretching the bitmap. The mobile conversation starts at x=33, y=100, with the portrait below it; smaller viewports scroll naturally.

Home-specific rules live with the Home page and the `home` variant of `Portrait`. Shared navigation remains in `layout.css`. Avoid adding viewport-height-driven portrait scaling, forced headline line breaks, or decorative overlays to this composition.

Intentional differences from the reference: the name is Yousof Davamkar; theme controls are removed; the last bubble links to contact until a real CV exists in the dashboard. The three experience labels in the reference are retained visually, with duplicates hidden from assistive technology. Page transitions, reduced-motion handling, skeletons, and the mobile navigation remain functional.

## About and topic pages

The About frames were exported through the personal Helium Figma session on October 28, 2026. Desktop About is [frame 66:411](https://www.figma.com/design/Gis2vvOMoRcwh63BEEAmuW/portfolio?node-id=66-411), 1440 × 810; mobile About is 428 × 926. Local reference exports are in the ignored `.artifacts/figma-reference` directory.

Desktop About places the label at (93, 152), the question at (764, 152), and six outlined links at x=764, starting y=266 with a 56px height and 24px gaps. The portrait uses the same native asset placement as Home, with only the white arch. The lower-right arch is gray. Mobile omits the portrait and next-page control, starts the label at (31, 104), the question at (23, 170), and the links at (23, 248) with 48px height and 24px gaps.

The six routes under `/about` follow Wireframe - 26 (journey), Wireframe - 30 (activities), Wireframe - 31 (soft skills), POrtfolio-hard skills, Wireframe - 33 (education), and Wireframe - 34 (languages). Each has a real URL, an explicit Back link to About, and the reference's gray arch composition. Desktop uses two-column entries (three for hard skills); mobile stacks entries (two columns for hard skills). Unknown topics return 404.

The Figma detail frames repeat sample jobs, degrees, and JavaScript tiles. These are not published as real credentials: journey and hard skills use the saved profile; activities, soft skills, education, and languages use optional editable profile arrays and show a concise empty state until filled in. The dashboard supports those sections without changing existing profile records. Theme controls remain removed. About stays the active navigation item on its detail pages.

The About introduction types the label first, then its question, and reveals the six topic links in order with a 75ms stagger. Character visibility reserves the final text geometry. These elements do not use the generic scene reveal, avoiding competing animations. Keyboard input, reduced motion, and hidden tabs finish the sequence immediately; unmount cancels its frame and listeners. The no-JavaScript page remains fully visible and navigable.

About topic navigation uses a 480ms horizontal slideshow: the outgoing composition moves right while the destination enters from the left. The same direction applies to Back links and browser history. The header remains stationary, and interrupted navigation removes the outgoing snapshot immediately. Reduced motion and keyboard navigation retain immediate transitions.
