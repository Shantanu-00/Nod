# NOD — Clinical Accessibility Research & Master Feature Specification
# Project: Dyslexia & Neurodivergent Accessible Social Platform
# Target: OpenAI WebMCP Challenge

> **MANDATORY SPECIFICATION FOR CORE PRODUCT & WEBMCP TOOLS:**
> This document details the clinical neuroscience, accessibility research, and master feature specifications that govern **NOD**. Every reading tool, authoring workflow, and WebMCP agent capability must strictly align with the clinical mechanisms and feature contracts defined below.

---

## 1. Clinical Accessibility Research: The Non-Standard Realities

Mainstream "accessibility" features often rely on common misconceptions that fail clinically under rigorous testing. NOD is engineered around validated cognitive neuroscience:

### 1.1. The Font Fallacy vs. Spacing Mechanics
- **The Misconception**: Heavy bottom-weighted fonts (e.g. OpenDyslexic) solve reading difficulties.
- **Clinical Reality** *(Perea et al., 2014; Rello & Baeza-Yates, 2013)*: Specialized dyslexia typefaces provide **no statistically significant advantage** in reading speed or error reduction compared to standard sans-serif fonts.
- **The True Therapeutic Lever**: **Crowding Reduction (Visual Saccade Spacing)**:
  - **Letter Tracking (Inter-letter spacing)**: Expanded by **`+0.12em` to `+0.15em`** eliminates character crowding and letter collision.
  - **Word Spacing**: Expanded by **`+0.20em` to `+0.25em`** establishes unambiguous word boundaries for fixation.
  - **Line Height (Leading)**: Set to **`1.8` to `2.0`** to prevent vertical saccadic overlap and double-line reading.
  - **Optimal Typefaces**: **Lexend** (specifically engineered by Bonnie Shaver-Troup to modulate variable visual tracking) and **Atkinson Hyperlegible** (designed by the Braille Institute for unambiguous glyph distinction, e.g. distinguishing `I`, `l`, `1`, and `O`, `0`).

### 1.2. Visual Stress & Chrominance Vibration
- **The Misconception**: Maximum contrast (pure black `#000000` on pure white `#FFFFFF`, 21:1 ratio) is best for accessibility.
- **Clinical Reality** *(Wilkins et al., 1996 - Irlen Syndrome & Meares-Irlen Sensitivity)*: High-contrast white fields cause **photopic glare, halation (glow around dark characters), and chromatic letter "swimming"**.
- **The Therapeutic Lever**: Softening the contrast ratio to **7:1 – 10:1** using calibrated warm undertones:
  - **Soft Cream** (`#FAF8F5` background, `#232529` charcoal text)
  - **Warm Peach** (`#FFF3EB` background, `#2B2320` text)
  - **Sage Calming Green** (`#F2F6F3` background, `#1D2620` text)
  - **Muted Slate Dark** (`#161820` background, `#E0E3EC` text)
  - This eliminates ocular micro-strain while strictly satisfying WCAG AAA contrast standards.

### 1.3. Spatial Disorientation (Page Hopping / Spatial Anchor Amnesia)
- **The Misconception**: Full-page routing (`window.location.href`) is a standard navigation pattern.
- **Clinical Reality**: In individuals with traumatic brain injuries (TBI), ADHD, or executive dysfunction, jumping to a completely new URL destroys the user's mental map ("spatial anchor amnesia"). The reader forgets where they came from and experiences navigational paralysis.
- **The Therapeutic Lever**: **Zero-Disorientation Inline "Peek" Canvas**:
  - Clicking any article opens a slide-over drawer or floating split modal.
  - The parent community feed remains visible and dimmed (25% opacity) in the background.
  - The spatial anchor is preserved 100% of the time; dismissing the peek restores instant orientation without scroll loss.

