# nod

Local WebMCP hackathon starter repository.

## Reference library

Run `powershell -ExecutionPolicy Bypass -File scripts/refresh-webmcp-docs.ps1` to refresh the local WebMCP reference snapshots. The generated source index is at `docs/RESOURCE_INDEX.md`; raw page snapshots live in `docs/snapshots/` and are intentionally ignored so browsing and refresh output never dirties the project.

## First project steps

1. Review [ARCHITECTURE.md](file:///c:/Users/Admin/Desktop/hackathon/nod/ARCHITECTURE.md) for the end-to-end full-stack Next.js, WebMCP, Zustand, and Netlify Blobs storage architecture.
2. Review [ACCESSIBILITY_RESEARCH_AND_FEATURES.md](file:///c:/Users/Admin/Desktop/hackathon/nod/ACCESSIBILITY_RESEARCH_AND_FEATURES.md) for the clinical neuroscience research, master feature matrix, and low-bandwidth authoring mechanics.
3. Review [AGENTS.md](file:///c:/Users/Admin/Desktop/hackathon/nod/AGENTS.md) for the mandatory WebMCP AI alignment contract, exact schemas, and anti-hallucination rules.
4. Review [FRONTEND_DESIGN.md](file:///c:/Users/Admin/Desktop/hackathon/nod/FRONTEND_DESIGN.md) for the NOD brand design system, visual assets, mascot states, and the Two-Layer accessible canvas architecture.
5. Review `docs/RESOURCE_INDEX.md` for official docs, security guidance, demos, templates, hosting, and hackathon support.
6. Build and deploy the app.
7. Test it in ChatGPT's in-app browser or Chrome with the WebMCP testing flag enabled at `chrome://flags/#enable-webmcp-testing`.

