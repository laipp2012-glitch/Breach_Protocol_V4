# Patch Notes v1.1 - Balance Update

> **Date:** 2026-01-14
> **Focus:** Smoothing the early game experience and fixing difficulty spikes.

## ⚔️ Combat Balance

### Weapons
- **Garlic Aura**: Significantly buffed to be a viable early-game defensive tool.
    - **Damage**: Increased from `2` -> `3` (Max `8` -> `12`).
    - **Cooldown**: Reduced from `0.5s` -> `0.4s` per tick.
    - **Upgrades**: Now scales damage aggressively in early levels.

### Progression
- **XP Curve**: Leveling is now faster and smoother.
    - **Old Formula**: `5 * 1.3^Level` (Steep)
    - **New Formula**: `4 * 1.25^Level` (Gentler)
    - *Example*: Level 10 now requires **36 XP** instead of **68 XP**.

---

## 👾 Enemy Balance

### Spawning
- **Base Rate**: Increased from `1` -> `2` enemies/sec. (More action immediately).
- **Max Rate**: Reduced from `10` -> `8` enemies/sec. (Less overwhelming late game).

### Unit Stats
- **Tank (Firewall)**:
    - **Health**: Reduced from `50` -> `35`.
    - *Note*: They were too tanky for the first minute of gameplay.
- **Swarm (Cluster)**:
    - **XP Reward**: Reduced from `8` -> `3`.
    - *Note*: Prevents over-leveling when clearing swarms. Minis still give 1 XP each.

---

## 📝 Developer Notes
These changes aim to fix the "slow start / impossible finish" pacing issue. Players should now be able to reach Level 5 within the first minute, making the game feel faster and more responsive. The Garlic buff makes close-quarters builds more viable against the increased early enemy count.
