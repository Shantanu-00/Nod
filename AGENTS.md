# AI AGENT ALIGNMENT & ARCHITECTURE SPECIFICATION: WEBMCP
# Project: Dyslexia & Neurodivergent Accessible Social Platform
# Target: OpenAI WebMCP Challenge (Devpost)

> **MANDATORY FOR ALL AI CODING AGENTS (Copilot, Claude, Codex, Gemini, Cursor):**
> Read this document completely before generating or editing code in this repository.
> Every WebMCP tool, schema, and interface in this project must conform to the rules below.

---

## 1. Project Mission & Context

We are building an accessible, WebMCP-powered social platform designed for individuals with dyslexia, ADHD, and reading/writing impairments. 

In this application, AI agents collaborate directly with human users in real time:
- **For Reading**: Dynamically transforming dense text into dyslexia-friendly formats (OpenDyslexic typography, bionic reading fixation, high-contrast tints, plain-English simplifications).
- **For Writing**: Assisting users with phonetic-to-clean drafting, proofreading without stripping personal voice, and formatting posts.
- **For Social Navigation**: Searching community topics and publishing content with clear human consent boundaries.

### Platform & Testing Target
Judges will test this live application using:
1. **ChatGPT Desktop App** via its native in-app browser (WebMCP enabled by default).
2. **Google Chrome (v149+)** with `chrome://flags/#enable-webmcp-testing` enabled.
3. The Chrome extension: **Model Context Tool Inspector**.