### 1.4. Motor Fatigue & Cognitive Depletion at 8–12 WPM
- **The Misconception**: Disabled users simply need a standard text box with a spell-checker.
- **Clinical Reality**: Individuals with spasticity, cerebral palsy, muscular dystrophy, or severe dysgraphia type at **8–12 words per minute (WPM)**. At this throughput, **virtually 100% of cognitive working memory is exhausted by physical key finding and motor compensation**, starving the brain's creative and organizational faculties.
- **The Therapeutic Lever**: **Telegraphic Intent Expansion & Binary Gatekeeper Review**:
  - The user enters low-effort intent shorthand (e.g., `"point 1 ramps too steep city park need fix"`).
  - The AI agent infers structural logic and expands fragments into eloquent prose while enforcing voice-preservation entropy guardrails.
  - The author conducts a **Binary Review** (e.g. `Space` = Accept, `Backspace` = Reject) with zero fine-motor cursor dragging.

---

## 2. Master Feature Specification

NOD groups its feature suite into three foundational pillars: **Reading & Cognitive Ingestion**, **Spatial & Visual Ergonomics**, and **Low-Bandwidth Agentic Authoring**.

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                               NOD MASTER FEATURE MATRIX                                │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ 1. READING & COGNITION   │ 2. SPATIAL & ERGONOMICS     │ 3. LOW-BANDWIDTH AUTHORING    │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ • Plain-Language Engine  │ • Anti-Halation Tint Palettes│ • Telegraphic Intent Expander │
│ • Inline "Peek" Drawer   │ • Typographic Decoupling    │ • Auto-Semantic Structuring   │
│ • Bionic Saccadic Guides │ • Tremor-Tolerant Targets   │ • Voice-Cadence Normalization │
│ • Isolated Line Ruler    │ • Clamped Line Length       │ • Binary Single-Key Review    │
│ • Visual Anchor Markers  │ • Sensory Focus Tunnel      │ • Voice-Preservation Entropy  │
│ • Dual-Coding Karaoke TTS│ • Context Breadcrumbs (500w)│ • Real-Time Keystroke Vault   │
│ • In-Context Idiom Lexicon│ • Dual Cognitive Read Time  │ • Single-Switch Dwell Click   │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

---

## 3. Pillar 1: Reading & Cognitive Ingestion

### 3.1. Plain Language Engine: The WebMCP "Read → Reason → Render" Loop
- **The Core Architecture**: Rather than relying on rigid server-side API calls or pre-computed summaries, simplification is executed dynamically by the **browser AI agent** (ChatGPT Desktop or Chrome) collaborating directly with the user's active DOM session.
- **The Three-Phase Simplification Flow**:
  1. **Phase 1 (Read via WebMCP)**: The agent invokes `get_active_article()`, which extracts the active article's full markdown, reading ease score, and title directly into the agent's LLM context window.
  2. **Phase 2 (Reason in Context)**: The LLM dynamically applies clinical cognitive simplification:
     - Swaps Latinate, polysyllabic vocabulary with high-frequency Anglo-Saxon equivalents (e.g., *"utilize"* → *"use"*, *"subsequently"* → *"after that"*, *"ameliorate"* → *"improve"*).
     - Deconstructs compound, multi-clause sentences into active-voice statements with a strict maximum of **12–15 words per sentence**.
     - Generates 3–5 high-level bulleted working memory anchors (Key Takeaways).
  3. **Phase 3 (Render via WebMCP)**: The agent invokes `render_simplified_view({ simplifiedContent, keyTakeaways })`. The browser's WebMCP handler mutates the local Zustand store, instantly morphing the reading canvas in place without page navigation or layout shifts.
- **Non-Destructive In-Place Toggle**:
  - The UI mounts a persistent, accessible comparison pill switch above the headline:
    `[ Original (Grade 12) ] ● [ ✨ Simplified by NOD (Grade 5) ]`
  - Keyboard shortcut `[ S ]` or a single tap switches between views instantly.
  - Zero spatial disorientation: The reader never leaves the page, and scroll progress is preserved.
