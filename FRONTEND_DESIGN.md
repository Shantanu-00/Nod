# NOD — Frontend Brand Design & Platform Ideology
# Project: Dyslexia & Neurodivergent Accessible Social Platform
# Target: OpenAI WebMCP Challenge

> **MANDATORY FOR ALL FRONTEND DEVELOPERS & CODING AGENTS:**
> When building or modifying UI components, pages, stylesheets, or layouts in this repository, you MUST follow the design philosophy, token system, and two-layer interface architecture defined in this document.

---

## 1. Brand Overview & Visual Assets

### 1.1. Brand Identity
- **Name**: **NOD**
- **Logo**: Bold geometric rounded letterforms with the brand mascot's face embedded in the letter `O` and subtle dual signal waves representing attention, listening, and intent.
- **Primary Taglines**:
  - *"Say less. Do more."*
  - *"A small nod that turns intent into action."*
  - *"Human intent. Agent action."*
  - *"You focus on your ideas. NOD handles the rest."*
- **Positioning**: An agent-native reading and publishing experience for the web, powered by WebMCP.

### 1.2. Visual Brand References & Direct Image Assets

The platform branding, mascot styling, and UI architecture are directly derived from the official brand renders stored in `assets/brand/`:

#### Asset 1: The 3D Mascot & Primary Logotype
![NOD 3D Mascot & Logotype](file:///c:/Users/Admin/Desktop/hackathon/nod/assets/brand/nod-mascot.png)
- **Direct File**: [assets/brand/nod-mascot.png](file:///c:/Users/Admin/Desktop/hackathon/nod/assets/brand/nod-mascot.png)
- **Original Source File**: [assets/brand/ChatGPT Image Sep 3, 2026, 02_52_36 AM.png](file:///c:/Users/Admin/Desktop/hackathon/nod/assets/brand/ChatGPT%20Image%20Sep%203,%202026,%2002_52_36%20AM.png)
- **Visual Design Identity**:
  - **The Mascot ("Nod")**: A tactile, soft-touch matte 3D clay figure with rounded organic geometry and expressive dark oval eyes.
  - **The Gesture**: The mascot's head is angled in a gentle downward tilt ("a small nod") indicating human intent has been received and acknowledged.
  - **Attention Signal Waves**: Two curved lime-green acoustic/attention arcs emerge above the letter `O` and beside the mascot's head, signaling active listening and agent readiness.
  - **Typography**: Friendly, ultra-bold geometric rounded sans-serif letterforms.

---

#### Asset 2: Complete Brand System, Color Chips, Taglines & UI Preview Sheet
![NOD Brand System, Tagline, Color Chips, Mascot Expressions and UI Previews](file:///c:/Users/Admin/Desktop/hackathon/nod/assets/brand/nod-brand-sheet.png)
- **Direct File**: [assets/brand/nod-brand-sheet.png](file:///c:/Users/Admin/Desktop/hackathon/nod/assets/brand/nod-brand-sheet.png)
- **Original Source File**: [assets/brand/ChatGPT Image Sep 3, 2026, 02_58_06 AM.png](file:///c:/Users/Admin/Desktop/hackathon/nod/assets/brand/ChatGPT%20Image%20Sep%203,%202026,%2002_58_06%20AM.png)
- **Key Brand Elements Extracted from the Sheet**:
  - **Hero Header**: Dark Obsidian backdrop with *"Say less. Do more."* where *"Do more."* is highlighted in Electric Lime (`#B4F040`).
  - **Pill Badge**: `✦ Human intent. Agent action.`
  - **Three Action Pillars**:
    1. **Read**: *"Make the web easier to read."* (Green squircle document badge)
    2. **Write**: *"Turn thoughts into structured content."* (Blue squircle edit badge)
    3. **Publish**: *"Share your ideas with the world."* (Pink squircle send badge)
  - **Mascot Facial Expressions**: Neutral/Listening, Nodding/Working, and Smiling/Complete.
  - **Desktop Reading Canvas (`read.nod`)**: Soft cream elevated page, natural landscape imagery, minimal distraction-free layout, and the bottom floating accessibility pill dock (`Aa ---●--- ☀️`).
  - **Mobile Posting Interface**: Dark contrast composer with transparent agent status bubble (*"NOD, turn these thoughts into a post"*), structured formatting toolbar, and the signature Electric Lime action button: *"✈ Publish with NOD"*.

---

## 2. Core Design Ideology: The Two-Layer Architecture

A critical mistake in accessibility design is applying harsh, rigid brand colors to the actual reading/writing surfaces. 

**NOD enforces a strict Two-Layer Interface Architecture:**

| Layer | Surface Role | Styling & Behavior | Color Policy |
| :--- | :--- | :--- | :--- |
| **Layer 1: Brand Shell** | Fixed Platform Identity | Top nav, footer, mascot status widgets, floating control docks, marketing, and modal frames | **Fixed Brand Palette**: Serene Warm Cream (`#F7F5F0`), Natural Leaf Green (`#78A82A`), Clean White (`#FFFFFF`). |
| **Layer 2: Adaptive Canvas** | Dynamic User Content | Article reading view, post feed, typography, line spacing, bionic reading fixation, and drafting editor | **100% User-Variable**: Modulated live by WebMCP `adjust_reading_mode` (Soft cream `#F7F5F0`, Warm peach `#FFF4EC`, Calming sage `#F2F7F4`, Muted slate `#16181F`, or Yellow-on-black). **Never pure #000 on #FFF**. |

### 2.1. Why the Content Layer Must NOT Be Hardcoded Black & White
- **Stark black text on pure white** (`#000000` on `#FFFFFF`) causes severe visual stress (photopic sensitivity / Irlen syndrome), chromatic vibration, and "rivers of white" for dyslexic and neurodivergent readers.
- **The Brand Shell** provides the unmistakable NOD identity (sleek dark obsidian, soft clay mascot, electric lime green accents).
- **The Content Canvas** is an adaptive sandbox where typography, letter-spacing, line-height, and background tints are controlled dynamically by the user and by WebMCP agent tools (`adjust_reading_mode`).

---

## 3. Brand Design System Tokens (Layer 1: Brand Shell)

### 3.1. Color Palette

#### Primary Brand Colors
| Token | Hex | Role & Usage |
| :--- | :--- | :--- |
| `--color-brand-bg` | `#F7F5F0` | Default serene warm-cream background (anti-glare, non-fatiguing) |
| `--color-brand-surface` | `#FFFFFF` | Card containers, clean reading surfaces, elevation |
| `--color-brand-surface-elevated` | `#FAF8F5` | Secondary panels, subtle dividers, hover states |
| `--color-brand-green` | `#78A82A` | **Natural Balanced Leaf Green**: Primary CTA, status indicators, active states |
| `--color-brand-green-hover` | `#689423` | Hover state for interactive green buttons |
| `--color-brand-green-muted` | `#EAF5ED` | Soft pastel badge backgrounds, active highlights |
| `--color-brand-text` | `#1E2024` | Primary high-contrast charcoal typography (zero photopic glare) |
| `--color-brand-muted` | `#666D79` | Subtitles, metadata, secondary captions |
| `--color-brand-dark` | `#14161A` | Dark accent elements (e.g. mascot intent bubble) |

#### Functional Feature Colors (from Brand Sheet Pillars)
| Feature | Background Tint | Icon / Accent | Usage |
| :--- | :--- | :--- | :--- |
| **Read** | `#EBF8EE` (Light) / `#162719` (Dark) | `#2E7D32` / `#66BB6A` | Reader mode badges, readability tools |
| **Write** | `#EEF4FF` (Light) / `#14223B` (Dark) | `#1E88E5` / `#42A5F5` | Drafting assistance, proofreading tools |
| **Publish** | `#FAF0F8` (Light) / `#2D1628` (Dark) | `#D81B60` / `#EC407A` | Community publishing, public feed actions |

### 3.2. Typography (Brand Shell)
- **Brand Headings & Logo**: Plus Jakarta Sans, Outfit, or Inter with font-weight `700` or `800`.
- **Character**: Friendly, rounded geometry, wide aperture, high legibility.
- **Pill Badges**: Medium `600`, uppercase or title case with subtle letter spacing (`+0.02em`).

### 3.3. Shapes, Radii & Depth
- **Squircles & Rounding**:
  - Buttons / Badges: Full pill (`border-radius: 9999px`)
  - Cards & Modals: `border-radius: 20px` to `24px`
  - Control Sliders / Input Bars: `border-radius: 16px`
- **Tactile Clay Depth**:
  - Avoid flat harsh borders. Use soft multi-layered drop shadows or subtle inner highlights:
    `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.08);`

---

## 4. Adaptive Content Architecture (Layer 2: Content Canvas)

The content canvas displays community posts, articles, and reading previews. It MUST be styled exclusively with CSS Custom Properties that are dynamically modulated:

### 4.1. Reading Themes (Contrast & Tints)

1. **Soft Cream / Warm Sand (Default Accessible Light Mode)**:
   - `--canvas-bg: #FBF8F1;`
   - `--canvas-surface: #F3EFE4;`
   - `--canvas-text: #232529;` (Charcoal, not pure black)
   - Eliminates white-glare glare while maintaining WCAG AAA contrast ratio.

2. **Soothing Slate (Accessible Dark Mode)**:
   - `--canvas-bg: #12141A;`
   - `--canvas-surface: #1B1E26;`
   - `--canvas-text: #E3E5EB;` (Soft off-white, not harsh neon white)

3. **Yellow-on-Black (High Discrimination)**:
   - `--canvas-bg: #0D0E11;`
   - `--canvas-surface: #171922;`
   - `--canvas-text: #FFEB3B;` (Preferred by many low-vision and severe dyslexia readers)

4. **Pastel Peach / Rose Tint (Irlen Syndrome Friendly)**:
   - `--canvas-bg: #FDF4F0;`
   - `--canvas-surface: #F5EAE5;`
   - `--canvas-text: #2A2421;`

### 4.2. Typography Modulations (User & Agent Controlled)

```css
:root {
  /* Default Adaptive Canvas Tokens */
  --font-canvas: 'Lexend', 'OpenDyslexic', -apple-system, sans-serif;
  --font-size-canvas: 1.125rem;
  --line-height-canvas: 1.75;
  --letter-spacing-canvas: 0.03em;
  --word-spacing-canvas: 0.08em;
  --max-reading-width: 65ch; /* Never exceed 70ch to prevent lost line tracking */
}
```

### 4.3. Bionic Reading Guide Engine
When `bionicReading: true` is activated by the user or via WebMCP `adjust_reading_mode`:
- The first 40%–50% of each word is rendered with `<strong class="bionic-fixation">` (weight: `700` or `800`), guiding the eye's saccadic leaps and anchoring fixation.

### 4.4. Translucent Reading Ruler
- When activated, a horizontal tinted guide bar follows the cursor (`pointer-events: none; backdrop-filter: brightness(0.95); height: 2.5em; border-top: 1px dashed rgba(...); border-bottom: 1px dashed rgba(...);`) to prevent vertical line skipping.

---

## 5. Mascot & Agent Micro-Interactions

The mascot **Nod** is the physical manifestation of the agent working alongside the human.

### 5.1. Mascot States
1. **Idle / Waiting**:
   - Mascot sits quietly in the status bar or floating dock.
   - Dual signal waves are dimmed (`opacity: 0.3`).
2. **Listening (User Prompting / Intent Received)**:
   - Signal waves glow in Electric Lime (`#B4F040`) with a gentle pulse animation.
3. **Nodding (Tool Executing)**:
   - Mascot performs a smooth 15° forward/down tilt animation ("nodding" to confirm intent).
4. **Transparent Progress Feedback**:
   - Status card floats with checkable step items:
     - `Improving readability ✓`
     - `Adjusting typography ✓`
     - `Enhancing contrast ✓`
     - `Simplifying layout ⟳`

---

## 6. Critical Rules for Frontend Developers & Coding Agents

1. **Never Hardcode Reading Styles in Component CSS**:
   - Always use `var(--canvas-bg)`, `var(--canvas-text)`, `var(--font-canvas)`, etc., in any component that renders user text or community posts.
2. **Preserve the Two-Layer Separation**:
   - Keep the Brand Shell (header, logo, footer, mascot badges, action bars) distinctly styled in NOD's obsidian & electric lime theme.
   - Keep the inner post body in the variable accessible canvas.
3. **Always Animate State Changes Gently**:
   - People with dyslexia and ADHD are easily disoriented by sudden layout shifts.
   - Use smooth transitions (`transition: background-color 0.25s ease, font-size 0.2s ease, letter-spacing 0.2s ease;`).
4. **Mobile & Desktop Parity**:
   - As previewed in [assets/brand/nod-brand-sheet.png](file:///c:/Users/Admin/Desktop/hackathon/nod/assets/brand/nod-brand-sheet.png), the floating action dock (`Aa  ---●---  ☀️`) must be anchored at the bottom of the viewport on both desktop and mobile for effortless thumb/cursor reach.
