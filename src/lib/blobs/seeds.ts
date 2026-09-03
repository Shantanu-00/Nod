import { ArticleDetail } from '@/types';
import { calculateReadingMetrics } from '@/lib/utils/a11y-metrics';

export interface SeedArticleRaw {
  id: string;
  title: string;
  summary: string;
  author: {
    id: string;
    name: string;
    handle: string;
    avatar: string;
    badge: string;
  };
  category: 'neurodiversity' | 'technology' | 'strategies' | 'stories' | 'discussion';
  tags: string[];
  likesCount: number;
  commentCount: number;
  coverImage: string;
  content: {
    rawMarkdown: string;
    agentSummary: string;
    keyTakeaways: string[];
  };
  createdAt: string;
  updatedAt: string;
}

export const SEED_ARTICLES_RAW: SeedArticleRaw[] = [
  // 1. Spacing & Saccades
  {
    id: 'seed-001',
    title: 'Why Letter Spacing and Visual Saccades Matter More Than Dyslexia Fonts',
    summary: 'Clinical trials show that character tracking (+0.12em) and generous line leading reduce visual crowding far more effectively than bottom-heavy fonts.',
    author: {
      id: 'author-1',
      name: 'Dr. Maya Chen',
      handle: '@maya_neuro',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=faces',
      badge: 'Cognitive Scientist',
    },
    category: 'strategies',
    tags: ['neuroscience', 'spacing', 'dyslexia', 'typography'],
    likesCount: 38,
    commentCount: 4,
    coverImage: 'https://images.unsplash.com/photo-1507842229458-57790dd40237?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# Why Letter Spacing and Visual Saccades Matter More Than Dyslexia Fonts

For decades, typographers believed bottom-heavy fonts were the single answer to reading difficulties. However, clinical trials in cognitive neuroscience demonstrate a different reality: **crowding reduction** is the true therapeutic lever.

## The Visual Crowding Phenomenon
When letterforms sit too close together, the foveal field experiences character interference. Letters appear to merge, shimmer, or shift positions.

By expanding character tracking by **+0.12em** and word spacing by **+0.20em**, we give each glyph distinct spatial boundaries. Readers can identify words without cognitive exhaustion.

## Key Recommendations
1. Increase line spacing to at least 1.8x.
2. Avoid pure black text on stark white backgrounds to prevent photopic glare.
3. Use variable typefaces like Lexend engineered specifically for track modulation.`,
      agentSummary: 'Research proves that spacing out letters and lines helps dyslexic reading far more than heavy fonts. Warm background tints prevent eye glare and visual distortion.',
      keyTakeaways: [
        'Inter-letter spacing (+0.12em) eliminates character collision.',
        '1.8x line height prevents accidental line skipping.',
        'Calibrated warm cream backgrounds eliminate photopic glare.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 3).toISOString(),
  },

  // 2. Motor Fatigue
  {
    id: 'seed-002',
    title: 'Writing at 10 WPM: Overcoming Motor Fatigue with Shorthand Expansion',
    summary: 'When typing is physically exhausting, hunting for keys drains creative working memory. Here is how telegraphic note-taking changes everything.',
    author: {
      id: 'author-2',
      name: 'Alex Rivera',
      handle: '@alex_creates',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      badge: 'Community Voice',
    },
    category: 'stories',
    tags: ['motor-fatigue', 'shorthand', 'assistive-ai'],
    likesCount: 52,
    commentCount: 7,
    coverImage: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# Writing at 10 WPM: Overcoming Motor Fatigue with Shorthand Expansion

When typing requires intense physical effort, your brain spends all its energy finding keys rather than shaping ideas. For those of us writing at 8 to 12 words per minute, traditional document editors are exhausting.

## Moving from Key-Hunting to Intent
Instead of wrestling with full sentences, I write raw fragments:
- "bus ramp broken 4th street need city fix"
- "called transit 3x no reply"

With assistive agents, these fragments expand into complete, well-reasoned advocacy letters without losing my authentic voice.

## Single-Key Review
Editing with a mouse requires fine motor drag. A binary review system—tapping Space to accept a proposal or Backspace to keep my original phrasing—saves thousands of keystrokes each week.`,
      agentSummary: 'Typing slowly depletes mental energy. Writing fragmented notes and having an agent expand them while preserving your voice keeps your energy focused on ideas.',
      keyTakeaways: [
        'Physical key hunting starves creative working memory.',
        'Telegraphic fragments expand cleanly into structured prose.',
        'Binary keyboard review eliminates painful mouse dragging.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 10).toISOString(),
  },

  // 3. Spatial Anchor Amnesia
  {
    id: 'seed-003',
    title: 'Why URL Routing Triggers Spatial Anchor Amnesia for ADHD Minds',
    summary: 'Navigating to a completely new webpage wipes mental coordinates. An in-place synthesis modal preserves spatial orientation seamlessly.',
    author: {
      id: 'author-3',
      name: 'Sam Oakley',
      handle: '@sam_adhd',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
      badge: 'Product Designer',
    },
    category: 'technology',
    tags: ['adhd', 'ux', 'spatial-memory'],
    likesCount: 29,
    commentCount: 3,
    coverImage: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# Why URL Routing Triggers Spatial Anchor Amnesia for ADHD Minds

In web design, navigating to a new URL is taken for granted. But for individuals with ADHD or traumatic brain injury, wiping the screen clean destroys their mental map.

## The Cognitive Cost of Losing Context
When the previous page disappears, working memory has to reconstruct where you were. You wonder: *Did I finish reading that other post? How many items were in that list?*

## The In-Place Quick Peek Solution
By previewing synthesis in a centered modal while keeping the parent feed visible in the background, your mental spatial landmark remains anchored.`,
      agentSummary: 'Full-page navigation reloads wipe out mental coordinates for ADHD readers. In-place modals preserve context and prevent disorientation.',
      keyTakeaways: [
        'Page hops trigger spatial anchor amnesia.',
        'Centered peek previews maintain working memory.',
        'Instant dismissal restores the exact previous scroll position.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 20).toISOString(),
  },

  // 4. Bionic Reading
  {
    id: 'seed-004',
    title: 'The Neuroscience of Bionic Reading: Guiding Fixation Points in Dyslexia',
    summary: 'By artificially bolding the first 35-50% of words, saccadic jumps become predictable, allowing the brain to complete word shapes without phonetic decoding strain.',
    author: {
      id: 'author-4',
      name: 'Elena Rostova',
      handle: '@elena_readslab',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=faces',
      badge: 'Reading Specialist',
    },
    category: 'neurodiversity',
    tags: ['bionic-reading', 'saccades', 'fixation', 'dyslexia'],
    likesCount: 64,
    commentCount: 9,
    coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# The Neuroscience of Bionic Reading: Guiding Fixation Points in Dyslexia

When fluent readers scan across a sentence, the eye does not glide smoothly. Instead, it performs rapid, discontinuous hops known as **saccades**, punctuated by brief pauses called **fixations**.

For dyslexic and ADHD readers, these saccadic jumps are erratic. The gaze overshoots target syllables, retraces backwards, or lands in visual voids between words.

## Artificial Fixation Anchors
Bionic reading introduces a typographical scaffold: by bolding the initial 35% to 50% of each word, the eye receives an unambiguous visual target. 

\`\`\`
The **bra**in **recog**nizes **fam**iliar **pat**terns **inst**antly.
\`\`\`

## Clinical Observations
- **Fixation Duration**: Reduced by up to 28% across tested college cohorts.
- **Regression Rate**: Rereading frequency drops noticeably when readers follow high-contrast typographic anchors.
- **Working Memory Preservation**: Readers retain more comprehension because energy is spent parsing meaning rather than maintaining visual orientation.`,
      agentSummary: 'Bionic typography bolds the initial letters of words to anchor eye movements. This eliminates erratic eye hops and allows the brain to recognize word patterns faster.',
      keyTakeaways: [
        'Dyslexic reading struggles often stem from erratic eye saccades, not intelligence.',
        'Bolding the initial 35-50% of words provides natural landing targets.',
        'Preserves working memory by cutting regression re-reads by nearly a third.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 28).toISOString(),
  },

  // 5. Visual Stress & Tinted Backgrounds
  {
    id: 'seed-005',
    title: 'Irlen Syndrome & Visual Stress: Why High-Contrast Stark White Screens Trigger Fatigue',
    summary: 'Pure black text (#000) on pure white (#FFF) creates optical halation and glare. Tinted cream, peach, and sage palettes restore reading endurance.',
    author: {
      id: 'author-5',
      name: 'Marcus Vance',
      handle: '@marcus_optics',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop&crop=faces',
      badge: 'Visual Ergonomics',
    },
    category: 'strategies',
    tags: ['irlen-syndrome', 'contrast', 'visual-stress', 'color-tinting'],
    likesCount: 45,
    commentCount: 6,
    coverImage: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# Irlen Syndrome & Visual Stress: Why High-Contrast Stark White Screens Trigger Fatigue

Standard web standards recommend extreme contrast ratios (21:1 pure black on pure white). While mathematically high-contrast, for roughly 46% of individuals with dyslexia and Irlen syndrome, this stark luminosity triggers **visual stress**.

## The Symptoms of Optical Halation
- **Rivering**: White spacing between paragraphs appears to flow through text like water.
- **Vibration & Haloing**: Letters appear to vibrate, blur, or glow around edges.
- **Photophobia**: Headaches, squinting, and mental exhaustion within 15 minutes of screen work.

## The Therapeutic Palette
Replacing #FFFFFF with calibrated warm tones normalizes retinal hyper-reactivity:
1. **Soft Cream (#FAF7EE)**: Neutralizes glare while preserving high legibility.
2. **Warm Peach (#FDF3EC)**: Softens optical sharpness, proven beneficial for blue-sensitive photoreceptors.
3. **Calming Sage (#F0F5F1)**: Lowers ocular stress during extended coding and technical reading sessions.`,
      agentSummary: 'Stark white backgrounds cause letters to shimmer and blur for many neurodivergent readers. Soft cream and calming sage tints eliminate glare and ocular fatigue.',
      keyTakeaways: [
        '21:1 extreme contrast causes ocular glare and text vibration for neurodivergent eyes.',
        'Warm cream and sage palettes eliminate the "rivering" effect in paragraphs.',
        'Proper chromatic tinting enables hours of sustained reading without eye strain.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 36).toISOString(),
  },

  // 6. WebMCP Browser Native Standards
  {
    id: 'seed-006',
    title: 'How WebMCP Turns Browsers into Real-Time Cognitive Co-Pilots',
    summary: 'Moving beyond clunky external extensions: the W3C WebMCP standard lets browser agents inspect, adapt, and transform UI state directly via document.modelContext.',
    author: {
      id: 'author-6',
      name: 'Tasha Patel',
      handle: '@tasha_ai',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=100&h=100&fit=crop&crop=faces',
      badge: 'Web Standards Engineer',
    },
    category: 'technology',
    tags: ['webmcp', 'open-standards', 'ai-assistants', 'future-web'],
    likesCount: 71,
    commentCount: 11,
    coverImage: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# How WebMCP Turns Browsers into Real-Time Cognitive Co-Pilots

For years, assistive tools were stuck in isolated browser extensions or clunky third-party bookmarklets. They could only scrape static text and inject haphazard CSS overrides.

## The Paradigm Shift of document.modelContext
The emerging **WebMCP (Web Model Context Protocol)** standard fundamentally transforms how agents interact with the web:

1. **Zero-Overhead Native Registration**: Web applications imperatively register typed tools directly onto \`document.modelContext\`.
2. **Two-Way Reactive State**: When an agent invokes \`adjust_reading_mode\` or \`render_simplified_view\`, it does not perform clumsy DOM injections. It triggers the application's actual reactive state (Zustand, React, Redux).
3. **Transparent Human Consent**: Mutations intentionally omit \`readOnlyHint\`, ensuring that the user retains executive control before changes take effect.

With WebMCP, AI ceases to be a distant chatbot on another tab—it becomes an integrated, on-canvas cognitive partner.`,
      agentSummary: 'WebMCP allows AI agents to directly communicate with web applications through native browser APIs. This enables instant accessibility adjustments without fragile extensions.',
      keyTakeaways: [
        'WebMCP exposes structured tool APIs directly on document.modelContext.',
        'Tools trigger clean application state updates rather than hacky DOM overrides.',
        'Human-in-the-loop security hints ensure users remain in full control of mutations.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
  },

  // 7. Binary Review Gatekeeper
  {
    id: 'seed-007',
    title: 'The Binary Review Gatekeeper: Preserving Authentic Voice in AI-Assisted Writing',
    summary: 'When AI rephrases your work, it often homogenizes your personal style. Here is why single-key Space/Backspace review keeps you in the driver seat.',
    author: {
      id: 'author-7',
      name: 'Julian Sterling',
      handle: '@julian_writes',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=faces',
      badge: 'Author & Neuroadvocate',
    },
    category: 'discussion',
    tags: ['writing-tools', 'voice-preservation', 'accessibility', 'human-agency'],
    likesCount: 57,
    commentCount: 8,
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# The Binary Review Gatekeeper: Preserving Authentic Voice in AI-Assisted Writing

Many dyslexic authors share a common frustration with modern AI editors: *they make everything sound like a corporate press release*.

When an algorithm wipes away idiomatic expressions, sentence cadences, and raw emotion in the name of grammatical perfection, the author loses their voice.

## The Cognitive Dilemma of "Accept All"
When presented with a wall of suggested edits, neurodivergent writers face decision paralysis. Choosing between multiple diffs requires extensive linguistic parsing—the very skill they sought help with.

## The Binary Gatekeeper Paradigm
In NOD, we created the **Binary Review Gatekeeper**:
- **Granular Fragment Decisions**: Edits are displayed sentence by sentence with clear visual highlighting.
- **Effortless Keymapping**: 
  - Hit **[Space]** to accept the clear polish.
  - Hit **[Backspace]** to keep your raw, authentic phrasing.
- **Zero Mouse Fatigue**: The entire review can be completed in seconds without dragging or clicking tiny icon buttons.

Assistive technology should empower human expression, never erase it.`,
      agentSummary: 'AI proofreading often strips away the author personal tone. The Binary Review Gatekeeper lets writers approve or reject edits using simple Space/Backspace keystrokes.',
      keyTakeaways: [
        'Generic AI cleanups often erase unique personal voice and storytelling nuance.',
        'Sentence-by-sentence binary choices prevent decision paralysis.',
        'Keyboard shortcuts (Space to Accept, Backspace to Keep) eliminate motor strain.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 60).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 60).toISOString(),
  },

  // 8. Plain Language Laws
  {
    id: 'seed-008',
    title: 'Cognitive Load Theory: Why 45-Word Academic Sentences Cause Total Working Memory Collapse',
    summary: 'The human working memory buffer holds roughly 4 chunks of information. Dense subordinate clauses cause buffer overflows in neurodivergent readers.',
    author: {
      id: 'author-8',
      name: 'Prof. Henrik Lindqvist',
      handle: '@henrik_neuro',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=faces',
      badge: 'Cognitive Psychology',
    },
    category: 'strategies',
    tags: ['working-memory', 'cognitive-load', 'plain-english', 'education'],
    likesCount: 83,
    commentCount: 14,
    coverImage: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# Cognitive Load Theory: Why 45-Word Academic Sentences Cause Total Working Memory Collapse

Working memory is the psychological workbench of the mind. In classical cognitive psychology (Sweller, 1988), this workbench is recognized as severely finite—typically holding between **3 and 5 conceptual chunks** simultaneously.

## The Anatomical Anatomy of a Buffer Overflow
Consider a typical legal or academic sentence:
> *"Notwithstanding the aforementioned clauses, which were initially ratified during the provisional symposium, the designated delegates, failing to achieve unanimity, consequently deferred implementation indefinitely."*

By the time a dyslexic or ADHD reader reaches "deferred implementation", the initial subjects have slipped out of the working memory register. The reader is forced to re-read the entire block from the beginning.

## Three Structural Rules for Cognitive Accessibility
1. **Sentence Length Cap**: Limit sentences to a maximum of 16 to 20 words.
2. **Single Thought Density**: One main clause per sentence.
3. **Active Voice Primacy**: Clearly designate who is taking the action before describing the result.`,
      agentSummary: 'Dense sentences with multiple clauses exceed the brain working memory limit. Shortening sentences to under 20 words allows readers to retain information without constant re-reading.',
      keyTakeaways: [
        'Working memory can only juggle 3 to 5 conceptual chunks at a time.',
        'Sentences over 25 words force neurodivergent readers to repeatedly re-read paragraphs.',
        'Plain-English structuring delivers equal intellectual depth with zero cognitive exhaustion.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 72).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 72).toISOString(),
  },

  // 9. Workplace Accommodations
  {
    id: 'seed-009',
    title: 'Disclosing Neurodivergence in Tech: Scripts, Tools, and Reasonable Accommodations',
    summary: 'From requesting asynchronous communication to async PR reviews with assistive agents: a practical playbook for thriving as a dyslexic or ADHD developer.',
    author: {
      id: 'author-9',
      name: 'Kavita Sundaram',
      handle: '@kavita_codes',
      avatar: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=100&h=100&fit=crop&crop=faces',
      badge: 'Staff Engineer',
    },
    category: 'stories',
    tags: ['workplace', 'disclosure', 'tech-careers', 'accommodations'],
    likesCount: 68,
    commentCount: 12,
    coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# Disclosing Neurodivergence in Tech: Scripts, Tools, and Reasonable Accommodations

For many neurodivergent engineers and knowledge workers, entering the workplace brings hidden friction: rapid-fire Slack threads, dense Jira ticket descriptions, and unformatted pull requests.

## Reframing Accommodations as High-Performance Infrastructure
Accommodations are not charity; they are optimizations that enable your brain to work at maximum creative throughput.

## High-Leverage Accommodations to Request
1. **Asynchronous Standups**: Written updates using structured bullet points rather than round-robin verbal grilling.
2. **Text Synthesis Tooling**: Permission to run local assistive agents to summarize long corporate communications before meetings.
3. **Extended Code Review Windows**: Dedicated quiet blocks without context switching to review complex pull requests.

## What Changed My Career
Learning that I did not need to hide my dyslexia transformed my work. When I demonstrated that assistive typography and automated summaries allowed me to ship high-quality architecture faster, my team adopted those exact clarity practices across the board.`,
      agentSummary: 'Requesting workplace accommodations like asynchronous updates and assistive reading tools improves performance and prevents burnout for neurodivergent professionals.',
      keyTakeaways: [
        'Workplace accommodations optimize engineering velocity rather than being a drawback.',
        'Asynchronous communication reduces working memory strain during meetings.',
        'Accessibility features like text synthesis benefit the entire organization.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 86).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 86).toISOString(),
  },

  // 10. The Reading Ruler
  {
    id: 'seed-010',
    title: 'The Digital Reading Ruler: Mitigating Vertical Saccadic Drift Across Widescreen Monitors',
    summary: 'On modern high-resolution displays, wide text columns cause readers to lose their vertical place. A translucent reading guide eliminates line skipping.',
    author: {
      id: 'author-10',
      name: 'Liam Gallagher',
      handle: '@liam_ux',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=faces',
      badge: 'Accessibility Specialist',
    },
    category: 'technology',
    tags: ['reading-ruler', 'saccades', 'ux-design', 'assistive-tools'],
    likesCount: 41,
    commentCount: 5,
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80',
    content: {
      rawMarkdown: `# The Digital Reading Ruler: Mitigating Vertical Saccadic Drift Across Widescreen Monitors

When text spans more than 75 characters per line on high-resolution widescreen monitors, the human eye faces a physical challenge: **vertical saccadic drift**.

As your gaze sweeps back from the right end of a line to find the beginning of the next line, it is easy to accidentally jump up or down by one or two rows.

## The Physicality of the Reading Guide
In elementary classrooms, physical plastic reading overlays and colored guide strips have been used for decades. They isolate a single line of text, physically occluding peripheral distractions.

## Bringing the Ruler to the Modern Web
In NOD, we implemented a reactive digital reading ruler:
- **Cursor Synchronization**: Follows mouse cursor or arrow navigation smoothly.
- **Translucent Highlighting**: Emphasizes the active line with a calibrated 32px focus strip while softening surrounding rows.
- **Zero DOM Disruption**: Built with smooth GPU-accelerated transforms without altering layout coordinates.

This simple visual anchor restores reading flow and prevents unintentional line skipping across complex articles.`,
      agentSummary: 'Wide text columns on modern screens cause readers to lose their place when jumping between lines. The Reading Ruler creates a translucent highlight guide that eliminates line skipping.',
      keyTakeaways: [
        'Widescreen displays increase vertical saccadic drift and accidental line skipping.',
        'Translucent reading rulers isolate the current sentence and reduce visual crowding.',
        'GPU-accelerated overlays provide physical-classroom accessibility directly on the web.',
      ],
    },
    createdAt: new Date(Date.now() - 3600000 * 98).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 98).toISOString(),
  },
];

export const SEED_ARTICLES: ArticleDetail[] = SEED_ARTICLES_RAW.map((raw) => ({
  ...raw,
  metrics: calculateReadingMetrics(raw.content.rawMarkdown),
}));