- **Audio-Visual Screen Reader Confirmation**:
  - The tool execution dispatches an immediate announcement to `#a11y-announcer`: *"Article simplified into plain English."*
  - The 3D mascot "Nod" performs an animated affirmation tilt.


### 3.2. Inline "Peek" Canvas (Zero-Disorientation Previews)
- **Function**: Clicking any community post or article thumbnail opens a non-navigational sliding split canvas.
- **Rules**:
  - The parent list remains mounted and visible in the background at `30%` opacity with a subtle blur (`backdrop-filter: blur(4px)`).
  - No URL route-clearing. Preserves exact scroll offsets and spatial coordinate memory.
  - Keyboard shortcut `Escape` or tapping the background instantly restores parent focus.

### 3.3. Bionic / Saccadic Guideposts
- **Function**: Algorithmically bolds the initial fixation anchor of every word.
- **Rules**:
  - Words with 1–3 characters: 1 character bolded (`<strong>T</strong>he`).
  - Words with 4–6 characters: 2 characters bolded (`<strong>re</strong>ad`).
  - Words with 7+ characters: first 3 characters bolded (`<strong>pla</strong>tform`).
  - Implemented in a lightning-fast client utility that operates directly on the text nodes without breaking HTML semantics.

### 3.4. Reading Mask / Isolated Line Ruler
- **Function**: Eliminates peripheral vertical crowding during reading.
- **Modes**:
  1. **Line Spotlight**: A 2-line translucent horizontal window (`height: 2.8em`) tracks the cursor, while everything above and below is dimmed to `20%` opacity.
  2. **Paragraph Mask**: Highlights the single paragraph currently hovered or read aloud, masking surrounding blocks to eliminate distraction.

### 3.5. Visual Anchor Markers (Spatial Landmark Icons)
- **Function**: Inserts soft, distinctive landmark icons (e.g., ✦, ◈, ⬡, ❖) in the gutter every 3–4 paragraphs.
- **Clinical Benefit**: Readers with working memory lapses or ADHD who glance away from the screen can re-acquire their exact location in less than 500ms using the nearest visual landmark icon.

