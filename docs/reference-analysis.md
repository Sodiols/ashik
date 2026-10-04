# Reference and design decisions

Reference: original-1f1610f0a43c0aed537ab125d7ef8e45.mp4. 1600 × 1200, 50 fps, 16.02 seconds. Decoded into 801 frames before interface implementation; full frame contact sheets and larger half-second frames are in the local ignored `.reference` directory.

- 0.00–6.56 s: persistent tiny top navigation; asymmetrical, staggered sans display type; a smaller italic serif accent; tiny supporting blocks near the lower left. Soft environment moves independently of sharp type. Cursor lens follows with lag, magnifies and warps nearby letterforms, and has a thin rim.
- 6.58–7.80 s: typography translates up, with a slight scale increase. Work rises from below while the environment transforms separately. The full transition takes roughly 1.2 s. This is continuous spatial movement rather than a white fade.
- 7.80–9.36 s: a five-line paragraph occupies the left third. In the 1600 × 1200 frame at 8.0 s, its left edge is approximately 134 px and its first line is near 385 px down. The front black panel begins near (780, 500), continues past the right viewport edge, and ends near y = 1116. Two rear planes begin approximately 134 px farther right and 100 px higher per depth level, with progressively softened focus. Their headings are large, with thin rules and a circular arrow below. Circular pagination sits immediately beneath the front panel.
- 9.38–10.10 s: the front panel travels right, above the other planes, with a slight upward movement. It stays visible until it clears the viewport. The next plane advances diagonally left/down into the front position and becomes sharp. Remaining cards recompose without bouncing. This is not an opacity crossfade or a simultaneous reorder of all panel ranks.
- 12.16–13.38 s: panels descend; hero type enters from above, restoring the first composition. Header remains fixed throughout.
- 13.38–16.02 s: hero and optical interaction resume without a reload.

## Ashik interpretation

White #fff canvas; #000 lettering; #666 secondary text; #a0a0a0 atmosphere; #f4f4f4 surfaces; #fafafa light field. Instrument Sans for utility and the architectural Designer line; Instrument Serif Italic for Visual and restrained editorial accents. Two locally hosted font families only.

The hero uses a staggered Visual / Designer composition, with directional grayscale light behind it. The lens clips a second, magnified copy of the exact hero lettering, with subtly unequal horizontal/vertical scaling and a fine monochrome rim. An initial full-size SVG displacement was removed after WebKit checks showed that CSS magnification gives a more reliable response. Native pointer remains available. No generated raster project imagery or invented claims.

Desktop hero and work share a sticky visual stage. Scroll progress drives separate typography, atmosphere and stack transforms with GSAP. Navigation animates that same scroll coordinate; reverse scroll reconstructs the hero. Other sections return to native document scrolling. Wheel navigation is restricted to the stack and releases at either end; buttons, circular pagination, arrows and drag also work.

The corrected work composition uses the measured 4:3 frame proportions: introduction left 8.3%, top 32%; front panel left 48.8%, top 41.7%, width 70vw and height 51.3svh. Rear steps are 12% of panel width and 16.2% of panel height. The large “Selected work” display heading has been replaced with a screen-reader heading and a five-line introduction. Panel headers share the black canvas, gallery SVG backgrounds blend into it, and pagination uses circular outlines. The stack is finite: visited projects do not wrap behind the visible deck. A newly revealed rear plane waits until the outgoing front has almost cleared the stack.

Work entry separates the paragraph, deck, atmosphere and return indicator into independent paths. Every work foreground plane starts completely below the viewport, including the rear panels, so none bleed into the resting hero. Project navigation uses a distinct sideways exit/diagonal advance timeline; reverse navigation brings the previous front back from the right. The white/grayscale palette, Ashik copy and explicitly temporary project content remain specific to this portfolio.

Mobile uses a full-height hero followed by a horizontal overlapping, swipeable stack and native document flow. Reduced motion removes lens/parallax and large spatial transforms while preserving navigation, content and controls.

Project names are explicitly temporary. Years, clients, achievements, software, social URLs, email and portrait are omitted until supplied. Canonical URLs and sitemap require the real origin. Contact uses the public Web3Forms key only; missing configuration never reports success.
