# Analytics Agent Guide

## Purpose & Overview

The Analytics Agent is your research and strategy specialist. While Developer Agents build and Code Review Agents validate, the Analytics Agent ensures you're using the **best possible approaches** backed by research and industry expertise.

**Key Responsibilities**:
- Research best practices BEFORE implementation
- Analyze multiple solution approaches
- Recommend optimal algorithms and patterns
- Evaluate performance trade-offs
- Review completed work for improvements
- Stay current with web game development techniques

**When to Use**:
- Before starting complex phases (especially Phase 5)
- When multiple implementation options exist
- When performance issues arise
- When stuck on a difficult problem
- After completing phases (quality review)

---

## Quick Start: How to Use Analytics Agent

### Step 1: Identify the Question
What do you need researched?
- "What's the best collision detection algorithm for 500+ entities?"
- "Should we use object pooling or create/destroy for projectiles?"
- "How can we optimize rendering performance?"

### Step 2: Copy Appropriate Template
This guide contains **ready-to-use prompt templates** for common scenarios:
- Pre-Phase Analysis
- Performance Analysis
- Trade-off Comparison
- Best Practices Research
- Algorithm Research
- Technology Stack Analysis
- Post-Implementation Review

### Step 3: Fill in the Template
Replace placeholder text with your specific details:
- Current performance metrics
- Specific problem description
- Constraints and requirements

### Step 4: Give to Analytics Agent (Claude Opus or Gemini)
Paste the completed prompt into a new conversation with Claude Opus or Gemini 2.0.

### Step 5: Review the Research
Analytics Agent will provide:
- Detailed research findings
- Comparison of approaches
- Clear recommendation
- Implementation guidance

### Step 6: Share with Developer Agent
Give the Analytics Agent's report to your Developer Agent along with the regular architecture docs.

---

## Prompt Templates

### Template 1: Pre-Phase Research

**Use when**: Starting a new phase, especially Phases 5-7

```markdown
ANALYTICS AGENT RESEARCH REQUEST

PHASE: [Phase Number and Name]
PROJECT: Vampire Survivors-style browser game
ARCHITECTURE: [Brief summary or link to game_architecture.md]

CURRENT STATE:
- Performance: [FPS, entity counts]
- Completed phases: [List]
- Known issues: [Any existing problems]

RESEARCH REQUEST:
Before implementing [Phase Name], research best practices for [specific systems].

KEY QUESTIONS:
1. [Question 1]
2. [Question 2]
3. [Question 3]

CONSTRAINTS:
- Vanilla JavaScript (ES6 modules)
- Target: 60 FPS with 500+ entities
- Browser-based (Canvas)
- Must work with existing renderer abstraction layer

DELIVERABLE:
Provide a research report including:
1. Industry best practices (5-7 key practices)
2. Comparison of 2-3 implementation approaches
3. Clear recommendation with reasoning
4. Implementation guidance for Developer Agent
5. Common pitfalls to avoid

TIMELINE: [When needed by]
```

**Example - Before Phase 5**:
```markdown
ANALYTICS AGENT RESEARCH REQUEST

PHASE: Phase 5 - Performance Optimization
PROJECT: Vampire Survivors-style browser game

CURRENT STATE:
- Performance: 45 FPS with 300 enemies, 150 projectiles
- Completed phases: 1-4 (Core, Enemies, Combat, Progression)
- Known issues: Collision detection is slow (8-10ms per frame)

RESEARCH REQUEST:
Before implementing Phase 5 optimization, research:
1. Collision detection optimization for 2D games
2. Best spatial partitioning algorithms
3. Entity update optimization techniques

KEY QUESTIONS:
1. Spatial hash vs Quadtree vs Grid - which is best for our use case?
2. Should we implement object pooling? For what entities?
3. What rendering optimizations are essential?

CONSTRAINTS:
- Vanilla JavaScript (ES6 modules)
- Target: 60 FPS with 500+ entities
- Currently using naive O(n²) collision detection
- Must maintain renderer abstraction

DELIVERABLE:
Provide a research report including:
1. Collision detection algorithms compared (3-4 options)
2. Recommendation with benchmarks
3. Step-by-step implementation guide
4. Expected performance gains
5. Pitfalls to avoid

TIMELINE: Before Developer Agent starts Phase 5 implementation
```