### 3.6. Text-to-Speech Synchronous Highlighting (Audio-Visual Dual Coding)
- **Function**: Employs browser speech synthesis with real-time, synchronized word- and sentence-level highlights ("karaoke mode").
- **Clinical Benefit**: Activates dual-coding cognitive pathways (Paivio's Dual-Coding Theory), reinforcing phonetic comprehension through simultaneous auditory and visual stimulation.

### 3.7. In-Context Idiom & Jargon De-cloaker *(New Architectural Enhancement)*
- **Function**: Neurodivergent and autistic readers often struggle with figurative expressions or non-literal idioms.
- **Implementation**: Readers can hover or tap any flagged phrase to view an instant plain-language tooltip without opening a search tab or losing spatial reading rhythm.

---

## 4. Pillar 2: Spatial & Visual Ergonomics

### 4.1. Warm Chromatic Overlays & Anti-Halation Themes
Pre-configured calibrated palettes that banish `#000000` on `#FFFFFF`:

```css
/* Warm Cream (Default Therapeutic Light) */
--theme-cream-bg: #FAF8F5;
--theme-cream-surface: #F2EFE9;
--theme-cream-text: #232529;

/* Warm Peach (High Photopic Sensitivity) */
--theme-peach-bg: #FFF3EB;
--theme-peach-surface: #F9E7DC;
--theme-peach-text: #2B2320;

/* Sage Calming Green (ADHD Focus & Anxiety Reduction) */
--theme-sage-bg: #F2F6F3;
--theme-sage-surface: #E4ECE6;
--theme-sage-text: #1C261F;

/* Muted Slate (Non-Stark Night Mode) */
--theme-slate-bg: #14161F;
--theme-slate-surface: #1E212D;
--theme-slate-text: #DFE2EB;

/* Yellow-on-Black (Severe Visual Impairment / Low Vision) */
--theme-yellow-bg: #0D0E11;
--theme-yellow-surface: #1A1C24;
--theme-yellow-text: #FFEB3B;
```

### 4.2. Dynamic Typographic Scaling Engine & Clamped Line Length
- **Decoupled Sliders**: Users can adjust Letter Spacing (`0.0em` to `0.20em`), Word Spacing (`0.0em` to `0.30em`), and Line Height (`1.5` to `2.2`) independently.
- **Strict Line Clamping**: The content column is strictly constrained between **`50ch` and `65ch`** (`max-width: 65ch`). This prevents the common visual tracking failure where a reader's eye loses its line return across ultra-wide monitors.

### 4.3. Tremor-Tolerant Touch & Click Geometry
- **Minimum Physical Bounding Box**: All buttons, links, toggles, and toolbars have an active target area of at least **`48px × 48px`**.
- **Inactive Gutters**: A minimum of **`16px` of non-interactive space** separates adjacent clickable items, preventing accidental mis-clicks from motor spasticity, tremors, or ataxia.

### 4.4. Sensory Focus Tunnel (ADHD / Autism Spectrum Mode) *(New Architectural Enhancement)*
- **Function**: With one toggle, the entire platform strips peripheral noise: hides author follower counts, sidebars, navigation breadcrumbs, and social metric counters.
- **Result**: The user is left in a pure, uncluttered focus tunnel containing only the text and assistive rulers.

### 4.5. Dual Cognitive Read Time *(New Architectural Enhancement)*
- **The Problem**: Seeing *"3 min read"* is frustrating and demotivating for someone reading at 50 WPM.
- **Implementation**: NOD displays dual read metrics:
  - `Standard Pace: 4 min`
  - `Accessible / Dual-Coded Pace: 11 min`
  - `Cognitive Grade Level: Grade 6 (Flesch: 84 - High Ease)`

---

## 5. Pillar 3: Low-Bandwidth Agentic Authoring (8–12 WPM Engine)

### 5.1. Telegraphic Intent Expansion
- **The Mechanism**: The author inputs raw, low-effort shorthand notes:
  > `"parks issue 1: wheelchair ramps east entrance angle 15 deg too steep illegal city need inspect"`
- **Agent Action**: The WebMCP tool `expand_telegraphic_draft` reconstructs the thought:
  > *"The wheelchair ramp at the east entrance of the city park has a 15-degree incline. This slope exceeds legal accessibility standards and requires immediate city inspection."*
- **Integrity**: Enforces a strict temperature and prompt constraint to never introduce new facts or fabricate arguments.

### 5.2. Automatic Semantic Markup Structuring
- **Function**: Authors do not need to hunt for Markdown buttons or switch keyboard modes.
- **Agent Action**: Automatically structures raw paragraphs into:
  - Semantic Heading tiers (`<h1>`, `<h2>`, `<h3>`)
  - Unordered or numbered lists
  - Important callout boxes (`[!IMPORTANT]`)
  - Pull quotes for emphasized thoughts

### 5.3. Voice-Cadence Normalization (Whisper / Audio Processing)
- **Function**: When using voice input or dictation, individuals with stuttering, dysarthria, or cerebral palsy generate involuntary repetitions, pauses, and verbal fillers.
- **Agent Action**: Smooths stutter repetitions (*"w-w-we went"*) and spastic fillers (*"um", "like", throat clears*) while strictly preserving colloquialisms, regional vernacular, and personal idioms.

### 5.4. Binary "Gatekeeper" Review (Zero-Cursor Fine Motor Editing)
- **The Problem**: Selecting text with a mouse or touch drag requires high fine-motor dexterity that causes severe fatigue.
- **Implementation**:
  - The editor presents revisions as discrete, localized inline diffs.
  - The author steps through proposals using binary single-keystroke inputs:
    - `[ Space ]` or `[ Enter ]` → **Accept edit**
    - `[ Backspace ]` or `[ Esc ]` → **Reject edit & keep original**
    - `[ Tab ]` → **Skip to next proposal**
  - Text editing without moving the mouse cursor.

### 5.5. Voice-Preservation Entropy Guardrails
- **The Guardrail**: To prevent AI homogenizing the author's writing into sterile corporate text, the expansion engine uses an explicit voice preservation prompt:
  - Preserves first-person pronouns and perspective.
  - Retains informal phrasing, emotional cadence, and sentence rhythm.
  - Matches the author's authentic lexical density.

### 5.6. Real-Time Keystroke Vault (Accidental Navigation Guard) *(New Architectural Enhancement)*
- **Function**: For users prone to motor spasms or cognitive lapses who accidentally trigger browser back buttons or refresh shortcuts.
- **Implementation**: Every character typed is immediately snapshotted to `sessionStorage` and `IndexedDB`. In the event of an accidental navigation, reopening the composer restores the exact draft and cursor location with zero data loss.

### 5.7. Single-Switch & Eye-Gaze Dwell Support *(New Architectural Enhancement)*
- **Function**: Complete interface operation for switch-access and eye-tracking users.
- **Implementation**:
  - High-visibility focus indicators: `outline: 3px solid #B4F040; outline-offset: 4px;`
  - Optional Dwell-Click mode (hovering on any button for 1.2 seconds triggers the action automatically without clicking).

---

## 6. Complete WebMCP Tool Specifications for Feature Suite

Every feature in the master specification maps to an imperative WebMCP tool on `document.modelContext`:

```typescript
// 1. DYNAMIC ERGONOMIC TYPOGRAPHY & SPACING
document.modelContext.registerTool({
  name: 'adjust_crowding_and_typography',
  description: 'Modulates spacing mechanics, font family, and contrast overlays to eliminate visual crowding and halation for dyslexic readers.',
  inputSchema: {
    type: 'object',
    properties: {
      fontFamily: { type: 'string', enum: ['lexend', 'atkinson-hyperlegible', 'opendyslexic', 'system'] },
      letterSpacing: { type: 'string', enum: ['normal', 'spacious-0.12em', 'maximum-0.18em'] },
      wordSpacing: { type: 'string', enum: ['normal', 'wide-0.20em', 'maximum-0.30em'] },
      lineHeight: { type: 'string', enum: ['standard-1.6', 'accessible-1.8', 'open-2.0'] },
      contrastTheme: { type: 'string', enum: ['soft-cream', 'warm-peach', 'calming-sage', 'muted-slate', 'yellow-on-black'] }
    }
  },
  execute: async (params) => useStore.getState().setReadingPreferences(params)
});

// 2A. GET ACTIVE ARTICLE (Read into Agent Context)
document.modelContext.registerTool({
  name: 'get_active_article',
  description: 'Reads the active article content, title, and readability score directly into the agent context for cognitive simplification or audio-visual synthesis.',
  inputSchema: {
    type: 'object',
    properties: {} // No arguments needed — extracts what is actively in view
  },
  annotations: { readOnlyHint: true, untrustedContentHint: true },
  execute: async () => {
    const article = useStore.getState().activeArticle;
    if (!article) throw new Error('No article is currently open. Please open an article from the feed first.');
    return {
      id: article.id,
      title: article.title,
      content: article.content.rawMarkdown,
      readingEaseScore: article.a11yMetrics.readingEaseScore,
      wordCount: article.a11yMetrics.wordCount
    };
  }
});

// 2B. RENDER SIMPLIFIED VIEW (Live Client-Side DOM Mutation)
document.modelContext.registerTool({
  name: 'render_simplified_view',
  description: 'Renders the agent-simplified text and key takeaways directly onto the active reading canvas in place of the original text. Mutates the visible UI.',
  inputSchema: {
    type: 'object',
    properties: {
      simplifiedContent: {
        type: 'string',
        description: 'The plain-language, active-voice, short-sentence version generated by the agent.'
      },
      keyTakeaways: {
        type: 'array',
        items: { type: 'string' },
        description: '3 to 5 high-level bulleted summary points for working memory support.'
      }
    },
    required: ['simplifiedContent']
  },
  // Deliberately NO readOnlyHint: Tells browser agent this mutates the visible UI
  execute: async ({ simplifiedContent, keyTakeaways }) => {
    useStore.getState().setSimplifiedView({ simplifiedContent, keyTakeaways, isActive: true });
    useStore.getState().announce('The article has been simplified into plain English.');
    useStore.getState().setMascotMood('nodding');
    return { success: true, message: 'Simplified canvas rendered live.' };
  }
});


// 3. LOW-BANDWIDTH TELEGRAPHIC DRAFT EXPANSION
document.modelContext.registerTool({
  name: 'expand_telegraphic_draft',
  description: 'Expands raw 8-12 WPM telegraphic shorthand notes into structured paragraphs while strictly preserving the author authentic voice.',
  inputSchema: {
    type: 'object',
    properties: {
      rawNotes: { type: 'string', description: 'Unpolished telegraphic intent shorthand' },
      desiredStructure: { type: 'string', enum: ['essay', 'community_post', 'action_proposal', 'guide'] }
    },
    required: ['rawNotes']
  },
  annotations: { readOnlyHint: true },
  execute: async ({ rawNotes, desiredStructure }) => expandDraftContent(rawNotes, desiredStructure)
});

// 4. READING RULER & ISOLATED LINE MASK
document.modelContext.registerTool({
  name: 'toggle_reading_ruler_and_mask',
  description: 'Enables or configures the translucent horizontal reading guide bar and peripheral dimming mask.',
  inputSchema: {
    type: 'object',
    properties: {
      mode: { type: 'string', enum: ['off', 'line_spotlight', 'paragraph_focus'] },
      dimmingLevel: { type: 'number', minimum: 0.1, maximum: 0.8, description: 'Opacity of non-active text' }
    },
    required: ['mode']
  },
  execute: async (settings) => useStore.getState().setMaskSettings(settings)
});

// 5. SYNCHRONOUS AUDIO-VISUAL TTS HIGHLIGHTING
document.modelContext.registerTool({
  name: 'speak_with_dual_coding',
  description: 'Starts speech synthesis with real-time synchronized karaoke-style highlighting of words and sentences.',
  inputSchema: {
    type: 'object',
    properties: {
      action: { type: 'string', enum: ['play', 'pause', 'stop', 'skip_forward', 'skip_backward'] },
      speed: { type: 'number', minimum: 0.75, maximum: 1.5 }
    },
    required: ['action']
  },
  execute: async (control) => audioPlaybackController.dispatch(control)
});
```

---

## 7. Developer & Agent Implementation Checklist

When building UI or features from this specification, verify:
- [ ] Typography respects spacing mechanics: `letter-spacing: 0.12em` and `line-height: 1.8` on accessible presets.
- [ ] No stark black on pure white `#000000 / #FFFFFF` in reading content. Soft cream (`#FAF8F5`) is default.
- [ ] Inline "Peek" Drawer preserves background list visibility with zero URL route amnesia.
- [ ] Interactive click targets are at least `48px × 48px` with `16px` gutters.
- [ ] Drafting editor supports telegraphic expansion without overwriting user voice.
- [ ] Binary gatekeeper allows `Space` to accept and `Backspace` to reject without fine mouse dragging.
- [ ] Synchronized text-to-speech provides dual-coding visual word highlighting.
- [ ] Every feature is wired to its corresponding client-side WebMCP tool.