### Frontend Design System & Branding
For all UI styling, color tokens, the "NOD" mascot, and the Two-Layer Accessible Canvas architecture, consult **[FRONTEND_DESIGN.md](file:///c:/Users/Admin/Desktop/hackathon/nod/FRONTEND_DESIGN.md)**.

---

## 2. Hard Prohibitions (Anti-Hallucination Directives)

AI models have training data contaminated with outdated drafts and server-side protocols. **You MUST NOT violate any of these rules:**

### ❌ PROHIBITION 1: No Server-Side MCP Packages
- **DO NOT** import `@modelcontextprotocol/sdk` or write Node.js `stdio`/`sse` servers.
- WebMCP is a **browser-native standard** running directly in the browser DOM context via `document.modelContext`.

### ❌ PROHIBITION 2: No Deprecated WebMCP Draft APIs
- **DO NOT USE** `navigator.modelContext.provideContext()`.
- **DO NOT USE** `navigator.modelContext.clearContext()`.
- **DO NOT USE** `navigator.modelContext.unregisterTool()`.
- All these methods are obsolete. Any code using them is broken.

### ❌ PROHIBITION 3: No Ghost APIs or Parallel Backends
- **DO NOT** build a separate backend endpoint or distinct business logic for agents.
- WebMCP tools are **thin wrappers around existing frontend functions**.
- When an agent calls a tool, it MUST trigger the exact same application state changes or API calls as a human clicking a button on the screen.

---

## 3. The Mandatory WebMCP Implementation Standard

### 3.1. Registration Signature
Always register tools imperatively on `document.modelContext` and pass an `AbortSignal` for lifecycle management:

```javascript
// Feature detection
const modelContext = document.modelContext ?? navigator.modelContext;

if (modelContext && typeof modelContext.registerTool === 'function') {
  const controller = new AbortController();

  await modelContext.registerTool({
    name: 'tool_name_snake_case',
    description: 'Clear description written for an LLM to decide when and how to invoke this tool.',
    inputSchema: {
      type: 'object',
      properties: {
        paramName: {
          type: 'string',
          description: 'Descriptive guidance for this specific parameter.'
        }
      },
      required: ['paramName']
    },
    annotations: {
      readOnlyHint: true,          // MUST be true for queries/reads; OMIT for mutations/writes
      untrustedContentHint: true  // MUST be true if returning user-generated community content
    },
    execute: async (input) => {
      // Calls existing application logic
      return await executeAction(input);
    }
  }, { signal: controller.signal });
}
```

### 3.2. Tool Lifecycle & Unmounting
Because WebMCP does **not** have an `unregisterTool()` method, removal is handled via `AbortController`:
- **Single Page Apps (React / Vue / Vanilla SPA)**:
  - Register route/view-specific tools when the view mounts.
  - Call `controller.abort()` when the view unmounts so out-of-context tools are not offered to the agent.
- If using React, reference `use-webmcp-tool` ([docs/snapshots/20-usewebmcptool-react-hook.html](file:///c:/Users/Admin/Desktop/hackathon/nod/docs/snapshots/20-usewebmcptool-react-hook.html)).

### 3.3. Security & Annotations Contract (Chrome Security Guide)
Reference: [docs/snapshots/04-webmcp-tool-security-guide.html](file:///c:/Users/Admin/Desktop/hackathon/nod/docs/snapshots/04-webmcp-tool-security-guide.html)
1. **`readOnlyHint`**:
   - Set to `true` on tools that only inspect, read, or calculate without side effects.
   - **OMIT** on state-changing tools (e.g. `publish_post`, `adjust_reading_mode`). The absence of `readOnlyHint` signals to the AI agent (e.g. ChatGPT) that it must confirm with the human user before executing.
2. **`untrustedContentHint`**:
   - **MUST be set to `true`** on any tool returning community posts, user comments, or user profiles. This prevents indirect prompt injection from malicious post payloads.
3. **Character Budgets**:
   - Tool description: ≤ 500 characters.
   - Parameter description: ≤ 150 characters.
   - Tool output payload: ≤ 1,500 characters (return compact summaries, count fields, and truncated previews if necessary).

### 3.4. Human-in-the-Loop & Live Visual Feedback
- An agent operates in the browser while the human user is actively watching.
- Every state mutation tool **MUST dispatch an event or immediately update visible DOM / reactive state**.
- If a post is created or font is changed, the page must visibly re-render immediately.

### 3.5. Error Handling Contract
- Do **NOT** return vague codes like `"Error: 500"` or `"400 Bad Request"`.
- Throw descriptive errors that explain to the model how to fix its arguments:
  ```javascript
  if (!input.query || input.query.trim().length < 2) {
    throw new Error('Search query is required and must contain at least 2 characters.');
  }
  ```

---

## 4. Official Core Tool Specifications for this Platform

Every AI agent implementing WebMCP tools in this repository must implement these 5 canonical tools:

### Tool 1: `adjust_reading_mode`
- **Purpose**: Controls visual accessibility overlays and typography to eliminate visual stress for dyslexic users.
- **Type**: UI Mutation (Changes page appearance).
- **Annotations**: None (Do NOT set `readOnlyHint`).
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "fontFamily": {
      "type": "string",
      "enum": ["opendyslexic", "lexend", "system"],
      "description": "Accessible typeface preference to aid character discrimination."
    },
    "bionicReading": {
      "type": "boolean",
      "description": "When true, highlights the initial letters of words to guide eye fixations."
    },
    "letterSpacing": {
      "type": "string",
      "enum": ["normal", "wide", "extra-wide"],
      "description": "Character kerning spacing to prevent visual crowding."
    },
    "lineHeight": {
      "type": "string",
      "enum": ["normal", "relaxed", "loose"],
      "description": "Vertical space between lines of text."
    },
    "contrastTheme": {
      "type": "string",
      "enum": ["standard", "soft-cream", "dark", "yellow-on-black"],
      "description": "High contrast or tinted backgrounds to reduce glare and visual distortions."
    },
    "readingRuler": {
      "type": "boolean",
      "description": "Toggles a translucent horizontal reading guide bar under the cursor."
    }
  }
}
```

### Tool 2A: `get_active_article`
- **Purpose**: Reads the currently open article's full markdown content, title, and readability score directly into the browser AI agent's LLM context window.
- **Type**: Read.
- **Annotations**: `{ readOnlyHint: true, untrustedContentHint: true }`.
- **Schema**:
```json
{
  "type": "object",
  "properties": {}
}
```

### Tool 2B: `render_simplified_view`
- **Purpose**: Directly mutates and re-renders the active reading canvas with the agent's plain-English, cognitive-friendly text and key takeaways. Activates the in-place non-destructive comparison switch.
- **Type**: UI Mutation (Changes page content).
- **Annotations**: None (Deliberately omit `readOnlyHint` so browser agents signal a visible interface update).
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "simplifiedContent": {
      "type": "string",
      "description": "The plain-language, short-sentence simplified version of the article generated by the agent."
    },
    "keyTakeaways": {
      "type": "array",
      "items": { "type": "string" },
      "description": "3 to 5 high-level bulleted summary points for working memory support."
    }
  },
  "required": ["simplifiedContent"]
}
```


### Tool 3: `assist_draft_content`
- **Purpose**: Assists the user in writing or refining a post/comment. Converts phonetic spelling, stream-of-consciousness, or speech-to-text into clear sentences while preserving the author's authentic voice.
- **Type**: Transform.
- **Annotations**: `{ readOnlyHint: true }`.
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "rawText": {
      "type": "string",
      "description": "The unpolished, phonetic, or rough thoughts provided by the user."
    },
    "intent": {
      "type": "string",
      "enum": ["spelling_grammar_cleanup", "shorten_and_clarify", "restructure_as_discussion"],
      "description": "The specific editorial assistance desired."
    }
  },
  "required": ["rawText"]
}
```

### Tool 4: `search_discussions`
- **Purpose**: Searches community posts, resources, and shared dyslexia strategies.
- **Type**: Read.
- **Annotations**: `{ readOnlyHint: true, untrustedContentHint: true }`.
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "Keywords, e.g., 'audiobooks', 'screen readers', or 'school accommodations'."
    },
    "category": {
      "type": "string",
      "enum": ["all", "tips", "stories", "questions", "resources"],
      "description": "Filter by community tag or category."
    }
  },
  "required": ["query"]
}
```
- **Output Standard**: Always return `{ query, resultCount, results: [...] }` so that an empty result (`resultCount: 0`) is explicitly recognized by the model rather than misinterpreted as an error.