---

### Template 2: Performance Problem Analysis

**Use when**: FPS drops, memory issues, or slowdowns

```markdown
PERFORMANCE ANALYSIS REQUEST

PROBLEM: [Describe the performance issue]

SYMPTOMS:
- Current FPS: [Number]
- Target FPS: 60
- When it happens: [Conditions]
- Entity counts: [Numbers]

PROFILING DATA:
[If available, paste performance data]
- Frame time: [ms]
- Update time: [ms]
- Render time: [ms]
- Suspected bottleneck: [System]

CODE CONTEXT:
[Paste relevant code snippets]

REQUEST:
1. Identify the root cause
2. Research 3-5 optimization approaches
3. Compare trade-offs (performance gain vs complexity)
4. Recommend best solution
5. Provide implementation guidance

CONSTRAINTS:
- Cannot break existing architecture
- Must maintain 60 FPS target
- Prefer simpler solutions over complex ones

EXPECTED DELIVERABLE:
- Root cause analysis
- Comparison table of solutions
- Primary recommendation with implementation steps
- Fallback options
- Testing strategy
```

**Example - Collision Detection Bottleneck**:
```markdown
PERFORMANCE ANALYSIS REQUEST

PROBLEM: Collision detection taking too long, causing FPS drops

SYMPTOMS:
- Current FPS: 40-45 FPS
- Target FPS: 60
- When it happens: With 300+ enemies and 100+ projectiles
- Entity counts: 300 enemies, 150 projectiles, 1 player

PROFILING DATA:
- Frame time: 23-25ms (should be 16.67ms)
- Update time: 18ms (too high!)
- Render time: 5ms (fine)
- Collision detection: 12-14ms (bottleneck!)

CODE CONTEXT:
```javascript
// Current naive approach
checkCollisions(projectiles, enemies) {
  for (const proj of projectiles) {
    for (const enemy of enemies) {
      if (circleCollision(proj, enemy)) {
        // handle collision
      }
    }
  }
}
// O(n*m) = O(150 * 300) = 45,000 checks per frame!
```

REQUEST:
1. Why is this so slow?
2. Research collision optimization techniques
3. Compare: Spatial Hash vs Quadtree vs Uniform Grid
4. Which is best for our scenario?
5. What performance gain can we expect?

CONSTRAINTS:
- Must handle circular collision shapes
- Need to check projectile-enemy only (not enemy-enemy)
- Want simple, maintainable solution
- Vanilla JavaScript

EXPECTED DELIVERABLE:
- Root cause explanation
- 3 optimization approaches compared
- Recommended approach with code example
- Expected FPS after optimization
- Testing checklist
```

---

### Template 3: Trade-off Analysis

**Use when**: Choosing between multiple valid approaches

```markdown
TRADE-OFF ANALYSIS REQUEST

DECISION: [What needs to be decided]

CONTEXT:
[Explain the situation and why a decision is needed]

OPTION A: [Approach name]
[Brief description]

OPTION B: [Approach name]
[Brief description]

OPTION C: [Approach name]
[Brief description]

EVALUATION CRITERIA:
1. Performance (most important)
2. Maintainability
3. Implementation complexity
4. Scalability
5. Architecture fit
6. Future flexibility

CONSTRAINTS:
- [Constraint 1]
- [Constraint 2]

REQUEST:
Create a comparison matrix scoring each option (1-10) on each criteria.
Provide detailed analysis of each approach.
Make a clear recommendation with reasoning.

DELIVERABLE:
- Comparison matrix
- Deep dive on each option
- Winner with justification
- Implementation guidance for chosen approach
```

