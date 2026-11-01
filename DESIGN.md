---
version: "alpha"
name: "Slaydate"
description: "Full-bleed colour bands in slate, crank yellow and electric purple, one chunky yellow handheld, 1-bit game cards and huge friendly bold type."
colors:
  primary: "#6c00ff"
  on-primary: "#ffffff"
  surface: "#7a8085"
  surface-container: "#ffc833"
  on-surface: "#ffffff"
  on-surface-variant: "#b1afa8"
  outline: "#312f28"
  yellow-deep: "#ffb000"
  paper: "#e8e4da"
  snow: "#efefef"
  night: "#212223"
  aqua: "#21c6a9"
  aqua-deep: "#127866"
  black: "#000000"
typography:
  headline-display:
    fontFamily: "Onest"
    fontSize: 68px
    fontWeight: 800
    lineHeight: 1
    letterSpacing: -0.015em
  headline-lead:
    fontFamily: "Onest"
    fontSize: 57px
    fontWeight: 700
    lineHeight: 1.1
  body-md:
    fontFamily: "Onest"
    fontSize: 28.5px
    fontWeight: 400
    lineHeight: 1.3
  label-md:
    fontFamily: "Onest"
    fontSize: 22px
    fontWeight: 700
  label-pixel:
    fontFamily: "Silkscreen"
    fontSize: 15px
rounded:
  xs: 2.85px
  sm: 6px
  md: 10px
  lg: 34px
  full: 152px
spacing:
  unit: 8px
  section: 120px
  max-width: 800px
  wide: 1070px
components:
  button-pill:
    backgroundColor: "{colors.outline}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
    padding: 0.2em 0.7em 0.3em
  button-shop:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.full}"
    padding: 10px 26px 14px
  button-notify:
    backgroundColor: "{colors.surface-container}"
    textColor: "{colors.outline}"
    rounded: "{rounded.sm}"
    padding: 4px 28px 7px
  band-yellow-ledge:
    backgroundColor: "{colors.yellow-deep}"
    textColor: "{colors.outline}"
  band-shop:
    backgroundColor: "{colors.snow}"
    textColor: "{colors.black}"
  band-specs:
    backgroundColor: "{colors.night}"
    textColor: "{colors.on-surface}"
  band-club:
    backgroundColor: "{colors.aqua}"
    textColor: "{colors.black}"
  button-club:
    backgroundColor: "{colors.aqua-deep}"
    textColor: "{colors.on-primary}"
    rounded: "{rounded.lg}"
  game-card:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.outline}"
    rounded: "{rounded.xs}"
---

# Slaydate

> A tiny yellow handheld sold by a page made of flat colour bands, 68px bold headings and one ridiculous "Shop Now!!" pill.

Source: https://flavors.design/f/slaydate

The real face is Roobert (commercial, 300–800). Stand-in: **Onest** at 400/500/700/800, picked for the same round geometric skeleton, open single-storey `a`/`g`-free feel and friendly terminals. The stack keeps `"Roobert"` second.

## Overview

Slaydate is a boutique hardware launch page that refuses to look like hardware marketing. It is **a stack of full-bleed flat colour bands** – slate gray hero, crank yellow story, snow-white shop, aqua club band, electric purple pricing, near-black specs – each with its own ink and its own button colour, and the sticky nav repaints itself to match whichever band it sits on. Inside every band the layout is the same: an 800px column of **huge 800-weight headings ending in a full stop** ("The System.", "The Lever.") over 28.5px run-on body copy with bolded key phrases. The product is shown as one chunky, glossy yellow object, and the games are shown as **1-bit, two-tone title cards** (paper `#e8e4da` and ink `#312f28`, dithered and scan-lined) that flip on hover.

The mood is 90s-handheld delight written by a tiny indie software studio: deadpan, jokey, confident, with exclamation marks. It is not a spec-sheet SaaS page, not a gradient-mesh tech launch, and not retro-pixel kitsch – the pixels live only inside the game cards and the screen.

## Colors