### Tool 5: `stage_and_publish_post` (alias: `publish_post` / `publish_article`)
- **Purpose**: Prepares a post and mounts the on-screen Publishing Approval Card for human verification before persisting to Netlify Blobs.
- **Type**: Mutation with External Side Effects.
- **Annotations**: None (Deliberately omit `readOnlyHint` so browser agents require user verification).
- **Schema**:
```json
{
  "type": "object",
  "properties": {
    "title": {
      "type": "string",
      "description": "Accessible title of the post (keep under 120 characters)."
    },
    "content": {
      "type": "string",
      "description": "Richly structured markdown. MUST format with '## ' headers every 2-3 paragraphs, '**bold**' anchor concepts, '-' bullet points, and '>' quotes. Keep paragraphs under 3 sentences to prevent visual crowding."
    },
    "category": {
      "type": "string",
      "enum": ["strategies", "stories", "technology", "discussion"],
      "description": "Topic category tag."
    },
    "tags": {
      "type": "array",
      "items": { "type": "string" },
      "description": "Topic tags (e.g. ['adhd', 'focus', 'reading'])."
    }
  },
  "required": ["title", "content", "category"]
}
```

---

### 4.1. The AI Agent Formatting & Typography Standard (Serving Neurodivergent Readers)

An agent connecting to NOD via WebMCP is not merely generating text; it is actively co-authoring for readers who struggle with visual crowding, photopic sensitivity, and working memory decay.

**The Golden Rules for Agent-Generated Markdown:**
1. **Never Output Dense Walls of Plain Text**: Unbroken paragraphs create "rivers of white" and visual distortions for dyslexic readers.
2. **Spatial Landmark Headings (`## Section Title`)**: Insert an `##` heading every 2 to 3 paragraphs to provide clear visual and mental anchor points.
3. **Anchor Bolding (`**key concept**`)**: Bold 2 to 4 critical anchor words per section. This mimics bionic reading fixation and helps readers maintain their saccadic scan path.
4. **Working Memory Bullet Points (`- List item`)**: Multi-step strategies, takeaways, or recommendations must be rendered as bullet points rather than long compound sentences.
5. **Pull Quotes (`> "Insight"`)**: Use markdown blockquotes to isolate memorable thoughts and emotional anchors.
6. **Paragraph Budget**: Maximum 2 to 3 sentences per paragraph.

---

## 5. Canonical Repository References

When in doubt, cross-reference these downloaded snapshots in `docs/snapshots/`:
1. **[docs/snapshots/35-webmcp-starter.html](file:///c:/Users/Admin/Desktop/hackathon/nod/docs/snapshots/35-webmcp-starter.html)**: Canonical practical guide, prompt patterns, and AbortController architecture.
2. **[docs/snapshots/02-webmcp-developer-documentation.html](file:///c:/Users/Admin/Desktop/hackathon/nod/docs/snapshots/02-webmcp-developer-documentation.html)**: Official Chrome WebMCP Developer Documentation.
3. **[docs/snapshots/04-webmcp-tool-security-guide.html](file:///c:/Users/Admin/Desktop/hackathon/nod/docs/snapshots/04-webmcp-tool-security-guide.html)**: Official Security, Injection Protection, and Annotations Guide.
4. **[docs/snapshots/20-usewebmcptool-react-hook.html](file:///c:/Users/Admin/Desktop/hackathon/nod/docs/snapshots/20-usewebmcptool-react-hook.html)**: Official Chrome Labs React hook lifecycle.
5. **[docs/snapshots/24-debug-webmcp-tools.html](file:///c:/Users/Admin/Desktop/hackathon/nod/docs/snapshots/24-debug-webmcp-tools.html)**: DevTools debugging guide.

---

## 6. Implementation Checklist for Agents

Before declaring a WebMCP feature complete, ensure:
- [ ] Feature detection exists: `if (modelContext && typeof modelContext.registerTool === 'function')`.
- [ ] Fallback: App works 100% seamlessly for human users even if WebMCP is absent.
- [ ] Every tool has `name`, `description`, `inputSchema`, and `execute`.
- [ ] `inputSchema` is standard JSON Schema with explicit property descriptions.
- [ ] Read tools have `annotations: { readOnlyHint: true }`.
- [ ] Community content tools have `annotations: { untrustedContentHint: true }`.
- [ ] Mutation tools have NO `readOnlyHint` and dispatch visual updates to the DOM.
- [ ] `AbortController` handles unregistration on unmount.
- [ ] No mention of `navigator.modelContext.provideContext()`.
- [ ] A visible on-page debug indicator or badge confirms `modelContext` detection and registered tool count.