**Example - Object Pooling Decision**:
```markdown
TRADE-OFF ANALYSIS REQUEST

DECISION: Should we use object pooling for projectiles?

CONTEXT:
We create ~10 projectiles per second. Each lives 3-5 seconds.
Maximum on screen: 200 projectiles.
Currently using new Projectile() and letting garbage collector handle cleanup.

OPTION A: Object Pooling
Pre-create a pool of projectile objects, reuse them.
```javascript
const pool = { active: [], inactive: [] };
function spawn() { return pool.inactive.pop() || new Projectile(); }
function despawn(p) { pool.inactive.push(p); }
```

OPTION B: Create/Destroy (current approach)
```javascript
function spawn() { return new Projectile(); }
function despawn(p) { /* let GC handle it */ }
```

OPTION C: Hybrid Approach
Pool up to 100 projectiles, create new ones if pool exhausted.

EVALUATION CRITERIA:
1. Performance (GC pauses vs pooling overhead)
2. Memory usage
3. Code complexity
4. Debugging difficulty
5. Maintenance burden

CONSTRAINTS:
- Must work with existing Projectile class
- No external libraries
- Need to maintain in Phase 5 and beyond

REQUEST:
Which approach is best for our projectile counts?
Provide benchmarks if possible.
Consider that we might also pool enemies later.

DELIVERABLE:
- Performance comparison (GC frequency, frame times)
- Complexity comparison (LOC, maintenance)
- Recommendation with clear reasoning
- If pooling: implementation approach
```

---

### Template 4: Algorithm Research

**Use when**: Need an algorithm for a specific problem

```markdown
ALGORITHM RESEARCH REQUEST

PROBLEM: [Specific algorithmic problem]

INPUT DATA:
- Data size: [e.g., 500 items]
- Data structure: [e.g., array of objects]
- Update frequency: [e.g., every frame, 60fps]

OUTPUT REQUIREMENT:
[What the algorithm needs to produce]

PERFORMANCE TARGET:
Must complete in < [X]ms per call

CURRENT APPROACH:
[If any, describe current algorithm]
Performance: [Current time/complexity]

RESEARCH REQUEST:
1. Survey 4-5 algorithms for this problem
2. Analyze time/space complexity for each
3. Compare real-world performance
4. Recommend best algorithm for our use case
5. Provide pseudocode or implementation sketch

EVALUATION CRITERIA:
- Performance (primary)
- Implementation difficulty (secondary)
- Memory usage (tertiary)

DELIVERABLE:
- Algorithm comparison table
- Complexity analysis (Big O)
- Recommended algorithm with reasoning
- Code sketch in JavaScript
- Testing strategy
```

**Example - Finding Nearest Enemy**:
```markdown
ALGORITHM RESEARCH REQUEST

PROBLEM: Find nearest enemy to player (for weapon auto-targeting)

INPUT DATA:
- Data size: 500 enemies (array of enemy objects)
- Each enemy has: position {x, y}
- Update frequency: Every frame (60 FPS)

OUTPUT REQUIREMENT:
Return the single enemy closest to player position

PERFORMANCE TARGET:
Must complete in < 1ms per call (called every frame for each weapon)

CURRENT APPROACH:
```javascript
function findNearest(playerPos, enemies) {
  let nearest = null;
  let minDist = Infinity;
  for (const enemy of enemies) {
    const dist = distance(playerPos, enemy.position);
    if (dist < minDist) {
      minDist = dist;
      nearest = enemy;
    }
  }
  return nearest;
}
// O(n) = 500 distance calculations per frame
```
Performance: ~0.5ms per call (acceptable but can we do better?)

RESEARCH REQUEST:
1. Is there a faster algorithm than linear search?
2. Can spatial partitioning help?
3. Is the distance calculation optimized? (currently using sqrt)
4. Should we cache results?
5. What do other games do?

EVALUATION CRITERIA:
- Speed (most important)
- Simplicity (prefer simple if speed difference is small)
- Integration with existing collision system

DELIVERABLE:
- Algorithm options (linear search, spatial query, caching, etc.)
- Performance comparison
- Recommended approach
- Optimized JavaScript implementation
```

