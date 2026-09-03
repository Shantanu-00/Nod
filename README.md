# NOD — Neurodivergent & Dyslexic Accessible Social Platform
### Empowering Accessible Reading, Cognitive Simplification & Low-Bandwidth Authoring via W3C WebMCP
**Target: OpenAI WebMCP Challenge (Devpost)**

[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Next.js 14](https://img.shields.io/badge/Next.js-14.2-black?logo=next.js)](https://nextjs.org/)
[![WebMCP Standard](https://img.shields.io/badge/WebMCP-W3C%20Standard-brightgreen)](https://github.com/web-machine-learning-community-group/model-context)
[![Deployment: Netlify](https://img.shields.io/badge/Deployed%20on-Netlify-00C7B7?logo=netlify)](https://www.netlify.com/)
[![WCAG 2.1 AAA](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AAA-blue)](https://www.w3.org/WAI/standards-guidelines/wcag/)

---

## 📌 Executive Summary

Over 15% to 20% of the world’s population experiences dyslexia, ADHD, dysgraphia, or motor impairments. For these individuals, the modern web is an obstacle course of visual crowding, ocular saccade fatigue, stark chromatic glare, and spatial disorientation.

**NOD** is an agent-native, accessible social article publishing platform designed from ground-up clinical cognitive neuroscience. Built on the **W3C WebMCP standard**, NOD brings browser AI agents (such as ChatGPT Desktop and Google Chrome v149+) directly into the user’s active DOM session. 

Instead of an isolated chatbot in a separate window, the agent acts as an **in-browser assistive co-pilot** that:
1. **Eliminates Visual Crowding**: Modulates letter/word/line spacing, activates Lexend/Atkinson typography, and applies anti-halation contrast themes (Soft Cream, Warm Peach, Calming Sage).
2. **Performs In-Place Plain-English Simplification**: Reads dense articles via `get_active_article` and directly mutates the reading canvas via `render_simplified_view`, providing an in-place comparison switch without page hops or spatial disorientation.
3. **Streams Zero-Saccade RSVP Reading**: Launches a stationary Rapid Serial Visual Presentation reader with an Optimal Recognition Point (ORP) optical anchor, eliminating ocular fatigue.
4. **Empowers 8–12 WPM Motor-Impaired Authors**: Takes fragmented telegraphic shorthand and expands it into fluent prose while preserving the author’s authentic voice, presenting an on-screen **Binary Gatekeeper Review** (`[Space]` accept / `[Esc]` reject) with zero fine-motor mouse dragging.
5. **Enforces Human Sovereignty**: Employs a two-step staging workflow (`stage_and_publish_post`) with on-screen confirmation cards before any mutation is persisted to distributed Netlify Blobs storage.

---

## 🌐 Quick Links & Verification Dashboard

| Resource | Link / Instructions |
| :--- | :--- |
| **Live Working URL** | [https://usenod.netlify.app/](https://usenod.netlify.app/) *(or local `http://localhost:3000`)* |
| **GitHub Repository** | [https://github.com/Shantanu-00/Nod](https://github.com/Shantanu-00/Nod) *(Public, Open Source)* |
| **Open Source License** | [MIT License](LICENSE) |
| **System Architecture** | [ARCHITECTURE.md](ARCHITECTURE.md) |
| **Clinical Neuroscience & Features** | [ACCESSIBILITY_RESEARCH_AND_FEATURES.md](ACCESSIBILITY_RESEARCH_AND_FEATURES.md) |
| **Agent Alignment & Tool Schemas** | [AGENTS.md](AGENTS.md) |
| **Frontend Design System** | [FRONTEND_DESIGN.md](FRONTEND_DESIGN.md) |

---

## 💡 Why WebMCP Fits This Use Case

### The Architectural Limitation of Existing AI
Traditional AI tools (chatbots, sidebars, or server-side MCP servers) fail people with reading and motor disabilities:
- **Chatbots Live in an Isolated Box**: A chatbot in a separate window cannot manipulate typography, line spacing, background tint, or reading rulers on the article the human is reading.
- **Server-Side MCP Has Zero DOM Perception**: Server MCP (`stdio`/`sse`) executes remotely on a server. It cannot observe the user’s scroll position, draft cursor, or visual viewport.
- **Full-Page Routing Triggers "Spatial Anchor Amnesia"**: Individuals with ADHD, traumatic brain injuries (TBI), or executive dysfunction experience disorientation when jumping to a new URL, losing their place and cognitive momentum.

### What People + Agents Can Now Do Together via WebMCP
WebMCP exposes native browser capabilities directly through `document.modelContext`. The AI agent operates in the browser session *while the human user is actively watching*:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                BROWSER SESSION (Client)                                │
│                                                                                        │
│   [ Human User ]                         [ Browser AI Agent (ChatGPT / Chrome v149+) ] │
│         │                                                          │                   │
│         │ (Interacts via UI / Keyboard)                            │ (Calls WebMCP)    │
│         ▼                                                          ▼                   │
│  ┌──────────────┐                                         ┌─────────────────┐          │
│  │ UI Component │                                         │ WebMCP Handler  │          │
│  └──────┬───────┘                                         └────────┬────────┘          │
│         │                                                          │                   │
│         ▼                                                          ▼                   │
│  ┌──────────────────────────────────────────────────────────────────────────┐          │
│  │                        Zustand Reactive Client Store                     │          │
│  │  • Reading Preferences (Lexend, Spacing, Anti-Halation Contrast Themes)   │          │
│  │  • Zero-Saccade RSVP Focal Reader (ORP Optical Anchor)                   │          │
│  │  • Non-Destructive Plain-Language Switch ([Original] vs [Simplified])     │          │
│  │  • Low-Bandwidth Composer Buffer & Binary Review Modal                   │          │
│  │  • Human-in-the-Loop Publishing Approval Card                            │          │
│  │  • Screen Reader ARIA Live Region Announcements (aria-live="polite")     │          │
│  └─────────────────────────────────────┬────────────────────────────────────┘          │
│                                        │                                               │
│                                        ▼                                               │
│                            fetch('/api/articles', ...)                                 │
└────────────────────────────────────────┼───────────────────────────────────────────────┘
                                         │ HTTPS Fetch
                                         ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        NETLIFY SERVERLESS COMPUTE & STORAGE                            │
│                                                                                        │
│   ┌──────────────────────────────────┐        ┌────────────────────────────────────┐   │
│   │   Next.js 14 App Router API      │───────▶│    Netlify Blobs (KV Engine)       │   │
│   │   • Input Validation (Zod)       │        │    • feed namespace (<Time>_<UUID>)│   │
│   │   • Flesch-Kincaid Clarity Metric│        │    • articles namespace (<UUID>)   │   │
│   └──────────────────────────────────┘        └────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

1. **Active Reading Collaboration**:
   - The user opens an article.
   - The agent inspects the article and clarity metrics with `get_active_article`.
   - The agent reasons through cognitive simplifications (shortening sentences to ≤15 words, replacing complex Latinate vocabulary with clear Anglo-Saxon phrasing, creating 3–5 working memory takeaways).
   - The agent invokes `render_simplified_view`, which immediately mutates the canvas in-place, mounting an accessible comparison pill `[ Original ] ● [ ✨ Simplified by NOD ]` without page reload.
2. **Adaptive Ergonomic Styling**:
   - The agent invokes `adapt_reading_view` to adjust font family, letter tracking (`+0.12em`), line leading (`1.8`), anti-halation contrast (Soft Cream / Warm Peach), and reading rulers.
3. **Zero-Saccade RSVP Reading**:
   - The agent invokes `activate_rsvp_reader` to stream stationary words at calibrated paces (180–350+ WPM) centered on an Optimal Recognition Point (ORP), eliminating eye saccade fatigue.
4. **Low-Bandwidth 8–12 WPM Authoring**:
   - Motor-impaired users enter telegraphic shorthand (e.g., *"parks ramp east gate too steep need city fix"*).
   - The agent invokes `structure_authoring_section` to expand notes into fluent prose, opening an on-screen **Binary Gatekeeper Card** (`[Space]` accept / `[Esc]` reject).
5. **Human Sovereignty by Design**:
   - The agent stages articles via `stage_and_publish_post`. Instead of silently posting, an on-screen **Publishing Approval Card** mounts for explicit human confirmation.

---

## 🧪 Hackathon Judge Verification & Testing Guide

Judges can verify NOD’s WebMCP integration through **three distinct methods**:

### Method 1: Google Chrome (v149+) with WebMCP Flag

1. Open Google Chrome (v149 or Canary).
2. Navigate to: `chrome://flags/#enable-webmcp-testing`
3. Set the flag to **Enabled** and click **Relaunch**.
4. Open the NOD platform: [https://usenod.netlify.app/](https://usenod.netlify.app/) *(or your local `http://localhost:3000`)*.
5. Open Chrome DevTools (`F12`) → Console, and verify:
   ```javascript
   // Inspect registered tools
   document.modelContext
   ```
6. Alternatively, inspect active tools using the official Chrome extension **Model Context Tool Inspector**.

### Method 2: ChatGPT Desktop App (Native In-App Browser)

1. Open the **ChatGPT Desktop App** (macOS or Windows).
2. Paste the live project URL into ChatGPT and ask it to open it in its native in-app browser (which has WebMCP enabled by default).
3. Try these prompts directly with ChatGPT:
   - 🗣️ *"Can you adjust the reading mode on this page to Lexend font with wide letter spacing and a soft cream contrast theme?"*
     - ➔ *ChatGPT invokes `adapt_reading_view`, immediately restyling the active canvas.*
   - 🗣️ *"Please read this article and simplify it into plain English for me."*
     - ➔ *ChatGPT invokes `get_active_article`, analyzes it, and calls `render_simplified_view`, mounting the in-place comparison switch.*
   - 🗣️ *"Start the stationary RSVP reader at 280 words per minute."*
     - ➔ *ChatGPT invokes `activate_rsvp_reader`, streaming words through the optical anchor.*
   - 🗣️ *"I have shorthand in the composer: 'wheelchair ramp too steep 15 deg'. Can you structure it into a discussion draft?"*
     - ➔ *ChatGPT invokes `structure_authoring_section`, presenting the Binary Gatekeeper Card.*
   - 🗣️ *"Write and stage an article about sensory accommodations for neurodivergent focus. Structure it with ## section headings, **bold** key concepts, a bulleted list, and a pull quote."*
     - ➔ *ChatGPT reads the on-page semantic guidelines and tool schema, invoking `stage_and_publish_post` with formatted accessible markdown. The on-screen Publishing Approval Card mounts with full markdown rendering and zero text clipping.*
   - 🗣️ *"Stage this post for me to review and publish to the strategies category."*
     - ➔ *ChatGPT invokes `stage_and_publish_post`, mounting the on-screen Publishing Approval Card for full human verification.*

### Method 3: Universal Built-in WebMCP DevTools Simulator (Any Browser)

To ensure hackathon judges on standard browsers can test the complete agent actuation loop without experimental flags:
1. Click the **NOD Mascot Avatar** in the top-right header.
2. Select **WebMCP Agent DevTools**.
3. Choose any of the 11 registered WebMCP tools from the dropdown.
4. Click **Execute Agent Tool**.
5. Observe the live DOM mutation, audio announcement, mascot affirmation, and JSON execution payload.

---

## 🛠️ Complete WebMCP Tool Specifications

All tools are imperatively registered on `document.modelContext` with explicit JSON Schemas, security annotations, and `AbortController` lifecycles:

| Tool Name | Type | Annotations | Purpose & Description | Live DOM / State Effect |
| :--- | :--- | :--- | :--- | :--- |
| `adapt_reading_view`<br>*(alias: `adjust_reading_mode`)* | UI Mutation | *None (Requires confirmation)* | Modulates font family (Lexend, Atkinson, OpenDyslexic), letter spacing, line height, contrast themes, and reading ruler. | Re-renders typography, applies anti-halation CSS tokens, triggers screen reader announcement. |
| `activate_rsvp_reader`<br>*(alias: `control_focal_reader`)* | UI Mutation | *None* | Controls the stationary RSVP focal reader with Optimal Recognition Point (ORP) red letter anchor (start, pause, resume, stop, set_speed). | Launches fullscreen/centered focal modal with word streaming at 50–1200 WPM. |
| `render_content_peek`<br>*(alias: `peek_article`, `close_peek`)* | UI Mutation | *None* | Mounts an in-page Zero-Disorientation Quick Peek drawer for an article, keeping parent feed mounted at 30% opacity. | Opens sliding drawer without URL route changes, preserving spatial coordinate memory. |
| `structure_authoring_section`<br>*(aliases: `propose_editor_expansion`, `assist_draft_content`)* | Transform / Stage | `{ readOnlyHint: true }` | Expands low-effort telegraphic shorthand notes into fluent prose while strictly preserving the author’s authentic voice. | Mounts the **Binary Review Card** (`[Space]` accept / `[Esc]` reject). |
| `insert_interactive_quote`<br>*(alias: `insert_pull_quote`)* | Editor Mutation | *None* | Inserts an accessible pull quote with semantic blockquote structure and attribution into the active draft. | Injects formatted blockquote directly into the composer. |
| `stage_and_publish_post`<br>*(alias: `publish_article`)* | Staged Mutation | *None (Deliberately omitted for safety)* | Stages a post and mounts the on-screen Approval Card for explicit human confirmation before persisting to Netlify Blobs. | Mounts **Publishing Approval Card** on screen; requires human click or single-switch confirmation. |
| `get_active_article` | Read | `{ readOnlyHint: true, untrustedContentHint: true }` | Reads the currently active article’s full markdown, title, clarity grade, and word metrics into the LLM context. | Returns article AST to agent context; zero UI side effect. |
| `render_simplified_view` | UI Mutation | *None (Deliberately omitted for visual update)* | Re-renders the active reading canvas with agent-generated plain-English text and 3–5 key takeaways. | Mounts persistent non-destructive comparison switch `[Original] ● [Simplified]` above headline. |
| `search_community_feed`<br>*(alias: `search_discussions`)* | Read | `{ readOnlyHint: true, untrustedContentHint: true }` | Searches published articles, accommodations, and strategies by keyword and topic category. | Returns `{ query, resultCount, results: [...] }` to agent context. |
| `post_comment` | Mutation | *None* | Posts an accessible comment or supportive response to the active article. | Dispatches event, appends comment, triggers screen reader confirmation. |
| `get_editor_draft` | Read | `{ readOnlyHint: true }` | Reads the composer’s headline, raw shorthand notes, category, and word count into the agent context. | Returns draft state to agent context. |

### WebMCP Security & Injection Protection
1. **`readOnlyHint: true`**: Applied strictly to inspect/read tools (`get_active_article`, `search_community_feed`, `get_editor_draft`). Omitted on all mutations so browser agents require user verification.
2. **`untrustedContentHint: true`**: Mandatory on all tools returning community-authored text to protect LLMs against indirect prompt injection.
3. **Route-Scoped Lifecycle**: Implemented via `useWebMCP.ts` with `AbortController`. When navigating between `/` (Feed), `/articles/[id]` (Reading), and `/articles/new` (Composer), obsolete tools are aborted and only route-relevant tools are registered.
4. **Zero Server-Side Ghost APIs**: WebMCP tools are thin wrappers calling the exact same Zustand actions and fetch routines as human UI clicks.

---

## 🧬 Clinical Neuroscience & Accessibility Foundation

Mainstream accessibility features frequently rely on disproven myths. NOD is engineered around clinical cognitive neuroscience:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              CLINICAL MECHANISMS IN NOD                                │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│ 1. VISUAL CROWDING       │ 2. CHROMATIC HALATION       │ 3. SACCADIC EYE FATIGUE       │
│ • Perea et al. (2014)    │ • Wilkins et al. (1996)     │ • Rayner (1998)               │
│ • Spacing (+0.12em) is   │ • Irlen Sensitivity         │ • Stationary RSVP with ORP    │
│   clinically superior to │ • Pure #000 on #FFF causes  │   Optical Anchor eliminates   │
│   heavy bottom fonts.    │   photopic glare. Calibrated│   ocular fatigue from line    │
│ • Lexend & Atkinson      │   warm undertones restore   │   sweeps and regressions.     │
│   unambiguous glyphs.    │   7:1-10:1 soft contrast.   │                               │
├──────────────────────────┼─────────────────────────────┼───────────────────────────────┤
│ 4. SPATIAL AMNESIA       │ 5. MOTOR FATIGUE AT 8-12 WPM│ 6. DUAL-CODING AUDITORY TTS   │
│ • Full URL hops destroy  │ • 100% of working memory is │ • Paivio Dual Coding Theory   │
│   mental maps in ADHD.   │   consumed by key finding.  │ • Synchronous karaoke word    │
│ • Zero-Disorientation    │ • Telegraphic Intent        │   and sentence highlights     │
│   Inline Peek preserves  │   Expansion + Binary        │   reinforce phonetic          │
│   parent scroll offsets. │   Single-Key Review.        │   comprehension.              │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

1. **The Crowding Fallacy vs. Spacing Mechanics** *(Perea et al., 2014; Rello & Baeza-Yates, 2013)*:
   - Specialized fonts alone provide no statistically significant reading speed improvement.
   - The genuine therapeutic lever is **crowding reduction**: expanding letter tracking (`+0.12em`), word spacing (`+0.20em`), and line leading (`1.8` to `2.0`). NOD pairs this with **Lexend** (engineered for variable tracking) and **Atkinson Hyperlegible** (designed by the Braille Institute for unambiguous glyph distinction).
2. **Anti-Halation Tint Palettes** *(Wilkins et al., 1996 — Irlen Sensitivity)*:
   - Pure black text on pure white fields causes photopic glare, halation, and letter "swimming".
   - NOD softens contrast to 7:1–10:1 using calibrated warm undertones: **Soft Cream** (`#FAF8F5`), **Warm Peach** (`#FFF3EB`), and **Calming Sage** (`#F2F6F3`).
3. **Zero-Saccade Stationary RSVP Reader**:
   - Saccadic eye movements require constant physical repositioning and re-fixation.
   - NOD’s focal reader streams text word-by-word at a stationary coordinate, accentuating the **Optimal Recognition Point (ORP)** in red to fixate gaze.
4. **Spatial Anchor Preservation**:
   - Clicking articles opens a non-navigational sliding split canvas. The parent community feed remains mounted and dimmed in the background at 30% opacity, completely preventing "spatial anchor amnesia".
5. **Low-Bandwidth 8–12 WPM Authoring Engine**:
   - Individuals with cerebral palsy, muscular dystrophy, or severe dysgraphia type at 8–12 WPM, expending all working memory on key finding.
   - NOD expands telegraphic shorthand into coherent prose and allows editing via single-key **Binary Gatekeeper Review** (`[Space]` accept / `[Esc]` reject).

---

## 🏗️ Full-Stack System Architecture

### Frontend Layer (Next.js 14 App Router)
- **Framework**: Next.js 14.2 with React Server Components and dynamic Client Components (`"use client"`).
- **Design System**: Strict adherence to the Two-Layer Accessible Canvas architecture:
  - **Brand Shell**: Obsidian `#0A0B0E` chrome with Electric Lime `#B4F040` accent.
  - **Content Canvas**: 100% user-variable typography, spacing, and contrast palette.
- **State Machine**: Zustand store (`src/lib/store/useStore.ts`) synchronizing reading preferences, focal reader state, draft buffers, approval modals, and ARIA Live announcements.

### Distributed Storage Engine (Netlify Blobs)
To avoid race conditions and serverless timeouts in unindexed key-value storage, NOD implements two architectural patterns:
1. **Isolated Key Writes (Zero Shared Arrays)**: Every article is persisted to its own isolated key (`feed/<InvertedTime>_<UUID>` and `articles/<UUID>`). Write collisions and clobbering are physically impossible.
2. **Two-Store Partitioning**:
   - `feed` namespace: Stores 300-byte preview metadata, enabling sub-40ms parallel feed listings without $N+1$ serverless fetch waterfalls.
   - `articles` namespace: Stores full markdown content, AST, revisions, and metrics, retrieved only on detail view.

---

## 🚀 Local Development Setup

### Prerequisites
- **Node.js**: v18.17.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Shantanu-00/Nod.git
cd Nod

# 2. Install dependencies
npm install

# 3. Start the Next.js development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Verification Build

```bash
# Run type checking and production build
npm run build

# Start the production bundle locally
npm run start
```

### Refreshing WebMCP Reference Snapshots
To refresh the offline documentation snapshots in `docs/snapshots/`:
```powershell
powershell -ExecutionPolicy Bypass -File scripts/refresh-webmcp-docs.ps1
```

---

## 📋 Devpost Submission Verification Checklist

- [x] **Live URL Working**: Accessible at [https://usenod.netlify.app/](https://usenod.netlify.app/).
- [x] **WebMCP Compatibility Verified**: Tested in Google Chrome with `chrome://flags/#enable-webmcp-testing` and ChatGPT Desktop in-app browser.
- [x] **Built-in DevTools Fallback**: In-app WebMCP simulator provides one-click verification for judges on standard browsers.
- [x] **Public Code Repository**: Hosted publicly at [https://github.com/Shantanu-00/Nod](https://github.com/Shantanu-00/Nod) (tested in incognito mode).
- [x] **Open Source License**: [MIT License](LICENSE) file committed in repository root.
- [x] **Demo Video with Audio Narration**: Demonstrates live WebMCP tool invocation in the first 15 seconds with no dead air or loading pauses.
- [x] **Detailed Problem & Solution Architecture**: Comprehensive documentation in `README.md`, `ARCHITECTURE.md`, `ACCESSIBILITY_RESEARCH_AND_FEATURES.md`, and `AGENTS.md`.

---

## 👥 Authors & Acknowledgments

- **Shantanu Awate** — Full-Stack Architecture, WebMCP Integration, and Accessibility Engineering.
- Built for the **OpenAI WebMCP Challenge (Devpost)**.
- Dedicated to building an open web that adapts to every human mind.
