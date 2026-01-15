# Game Design Analysis: Extraction Loop Update

**Date:** 2026-01-15
**Reviewer:** Antigravity (Game Design AI)
**Topic:** Extraction Gameplay Loop Implementation

---

## 1. Core Loop Analysis
The shift from "Endless Survival" to "Run-Based Extraction" fundamentally changes the player's motivation.
*   **Old Loop:** Survive until overwhelmed (Endurance).
*   **New Loop:** Survive -> Decide when to leave -> Bank progress (Risk Management).

**Verdict:** This is a strong direction that adds a "win state" to short sessions and gives meaning to the meta-progression (Gold). However, the current implementation lacks the *tension* inherent in extraction games because the extraction windows are effectively infinite.

## 2. Identified Issues & Friction Points

### 2.1 Lack of Urgency (Critical)
*   **Current State:** Extraction points spawn at 2:00, 3:30, and 5:00 and stay forever (`alive = true` with no expiration).
*   **Problem:** There is no "Fear Of Missing Out" (FOMO). A player can simply wait until 5:00, have all 3 points active, and leisurely walk to one. This kills the tension of "Should I leave *now* or risk waiting for the next one?"
*   **Recommendation:** Extraction points should be **timed windows**. e.g., Open for 60 seconds, then close. If you miss the 5:00 window, you are trapped until the next one (or stuck forever if that was the last one).

### 2.2 Economy & Risk/Reward
*   **Current State:**
    *   < 2:10 = 50 Gold
    *   < 3:40 = 100 Gold
    *   > 3:40 = 200 Gold
*   **Problem:** The reward curve is flat. Surviving past 5:00 usually implies exponential difficulty growth in this genre. Capping at 200 Gold diminishes the incentive to "push your luck" for a really long run.
*   **Recommendation:** Add a scaling "Overtime Bonus" or "Kill Bonus" to the gold calculation. e.g., `Base Gold + (Kills * 0.1)`.

### 2.3 Punishing Failure State
*   **Current State:** Death = 0 Gold.
*   **Problem:** In true extraction shooters (Tarkov), this makes sense. In a casual "bullet heaven", losing 15 minutes of progress feels bad.
*   **Recommendation:** Consolation prize. "Data Transmission Uploaded: 20% of Gold secured via emergency uplink on death." (Unlockable upgrade later?).

### 2.4 Visibility & UI
*   **Current State:** Green circle in world.
*   **Problem:** If the player is far away, they won't "see" the exit opening.
*   **Recommendation:** Add an off-screen indicator (arrow pointing to extraction) or a text message "SIGNAL ACQUIRED - EXTRACTION AVAILABLE" in the HUD.

---

## 3. Feedback & Recommendations

### Immediate Actions (Polishing the Prototype)
1.  **Implement Despawn Timer:** Make extraction points last only 60 seconds.
    *   *Design Rationale:* Forces players to move toward the objective, breaking their camping spots.
2.  **HUD Indicator:** Add a simple "Extraction Open: [00:45]" timer on screen when a point is active.
3.  **Dynamic Reward Scaling:** Start gold at 0 and have it tick up every second you survive, or drop from enemies. "Collecting Data" fits the theme better than "Time Bonus".
    *   *Alternative:* Enemies drop "Data Shards" -> These convert to Gold on extraction. This forces interaction with enemies rather than just running away.

### Future Considerations
*   **"Hot" Extraction:** Spawning an extraction point should trigger a massive enemy wave (The "Alarm" phase).
*   **Conditions:** Some exits might require 500 gold to open, or a keycard dropped by a boss.

---

## 4. Summary
The prototype functions technically but needs design tuning to create the intended *emotional experience* (Tension -> Relief). The immediate fix is to add **time limits** to the extraction zones to force decision-making.