| Role        | Value     | Notes                                                           |
| ----------- | --------- | --------------------------------------------------------------- |
| bg          | `#7a8085` | slate gray hero band (`--psd-dark-gray`), also the cloud colour |
| bg-2        | `#ffc833` | crank yellow: the main story band and the device body           |
| fg          | `#ffffff` | text on gray, purple and night bands                            |
| fg-muted    | `#b1afa8` | "screen white": spec labels, input labels, gray highlights      |
| accent      | `#6c00ff` | electric purple: Shop pill, pricing band, footer                |
| accent-fg   | `#ffffff` | text on purple                                                  |
| border      | `#312f28` | "screen black" ink: text on yellow, card outlines, dark buttons |
| yellow-deep | `#ffb000` | second line of the giant wordmark, device shading               |
| paper       | `#e8e4da` | 1-bit card paper                                                |
| snow        | `#efefef` | white shop band, inputs                                         |
| night       | `#212223` | specs / help / newsletter band                                  |
| aqua        | `#21c6a9` | club band                                                       |
| aqua-deep   | `#127866` | aqua band button and lockup subline                             |
| black       | `#000000` | ribbon badge, text on aqua                                      |

Scheme: light (bright bands). Contrast rule: ink `#312f28` on yellow (~10:1) and white on purple (~8:1) for body copy; white on the slate hero is only used at 57px+ bold.
Color rules: one band = one flat colour, never a gradient except the soft radial spotlight behind the hero device. Every band declares its own text and button colour (yellow → ink buttons, purple → yellow buttons, aqua → aqua-deep buttons, night → purple buttons). Purple is reserved for "buy".

## Typography

- Display: `"Onest", "Roobert", Helvetica, sans-serif` — 800 for h2 (68px/1, -0.015em) and the giant two-line wordmark (up to 300px/.74, -0.05em); 700 for the 57px hero lead.
- Body: same stack, 400 at 28.5px/1.3 (yes, that big); key phrases in `<b>` 700.
- Mono: `"Silkscreen"` pixel face, only inside game cards and tags.
- Game-card display faces (inside cards only): Bungee, UnifrakturMaguntia, Monoton, Rubik Mono One, Anton.
- Scale: 16 / 21 / 22 / 28.5 / 34 / 50 / 57 / 68 / 300.
- Load: `<link href="https://fonts.googleapis.com/css2?family=Onest:wght@400;500;700;800&family=Silkscreen:wght@400;700&family=Bungee&family=UnifrakturMaguntia&family=Monoton&family=Rubik+Mono+One&family=Anton&display=swap">`
- Rules: section headings are title case and end with a period or "?"/"!"; nav is 22px bold with icon-before-label; no uppercase eyebrows, no letter-spaced labels.

## Layout

- Max width 800px text column, 1070px for card grids, nav padded 80px from the viewport edges.
- Base unit 8px; spacing scale 4 / 8 / 16 / 24 / 32 / 48 / 80 / 128.
- Section rhythm 120px top and bottom inside each colour band; bands butt directly against each other.
- Grid: game cards 3 columns at 35:15.5 with 10px gaps; pricing 3 columns; specs 2 columns of label · icon · value; thought clouds 3 across.
- Density: airy — enormous type, few words per band, lots of flat colour.
- Headings and body are left-aligned inside the centred column; hero, CTAs and the catalog badge are centred.

## Elevation & Depth

Flat colour print with exactly two glossy objects.

- Bands are flat: no borders between them, no shadows; the colour change is the divider.
- Nav: transparent over the hero, then `background: band colour; border-bottom: 3px solid band ink` (`--nav-rule`).
- The "Shop Now!!" pill is the only glossy UI: `box-shadow: inset 0 2.5px 2.5px #fff9, inset 0 -2.5px 4px #0008, inset 0 -.5px 25px #fff4, 0 2.5px 5px #0006` (`--gloss`).
- The CSS device uses inset shading (`inset -8px -10px 18px` deep yellow, `inset 6px 6px 12px` white) and `0 40px 60px -24px` black at 55% as a floor shadow; buttons on it sit on a hard `0 5px 0` darker-yellow ledge.
- Game cards: `1px solid #312f28` outline, no shadow; texture is a dither `radial-gradient` dot grid or `repeating-linear-gradient` scanlines.
- Forbidden: drop shadows on cards, glassmorphism, gradients on bands, hairline dividers between sections.

## Shapes

- Radius: game cards 2.85px; inputs and Notify button 6px; speech bubble 10px; big pill buttons 1em (≈34px); Shop Now 152px (full pill); nav Shop pill 22px; pricing tiles 22px.
- Thought clouds: 8 overlapping ellipses (`border-radius: 50%`) forming a cloud with a small "thought" puff above.
- Speech bubble: white rounded box with a long thin CSS-triangle tail pointing left.
- Ribbon badge: black banner with wavy top and bottom edges via `clip-path: path()`.
- Burst badge: 20-point starburst `clip-path: polygon()` rotated -8deg; footer mark is a scalloped blob SVG.
- Game cards keep a 35:15.5 aspect ratio.

