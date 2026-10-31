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

About topic navigation uses a 480ms horizontal slideshow: opening a topic moves the outgoing composition left while the destination enters from the right. Back links reverse this motion, moving right. Browser Back and Forward follow their respective backward and forward directions. The header remains stationary, and interrupted navigation removes the outgoing snapshot immediately. Reduced motion and keyboard navigation retain immediate transitions.

The primary gray arch is shared between About and its topic pages. It travels on its own smooth 1.05s path while content keeps the 480ms slideshow. The outgoing slide excludes the shared arch, and the destination arch stays hidden until the moving copy lands. Mobile uses the same primary SVG at the original smaller reference size; the secondary desktop arch stays part of the page. Identical topic-to-topic positions do not add an artificial sideways bow. Navigation interruption restores the real artwork and removes both temporary layers.

About and its topics also share the arch with Portfolio, including the next-page link from Spoken Languages. These chapter changes use the Home-to-About crossfade and 1.05s artwork motion: the gray inverted arch rotates, resizes, and changes to the gold Portfolio U. The portrait remains in the fading About composition. Browser history reverses the shared journey; reduced motion and interruptions retain the same cleanup behavior.

## Portfolio

The desktop Portfolio reference is [frame 66:533](https://www.figma.com/design/Gis2vvOMoRcwh63BEEAmuW/portfolio?node-id=66-533), 1440 × 810, exported from the personal Helium session on October 28, 2026. The full reference is stored locally in `.artifacts/figma-reference/Portfolio.jpg`.

At the reference width, the laptop and pedestal retain their exported 612 × 537 size at (415, 273). The label starts at (93, 144), the copy at (80, 286), and the 56px navigation arrows start at y=490 above the project count. The capsule preview occupies 210 × 314 at (1070, 54). Desktop dimensions scale with the site container; tablet and phone layouts reflow. The extra orbit graphic, vertical caption, category caption, and selected-work eyebrow are removed from this screen.

Project titles, summaries, counts, and preview imagery use the saved project data. The capsule links to the next published project, or the current project when there is only one. Consequently its image and the amount of text can differ from the Figma sample. The existing locally exported laptop asset remains unchanged. Theme controls stay removed as requested. The shared U transition remains on the SVG; the capsule image fades in over 280ms after the U lands when arriving from About or its topics, including Spoken Languages. The reveal follows animation completion, rather than a separate delay; interruptions restore the image immediately, and reduced motion shows it without waiting.

Portfolio advances between published projects every six seconds, with directional image/copy reveals. Hover, focus, a hidden tab, navigation, reduced motion, and the Pause control suspend autoplay. Manual arrows wrap, filters reset the selection, and a single project stays still. Browser-only fixtures exercise multiple projects without inserting sample work into Convex.

View Details slides the outgoing page left and the incoming detail page in from the right over 480ms, matching the About topic navigation. All Projects reverses the slide; browser history follows Back/Forward direction. The laptop and U travel independently above these sliding pages using the same 1.05s shared-art journey for the featured image and U. The detail page preserves its project when returning through history. Its vertical slider contains the featured preview, optional screenshots, then nonempty case-study paragraphs. Native vertical scrolling, touch, up/down controls, dots, and keyboard arrows/Home/End navigate within that project; long text remains scrollable. Returning to Portfolio resets the preview before capturing the shared artwork.

The dashboard's Detail screenshots field accepts up to 20 ordered image paths or HTTPS URLs with optional captions, one `image | caption` per line. Existing projects need no migration because `gallery` is optional. Missing screenshots are left empty. This change targets the development Convex deployment only.

The laptop and pedestal are now a reusable Svelte `Laptop` component built from HTML/CSS, shared by Portfolio and View Details. Only the screen contents scroll between detail slides; the silver bezel, base, and pedestal remain stationary. `ProjectScreen` fills the screen with uploaded screenshots. For the original `/images/featured-project.png` export, it clips to the existing screen pixels so the old laptop is not nested inside the new one. The source asset is unchanged. Shared-art snapshots retain the component's scoped styles and animate the complete device between routes.

## Contact

The desktop Contact frame was inspected in the personal Helium Figma session on October 31, 2026. Its 1440 × 810 composition places the speech label at approximately (93, 144), body copy at (80, 276), the outlined Hire Me button at (80, 484), and 60px social buttons at y=588. The flat right-hand panel begins at x=1000. The existing contact illustration occupies the right side at its original aspect ratio, rather than a small image beneath the copy. The extra orbit and vertical caption are omitted from this screen.

The saved profile bio and populated social URLs replace the repeated sample text and unconfigured social destinations. The existing personalized illustration remains unchanged. Theme controls remain removed. The GitHub social mark is stored locally from the [official GitHub brand toolkit](https://brand.github.com/foundations/logo).

Hire Me opens the existing enhanced contact form in a shadcn dialog with focus trapping, Escape dismissal, focus restoration, validation, pending and success states. The page stays full-height without scrolling at standard desktop and phone sizes; very short phone screens can scroll to keep content accessible. Mobile reflows the illustration below the copy. Computer control could read the desktop canvas but could not reliably select the mobile frame, so the mobile composition is responsive rather than an exact verified reproduction of that frame.

Portfolio types its label, selected project title, and summary in sequence using the same character-preserving `TypedText` component as About. The label runs once per visit; slider or filter changes restart the project copy. Text geometry stays reserved throughout, and artwork retains its independent carousel/shared transitions. Reduced motion, keyboard interaction, and hidden tabs finish the copy immediately. Pending animation frames are canceled on changes and navigation; no-JavaScript visitors see the complete text.

Portfolio (including project details) and Contact use the same crossfade and 1.05s shared-art journey as Home and About. The gold Portfolio U travels toward the Contact illustration, dissolving into its cards and orb while the page copy crossfades in place. Returning reverses the artwork exchange, and the Portfolio capsule waits until the U lands before appearing. The header stays stationary. Interrupted navigation restores real artwork and removes temporary layers; reduced motion and keyboard navigation skip the animation.