---

### Template 5: Best Practices Research

**Use when**: Want to ensure you're following industry standards

```markdown
BEST PRACTICES RESEARCH REQUEST

TOPIC: [Specific topic or system]

CONTEXT:
We're implementing [system] and want to follow industry best practices.

SPECIFIC QUESTIONS:
1. [Question 1]
2. [Question 2]
3. [Question 3]

RESEARCH SCOPE:
- Modern web game development (2023-2024)
- JavaScript/Canvas games
- Similar genres (Vampire Survivors, roguelikes)

REQUEST:
Research and compile best practices including:
1. Industry standards (what do top games do?)
2. Performance best practices
3. Code quality best practices
4. Common pitfalls and anti-patterns
5. Code examples (good vs bad)

DELIVERABLE:
## Best Practices Guide: [Topic]

### Critical Do's ✅
[5-7 essential practices with explanations]

### Critical Don'ts ❌
[5-7 anti-patterns to avoid]

### Code Examples
[Good vs bad code with explanations]

### Implementation Checklist
[Step-by-step checklist]

### References
[Articles, tutorials, documentation]
```

**Example - Game Loop Best Practices**:
```markdown
BEST PRACTICES RESEARCH REQUEST

TOPIC: JavaScript Game Loop Implementation

CONTEXT:
We're implementing the core game loop in Phase 1.
Need to ensure we follow best practices for:
- Frame timing
- Delta time calculation
- Browser performance
- Pause/resume handling

SPECIFIC QUESTIONS:
1. Should we use requestAnimationFrame or setInterval?
2. How to calculate deltaTime correctly?
3. How to handle variable frame rates?
4. Should we cap deltaTime to prevent spiral of death?
5. How to handle page visibility (tab switching)?

RESEARCH SCOPE:
- Modern browser games (2023-2024)
- 60 FPS target
- Canvas-based games
- No game engines (vanilla JS)

REQUEST:
Research game loop best practices and provide:
1. Industry standard approach
2. Common mistakes and how to avoid them
3. Performance considerations
4. Code examples (good vs bad)
5. Testing strategies

DELIVERABLE:
Complete best practices guide with code examples
```

---

### Template 6: Technology Stack Evaluation

**Use when**: Considering adding a library or tool

```markdown
TECHNOLOGY EVALUATION REQUEST

TECHNOLOGY: [Library/Tool/Framework name]
PURPOSE: [What problem it solves]

CURRENT SITUATION:
[Describe current approach and why you're considering the tech]

QUESTIONS:
1. Should we use this?
2. When should we introduce it (which phase)?
3. Are there better alternatives?

EVALUATION CRITERIA:
1. Benefits (features, time savings)
2. Costs (bundle size, learning curve)
3. Architecture fit
4. Maintenance burden
5. Long-term viability

CONSTRAINTS:
- Want to keep bundle size small
- Prefer simple solutions
- Must work with our architecture

REQUEST:
Evaluate whether we should use [Technology] including:
1. What problems does it solve?
2. Alternatives comparison
3. Integration analysis
4. Long-term considerations
5. Clear yes/no/maybe recommendation

DELIVERABLE:
Technology evaluation report with recommendation
```

**Example - Howler.js for Audio**:
```markdown
TECHNOLOGY EVALUATION REQUEST

TECHNOLOGY: Howler.js
PURPOSE: Audio management (simpler than Web Audio API)

CURRENT SITUATION:
Using Web Audio API directly for sound effects and music.
It's complex and has browser compatibility quirks.
Considering Howler.js to simplify audio management.

QUESTIONS:
1. Is Howler.js worth the added dependency?
2. How much simpler is it than Web Audio API?
3. Bundle size impact?
4. Any performance differences?

EVALUATION CRITERIA:
1. Simplicity gain (most important)
2. Browser compatibility
3. Bundle size (< 50KB acceptable)
4. Features we need (sprite sheets, fade, etc.)
5. Maintenance status

CONSTRAINTS:
- Want minimal bundle size
- Need cross-browser audio
- May add to Phase 7 (Polish)

REQUEST:
Evaluate Howler.js including:
1. Features vs Web Audio API
2. Bundle size analysis
3. Alternative audio libraries
4. Recommendation with reasoning

DELIVERABLE:
- Should we use it? Yes/No/Later
- If yes: when and how to integrate
- If no: why not, what instead?
```