## Components

- Buttons: `.btn` pill, 1em radius, padding `.2em .7em .3em`, 700 weight at 34px, inline icon before the label; colour comes from the band (`--btn`, `--btn-t`). Hover: opacity .86. The hero "Shop Now!!" is the one glossy purple pill with italic "!!".
- Cards: 1-bit game cards – paper or ink ground, dither or scanline texture, one decorative title face; hover flips to the back (`rotateY(180deg)`) showing title, one-line pitch, author.
- Nav: wordmark left at 34px/800; right side icon+label links at 22px bold with 12px gaps, ending in a purple Shop pill with a bag icon (hover inverts to white with purple text).
- Inputs: full-width 66px, snow ground, 2px paper border, 6px radius; label above in fg-muted; submit right-aligned yellow "Notify Me!" with italic "!".
- Section headers: no eyebrow; just the 68px heading with a period.
- Decorations: tilted black "Season 2 / PRE-ORDER IT!" sticker overlapping the device; exploded isometric plates beside "The System."; drifting rows of colourful catalog tiles; faint blueprint outlines on the night band.

## Do's and Don'ts

- Do give every section its own flat full-bleed colour band with matching ink and button colour.
- Do end headings with a period and keep them 2–3 words.
- Do set body copy big (28.5px) and bold the one phrase that matters.
- Do show the product as one chunky, glossy object and the content as 1-bit cards.
- Do let the sticky nav repaint to the band underneath with a 3px ink rule.
- Do use exclamation marks and deadpan jokes in CTAs ("Shop Now!!", "Notify Me!").
- Don't add card shadows, borders between bands, or gradient backgrounds.
- Don't use uppercase eyebrows or letter-spaced labels.
- Don't put pixel fonts outside the game cards and tags.
- Don't use purple for anything but buying and the footer.
- Don't shrink the headings below 40px on mobile; stack instead.

## Motion

- Duration 250ms, easing ease-in-out.
- What animates: game cards flip on hover (front `rotateY(-180deg)`, back to 0); nav background/rule colour; Shop Now lifts 2px and scales 1.02; thought-cloud ellipses "blobble" (`scale(1.05,.95)`, 3.6–4.5s alternate, `--cloud-wobble` speeds it up); catalog rows drift sideways at 60s linear in opposite directions.
- What never animates: band colours, headings, body copy.
- Signature move: the nav repainting to the colour of the band below as you scroll.

## Tweaks

- `--sticker-tilt` (-20…8deg): rotation of the Season sticker.
- `--device-tilt` (-8…8deg): rotation of the CSS handheld.
- `--dither` (2…10px): dot and scanline pitch on the 1-bit cards.
- `--nav-rule` (0…6px): thickness of the nav's bottom rule.
- `--cloud-wobble` (0.3…3): speed of the thought clouds.
- `--radius-sm` (0…14px): game card corner.
- Schemes: Crank Night, Minty, Tomato, Grape Soda.

## Reference CSS

