# V2 Fast AI Architecture (Gemini Free Tier Optimized)

## Core Philosophy
The prior architecture suffered from token exhaustion and high latency because it generated content strictly page-by-page and reviewed line-by-line. The V2 Architecture resolves this by shifting to a **Chapter-Batching Model** and enforcing rigid **Context Slicing**.

## Key Improvements
1. **Model Hierarchy Execution**: 
   - Uses `gemini-2.5-flash-lite` for lower-complexity reasoning (Strategy, Outlining, and Reviewing) to conserve tokens and cost.
   - Uses `gemini-2.5-flash` natively for the heavy-lifting of content generation (Writing).
2. **Batch Processing**: Instead of dispatching N calls for N pages, the Orchestrator issues 1 call per *Chapter*. The Writer agent intrinsically returns an array of pages in a single structured JSON response.
3. **Structured Enforcements**: All model outputs strictly adhere to `responseSchema` (JSON). No erratic text parsing blockades.
4. **Context Isolation**: The `ContextService` actively cuts off preceding chapter text to ensure we never feed the entire book back into the LLM on subsequent calls.

## Agent Boundaries
- **StrategistAgent**: Resolves vague inputs into crisp overarching topics and core messages.
- **OutlineAgent**: Constructs `ChapterOutline` trees consisting of deep subtopics.
- **WriterAgent**: Given a structured chapter requirement, authors an array of logical pages without duplicating efforts.
- **ReviewAgent**: Performs light syntax cleanup and checks output flow, immediately verifying the chapter draft.