---

### Template 7: Post-Implementation Review

**Use when**: Phase is complete, want quality check

```markdown
POST-IMPLEMENTATION REVIEW REQUEST

PHASE COMPLETED: [Phase number and name]

IMPLEMENTATION SUMMARY:
- Files created: [List]
- Key systems: [List]
- Current performance: [Metrics]

CODE TO REVIEW:
[Link to files or paste key code sections]

REVIEW SCOPE:
1. Code quality (readability, documentation)
2. Architecture compliance
3. Performance analysis
4. Best practices adherence
5. Technical debt assessment
6. Improvement recommendations

SPECIFIC CONCERNS:
[Any specific areas you're worried about]

REQUEST:
Conduct thorough review and provide:
1. Quality scores (1-10 for each category)
2. Identified issues (prioritized)
3. Quick wins (< 1 hour fixes)
4. Medium improvements (1-4 hours)
5. Major refactors (if needed)
6. Readiness assessment for next phase

DELIVERABLE:
Comprehensive review report with prioritized action items
```

**Example - Phase 2 Review**:
```markdown
POST-IMPLEMENTATION REVIEW REQUEST

PHASE COMPLETED: Phase 2 - Enemy System

IMPLEMENTATION SUMMARY:
- Files created: Enemy.js, SpawnSystem.js, updates to CollisionSystem.js
- Key systems: Enemy spawning, pathfinding, collision detection
- Current performance: 55 FPS with 500 enemies

CODE TO REVIEW:
[Files in Antigravity or pasted here]

REVIEW SCOPE:
Full quality review before moving to Phase 3

SPECIFIC CONCERNS:
- Is the spawn rate scaling correct?
- Are we handling enemy-enemy collisions efficiently?
- Is the pathfinding too simplistic?

REQUEST:
Review Phase 2 implementation:
1. Does it follow architecture?
2. Any performance issues?
3. Code quality assessment
4. Should we refactor anything before Phase 3?
5. Missing features from architecture?

DELIVERABLE:
Review report with:
- Go/No-go recommendation for Phase 3
- Critical issues to fix
- Optional improvements
- Estimated fix time
```

---

## Analytics Agent Workflow

### Typical Project Flow with Analytics Agent

```
Phase 1: Core Foundation
├── [Skip Analytics] - Straightforward implementation
└── Developer implements following architecture

Phase 2: Enemy System
├── [Optional Analytics] - Pre-phase research on pathfinding
├── Developer implements
└── [Analytics Review] - Post-implementation review

Phase 3: Combat System
├── [Optional Analytics] - Research weapon patterns
├── Developer implements
└── [Skip Review] - Move fast

Phase 4: Progression System
├── [Skip Analytics] - Well-defined in architecture
└── Developer implements

Phase 5: Performance Optimization ⭐ CRITICAL
├── [REQUIRED Analytics] - Deep research on optimization
│   ├── Collision detection algorithms
│   ├── Spatial partitioning
│   ├── Object pooling
│   └── Rendering optimizations
├── Developer implements recommendations
├── [Analytics Review] - Verify performance gains
└── Iterate if needed

Phase 6: Content Expansion
├── [Skip Analytics] - Following established patterns
└── Developer implements

Phase 7: Graphics & Polish
├── [Optional Analytics] - Research sprite rendering best practices
├── Developer implements
└── [Final Review] - Complete game review
```

---

## Quick Decision Guide

**Should you use Analytics Agent?**

### Definitely Use For:
- ✅ Phase 5 (Performance Optimization) - CRITICAL
- ✅ Major architectural decisions
- ✅ Performance problems
- ✅ Choosing between multiple approaches
- ✅ Complex algorithms needed