```css
:root {
  --bg: #7a8085;
  --bg-2: #ffc833;
  --fg: #ffffff;
  --fg-muted: #b1afa8;
  --accent: #6c00ff;
  --accent-fg: #ffffff;
  --border: #312f28;
  --yellow-deep: #ffb000;
  --paper: #e8e4da;
  --snow: #efefef;
  --night: #212223;
  --aqua: #21c6a9;
  --aqua-deep: #127866;
  --black: #000000;
  --ink: var(--border);
  --yellow: var(--bg-2);
  --font-display: "Onest", "Roobert", Helvetica, sans-serif;
  --font-body: "Onest", "Roobert", Helvetica, sans-serif;
  --font-mono: "Silkscreen", ui-monospace, monospace;
  --radius: 6px;
  --radius-sm: 2.85px;
  --radius-lg: 34px;
  --pill: 1em;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 16px;
  --space-4: 24px;
  --space-5: 32px;
  --space-6: 48px;
  --space-7: 80px;
  --space-8: 128px;
  --shadow: 0 40px 60px -24px color-mix(in srgb, var(--black) 55%, transparent);
  --gloss:
    inset 0 2.5px 2.5px color-mix(in srgb, var(--fg) 60%, transparent),
    inset 0 -2.5px 4px color-mix(in srgb, var(--black) 50%, transparent),
    inset 0 -0.5px 25px color-mix(in srgb, var(--fg) 30%, transparent),
    0 2.5px 5px color-mix(in srgb, var(--black) 40%, transparent);
  --ease: ease-in-out;
  --dur: 250ms;
  --max-width: 800px;
  --wide: 1070px;
  --section: 120px;
  --nav-rule: 3px;
  --sticker-tilt: -8deg;
  --device-tilt: 0deg;
  --dither: 4px;
  --cloud-wobble: 1;
  --wordmark: clamp(120px, 20vw, 300px);
}
.yel {
  --b: var(--yellow);
  --t: var(--ink);
  --btn: var(--ink);
  --btn-t: var(--fg);
}
.pur {
  --b: var(--accent);
  --t: var(--accent-fg);
  --btn: var(--yellow);
  --btn-t: var(--black);
}
.band {
  padding: var(--section) 0;
  color: var(--t);
  background: var(--b);
}
h2 {
  font: 800 68px/1 var(--font-display);
  letter-spacing: -0.015em;
}
.btn {
  padding: 0.2em 0.7em 0.3em;
  border-radius: var(--pill);
  background: var(--btn);
  color: var(--btn-t);
  font: 700 34px/1.2 var(--font-display);
}
.gc > * {
  border: 1px solid var(--ink);
  border-radius: var(--radius-sm);
  backface-visibility: hidden;
  transition: transform 250ms ease-in-out;
}
.dots {
  background:
    radial-gradient(
        circle,
        color-mix(in srgb, var(--ink) 55%, transparent) 1px,
        transparent 1.3px
      )
      0 0 / var(--dither) var(--dither),
    var(--paper);
}
```

## Reference markup

```html
<section class="band yel">
  <div class="wrap">
    <h2>The Season.</h2>
    <p>
      Here's the odd bit.
      <b>Two brand-new monster games arrive every week.</b> For ten weeks.
    </p>
    <span class="bubble"
      >Hey! <u><b>No spoilers</b></u
      >, please!</span
    >
  </div>
  <div class="games">
    <div class="gc">
      <div class="gf dots">
        <b class="t1">CASUAL<br />SLAYER</b>
      </div>
      <dl>
        <dt>Casual Slayer</dt>
        <dd>Bird-watching, but the birds bite.</dd>
        <dd>by Oona Varg</dd>
      </dl>
    </div>
  </div>
</section>
```

## How to apply this flavor

1. Replace the target page's design tokens with the palette, fonts and spacing above; split the page into full-bleed colour bands.
2. Restyle components to match the Components section; keep the page's content and structure, but rename headings to short phrases ending in a period.
3. Apply the motion rules; remove any animation not described here.
4. Check the Don't list before finishing.

## shadcn/ui Usage

### Install

Add this flavor's theme with `npx shadcn@latest add https://flavors.design/r/slaydate.json`. The CLI has no cookie — Pro users append `?key=YOUR_API_KEY` (Settings → API keys). Install primitives with `npx shadcn@latest add button card input textarea select dialog sheet tabs badge separator checkbox switch slider tooltip dropdown-menu table`.

### Theme variables

```css
@import url("https://fonts.googleapis.com/css2?family=Onest:wght@400;500;700;800&family=Silkscreen:wght@400;700&family=Bungee&family=UnifrakturMaguntia&family=Monoton&family=Rubik+Mono+One&family=Anton&display=swap");

:root {
  --accent: #868b90;
  --accent-foreground: #000000;
  --background: #7a8085;
  --border: #312f28;
  --card: #82888c;
  --card-foreground: #000000;
  --chart-1: #6c00ff;
  --chart-2: #ffffff;
  --chart-3: #b1afa8;
  --chart-4: #21c6a9;
  --chart-5: #000000;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --foreground: #ffffff;
  --input: #312f28;
  --muted: #868b90;
  --muted-foreground: #ffffff;
  --popover: #82888c;
  --popover-foreground: #000000;
  --primary: #6c00ff;
  --primary-foreground: #ffffff;
  --radius: 6px;
  --ring: #6c00ff;
  --secondary: #868b90;
  --secondary-foreground: #000000;
  --sidebar: #82888c;
  --sidebar-accent: #868b90;
  --sidebar-accent-foreground: #000000;
  --sidebar-border: #312f28;
  --sidebar-foreground: #000000;
  --sidebar-primary: #6c00ff;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-ring: #6c00ff;
  --surface-inverse: #82888c;
  --surface-inverse-foreground: #000000;
}

.dark {
  --accent: #3e4044;
  --accent-foreground: #ffffff;
  --background: #2b2d31;
  --border: #1d1c18;
  --card: #383a3d;
  --card-foreground: #ffffff;
  --chart-1: #ff6c42;
  --chart-2: #ffffff;
  --chart-3: #9a978f;
  --chart-4: #00a88a;
  --chart-5: #e9e7e1;
  --destructive: #f87171;
  --destructive-foreground: #2b2d31;
  --foreground: #ffffff;
  --input: #1d1c18;
  --muted: #3e4044;
  --muted-foreground: #b2b3b4;
  --popover: #383a3d;
  --popover-foreground: #ffffff;
  --primary: #ff6c42;
  --primary-foreground: #1d1c18;
  --radius: 6px;
  --ring: #ff6c42;
  --secondary: #3e4044;
  --secondary-foreground: #ffffff;
  --sidebar: #383a3d;
  --sidebar-accent: #3e4044;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #1d1c18;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #ff6c42;
  --sidebar-primary-foreground: #1d1c18;
  --sidebar-ring: #ff6c42;
  --surface-inverse: #ffc833;
  --surface-inverse-foreground: #2b2d31;
}

[data-flavor-scheme="minty"] {
  --accent: #7c958f;
  --accent-foreground: #000000;
  --background: #6f8a84;
  --border: #1f2e28;
  --card: #78918b;
  --card-foreground: #000000;
  --chart-1: #306fb6;
  --chart-2: #ffffff;
  --chart-3: #c4d3cc;
  --chart-4: #a0d1ff;
  --chart-5: #000000;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --foreground: #ffffff;
  --input: #1f2e28;
  --muted: #7c958f;
  --muted-foreground: #ffffff;
  --popover: #78918b;
  --popover-foreground: #000000;
  --primary: #306fb6;
  --primary-foreground: #ffffff;
  --radius: 6px;
  --ring: #306fb6;
  --secondary: #7c958f;
  --secondary-foreground: #000000;
  --sidebar: #78918b;
  --sidebar-accent: #7c958f;
  --sidebar-accent-foreground: #000000;
  --sidebar-border: #1f2e28;
  --sidebar-foreground: #000000;
  --sidebar-primary: #306fb6;
  --sidebar-primary-foreground: #ffffff;
  --sidebar-ring: #306fb6;
  --surface-inverse: #78918b;
  --surface-inverse-foreground: #000000;
}

[data-flavor-scheme="tomato"] {
  --accent: #91857c;
  --accent-foreground: #000000;
  --background: #86796f;
  --border: #2a1a12;
  --card: #8d8178;
  --card-foreground: #000000;
  --chart-1: #1d1c18;
  --chart-2: #ffffff;
  --chart-3: #cfc5bb;
  --chart-4: #ffc833;
  --chart-5: #000000;
  --destructive: #dc2626;
  --destructive-foreground: #ffffff;
  --foreground: #ffffff;
  --input: #2a1a12;
  --muted: #91857c;
  --muted-foreground: #ffffff;
  --popover: #8d8178;
  --popover-foreground: #000000;
  --primary: #1d1c18;
  --primary-foreground: #ffc833;
  --radius: 6px;
  --ring: #1d1c18;
  --secondary: #91857c;
  --secondary-foreground: #000000;
  --sidebar: #8d8178;
  --sidebar-accent: #91857c;
  --sidebar-accent-foreground: #000000;
  --sidebar-border: #2a1a12;
  --sidebar-foreground: #000000;
  --sidebar-primary: #1d1c18;
  --sidebar-primary-foreground: #ffc833;
  --sidebar-ring: #1d1c18;
  --surface-inverse: #8d8178;
  --surface-inverse-foreground: #000000;
}

[data-flavor-scheme="grape-soda"] {
  --accent: #6a637d;
  --accent-foreground: #ffffff;
  --background: #5b5470;
  --border: #1f1830;
  --card: #655e79;
  --card-foreground: #ffffff;
  --chart-1: #ffc833;
  --chart-2: #ffffff;
  --chart-3: #c7c0d8;
  --chart-4: #ff6c42;
  --chart-5: #000000;
  --destructive: #f87171;
  --destructive-foreground: #1d1c18;
  --foreground: #ffffff;
  --input: #1f1830;
  --muted: #6a637d;
  --muted-foreground: #e9e8eb;
  --popover: #655e79;
  --popover-foreground: #ffffff;
  --primary: #ffc833;
  --primary-foreground: #1d1c18;
  --radius: 6px;
  --ring: #ffc833;
  --secondary: #6a637d;
  --secondary-foreground: #ffffff;
  --sidebar: #655e79;
  --sidebar-accent: #6a637d;
  --sidebar-accent-foreground: #ffffff;
  --sidebar-border: #1f1830;
  --sidebar-foreground: #ffffff;
  --sidebar-primary: #ffc833;
  --sidebar-primary-foreground: #1d1c18;
  --sidebar-ring: #ffc833;
  --surface-inverse: #9d70db;
  --surface-inverse-foreground: #1d1c18;
}

@theme inline {
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-background: var(--background);
  --color-border: var(--border);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-foreground: var(--foreground);
  --color-input: var(--input);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-ring: var(--ring);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-sidebar: var(--sidebar);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-ring: var(--sidebar-ring);
  --color-surface-inverse: var(--surface-inverse);
  --color-surface-inverse-foreground: var(--surface-inverse-foreground);
  --font-display: "Onest", "Roobert", Helvetica, sans-serif;
  --font-mono: "Silkscreen", ui-monospace, monospace;
  --font-sans: "Onest", "Roobert", Helvetica, sans-serif;
  --radius-lg: var(--radius);
  --radius-md: max(0px, calc(var(--radius) - 2px));
  --radius-sm: max(0px, calc(var(--radius) - 4px));
  --radius-xl: calc(var(--radius) + 4px);
}
```