### Consider Using For:
- 🤔 Pre-phase planning (Phases 2-7)
- 🤔 Post-phase reviews
- 🤔 Technology stack decisions
- 🤔 When stuck on a problem

### Skip For:
- ❌ Simple bug fixes
- ❌ Minor tweaks
- ❌ Following established patterns
- ❌ Straightforward implementations

---

## Integration with Other Agents

### Analytics → Developer
```
Analytics provides: Research report
Developer receives: Best practices + recommendations
Developer implements: Using researched approach
```

### Developer → Analytics → Developer
```
Developer encounters: Performance problem
Analytics researches: Optimization solutions
Developer implements: Recommended fix
```

### Analytics → Code Review → Developer
```
Analytics reviews: Completed phase
Code Review validates: Code quality
Developer fixes: Identified issues
```

---

## Common Research Topics

### Phase-Specific Research

**Phase 1: Core Foundation**
- Game loop best practices
- Input handling patterns
- Renderer architecture patterns

**Phase 2: Enemy System**
- Pathfinding algorithms (simple vs A*)
- Spawn patterns in roguelikes
- Enemy behavior patterns

**Phase 3: Combat System**
- Weapon system architectures
- Projectile management (pooling)
- Collision detection basics

**Phase 4: Progression**
- XP/leveling formulas
- Upgrade systems design
- Balance considerations

**Phase 5: Optimization** ⭐
- Spatial partitioning (hash, quadtree, grid)
- Object pooling strategies
- Rendering optimizations
- Memory management

**Phase 6: Content**
- Weapon design patterns
- Enemy variety strategies
- Procedural generation (if applicable)

**Phase 7: Graphics & Polish**
- Sprite rendering optimization
- Particle system approaches
- Audio management libraries
- Animation techniques

---

## Analytics Agent Best Practices

### For the Manager (You)

**Do:**
- ✅ Use Analytics Agent before complex phases
- ✅ Give complete context (performance numbers, constraints)
- ✅ Be specific about what you need researched
- ✅ Share the research with Developer Agent
- ✅ Trust the research (it's backed by analysis)

**Don't:**
- ❌ Skip Analytics Agent for Phase 5
- ❌ Give vague requests ("make it better")
- ❌ Ignore the recommendations without reason
- ❌ Use Analytics for simple decisions
- ❌ Ask for research without using it

### For Analytics Agent (AI Model)

**Do:**
- ✅ Provide specific, actionable recommendations
- ✅ Compare multiple approaches objectively
- ✅ Include code examples
- ✅ Cite sources and benchmarks
- ✅ Consider the project's specific constraints
- ✅ Prioritize simplicity when performance difference is small

**Don't:**
- ❌ Give vague advice
- ❌ Ignore the architectural constraints
- ❌ Recommend overly complex solutions
- ❌ Forget to explain trade-offs
- ❌ Provide research without clear recommendations

---

## Example Analytics Agent Session

### Complete Example: Phase 5 Optimization

**Step 1: You prepare the prompt**
```markdown
ANALYTICS AGENT RESEARCH REQUEST

PHASE: Phase 5 - Performance Optimization

CURRENT STATE:
- Performance: 42 FPS with 400 enemies, 180 projectiles
- Bottleneck: Collision detection (14ms per frame)
- Target: 60 FPS (16.67ms total frame time)

RESEARCH REQUEST:
Research optimal collision detection for our game.
Compare spatial hash, quadtree, and uniform grid.

KEY QUESTIONS:
1. Which algorithm is fastest for our entity counts?
2. How much performance improvement can we expect?
3. What's the implementation complexity?
4. Any pitfalls to avoid?

CONSTRAINTS:
- Vanilla JavaScript
- Must work with circular collision shapes
- Need projectile-enemy and player-enemy checks
- Prefer simpler over complex

TIMELINE: Need by [date]
```

**Step 2: Analytics Agent researches**

Agent spends time researching:
- Spatial partitioning algorithms
- Benchmarks from other implementations
- Best practices for browser games
- Your specific use case analysis

**Step 3: Analytics Agent delivers report**

```markdown
COLLISION OPTIMIZATION RESEARCH REPORT

SUMMARY:
Recommend Spatial Hash Grid for your use case.
Expected improvement: 42 FPS → 60 FPS
Implementation: Medium complexity, ~200 LOC

ALGORITHM COMPARISON:

| Algorithm | Time | Space | Performance | Complexity | Best For |
|-----------|------|-------|-------------|------------|----------|
| Naive O(n²) | O(n²) | O(1) | 42 FPS | Very Low | < 100 entities |
| Spatial Hash | O(n) | O(n) | ~60 FPS | Medium | 100-1000 entities |
| Quadtree | O(n log n) | O(n) | ~58 FPS | High | Sparse, moving |
| Uniform Grid | O(n) | O(w×h) | ~59 FPS | Low | Fixed grid |

RECOMMENDATION: Spatial Hash

REASONING:
1. Best performance for your entity density
2. Simpler than quadtree
3. Dynamic (handles moving entities well)
4. Used by many successful 2D games

EXPECTED PERFORMANCE:
- Current: 14ms collision detection, 42 FPS
- After: ~2-3ms collision detection, 58-60 FPS
- Improvement: ~70% faster collisions

IMPLEMENTATION APPROACH:
[Detailed steps with code examples]

PITFALLS TO AVOID:
1. Cell size too small (overhead) or too large (no benefit)
2. Not updating grid every frame
3. Checking cells multiple times

TESTING STRATEGY:
[How to verify performance improvement]

REFERENCES:
[Links to articles, benchmarks]
```

**Step 4: You review and approve**

You read the report, understand the recommendation.

**Step 5: You brief Developer Agent**

```markdown
Implement Phase 5 following the architecture document.

ALSO READ: [Analytics Agent's research report]

KEY GUIDANCE FROM ANALYTICS:
- Use Spatial Hash (not quadtree or grid)
- Cell size: 100 pixels
- Expected: 60 FPS after implementation
- See Analytics report for code examples

Follow the implementation approach in the Analytics report.
```

**Step 6: Developer implements**

Developer builds the spatial hash using the research.

**Step 7: Testing confirms**

Performance improves from 42 FPS → 60 FPS ✅

---

## Success Metrics

### Good Analytics Agent Work:
- ✅ Specific, actionable recommendations
- ✅ Multiple approaches compared
- ✅ Clear winner with reasoning
- ✅ Code examples provided
- ✅ Expected outcomes stated

### Poor Analytics Agent Work:
- ❌ Vague advice ("optimize your code")
- ❌ Only one option presented
- ❌ No comparison or trade-offs
- ❌ Missing implementation guidance
- ❌ Theoretical without practical application

---

## Tips for Best Results

1. **Be Specific**: "Research spatial partitioning for 500 entities" beats "make it faster"

2. **Provide Context**: Share current performance numbers, constraints, goals

3. **Use Templates**: Start with the templates in this guide, customize as needed

4. **Review Thoroughly**: Read the full Analytics report before passing to Developer

5. **Iterate if Needed**: If Analytics report isn't clear, ask follow-up questions

6. **Track Decisions**: Document which recommendations you followed and why

7. **Validate Results**: After implementing, verify the expected improvements happened

8. **Build Intuition**: Over time, you'll learn when Analytics Agent adds value

---

## Conclusion

The Analytics Agent is your secret weapon for making **informed, research-backed decisions**. Use it strategically to:

- Avoid common pitfalls
- Choose optimal algorithms
- Follow best practices
- Optimize performance
- Save time (research once, implement correctly)

**Remember**: 
- Not every decision needs Analytics Agent
- Phase 5 (Optimization) DEFINITELY needs it
- When in doubt, research beats guessing

Now you're ready to use Analytics Agent effectively! 🚀

---

END OF ANALYTICS AGENT GUIDE