### Schemes

- `.dark` is the flavor's own "Crank Night" scheme (a dark palette declared by the flavor), not an inverted guess.
- Extra palettes are opt-in: set `data-flavor-scheme="<slug>"` on `<html>` or any subtree. Available: `minty` (Minty), `tomato` (Tomato), `grape-soda` (Grape Soda).
- `--surface-inverse` / `--surface-inverse-foreground` (`bg-surface-inverse text-surface-inverse-foreground`) is the flavor's inversion surface: the light block inside a dark page (or the reverse). Use it for the one section that flips, never as the default card.

### Token mapping

Every surface/foreground pair below was checked for WCAG contrast (4.5:1 for text, 3:1 as the floor on the primary button); when a flavor token would fail, the value is derived from `bg` and `fg` instead.

| Flavor token | shadcn variable                                                                                                                                                              |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| bg           | `--background`                                                                                                                                                               |
| fg           | `--foreground`, first choice for every `--*-foreground`                                                                                                                      |
| bg2          | `--card`, `--popover`, `--sidebar` when it sits on the same side as `bg` and reads with `fg`; otherwise `--surface-inverse`, and the card becomes `bg` tinted 6% toward `fg` |
| bg + fg (9%) | `--secondary`, `--muted`, `--accent` (shadcn's hover surface, not the flavor accent)                                                                                         |
| fg-muted     | `--muted-foreground` (pulled toward `fg` until it reads)                                                                                                                     |
| accent       | `--primary`, `--ring`, `--chart-1`                                                                                                                                           |
| accent-fg    | `--primary-foreground`                                                                                                                                                       |
| border       | `--border`, `--input`, `--sidebar-border` (derived from `bg`/`fg` when the token is a `var()`, `color-mix()` or invisible against `bg`)                                      |
| extra.*      | `--destructive` (a key named danger/error/red/alert), `--chart-2..5`                                                                                                         |
| radius       | `--radius`; `--radius-sm/md` never go below 0                                                                                                                                |

### Component recipes

- **Button:** use `bg-primary text-primary-foreground rounded-[var(--radius)]`; headings can use `font-display` ("Onest", "Roobert", Helvetica, sans-serif).
- **Card:** use `bg-card text-card-foreground border border-border rounded-[var(--radius)]`; see Components above for the flavor's shadow treatment.
- **Input:** use `bg-background border border-input rounded-[var(--radius)]`; keep the border treatment from Components above.
- **Badge:** use `bg-secondary text-secondary-foreground rounded-[var(--radius)]`; follow the flavor's density and typography rules above.
- **Tabs:** use `border-b border-border` with active `text-primary`; see Components above for spacing and interaction details.

### Implementation rule for agents

Import primitives from `@/components/ui/*`, apply the theme CSS first, and keep this flavor's Components, Do's, and Don'ts as the source of truth. shadcn names are only the implementation surface.
