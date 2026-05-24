# Richard Abou Jamra Interception Simulation

A browser-based 3D first-person missile defense game built with Three.js. Shoot down incoming missiles before they destroy the city, survive escalating waves, and compete against other players online.

Play it here: [https://bouwles.github.io/rajis](https://bouwles.github.io/RAJIS/)

---

## What You Do

Missiles rain down on the city. You shoot them down with your weapons before they hit buildings. Every wave gets harder -- more missiles, faster, and enemy soldiers start hunting you. Survive as long as possible, rack up points, and spend them in the shop between rounds.

---

## Game Modes

**Solo** -- Classic wave survival. Protect the city from missile strikes while fighting off ground soldiers. Wave difficulty scales over time.

**1v1 Battle (Gulag)** -- Fight another player head-to-head online in an enclosed arena. First to eliminate the other wins.

---

## Locations

Choose your map before starting. Each has different weather, building density, and aesthetics.

- **Sweden** -- Cold overcast sky, dense brick city, trees and snow-capped rooftops
- **Beirut** -- Sunny and dry, sandy urban sprawl, palm trees
- **Dubai** -- Harsh desert sun, massive skyscrapers

---

## Weapons

You start with a pistol and an RPG launcher. More weapons unlock in the shop.

| Weapon | Type 
|---|---|---|
| M9 Pistol | Semi-auto sidearm | Default, free |
| RPG Launcher | Explosive | Default, high damage, slow fire |
| P90 SMG | Full auto | Hold to fire, 30-round magazine |
| Super Shotgun | Burst spread | 8 pellets per shot, doubles as a grappling hook |
| Sniper Rifle | Bolt-action | Scoped, one-shot soldiers, long range |

Right-click to scope with the sniper. Right-click with the shotgun to launch the grappling hook.

---

## Movement

Standard WASD movement with mouse look. Full air control while grappling.

**Grappling Hook** -- Equip the shotgun, right-click a surface or building to latch on, and you get pulled toward it. Use it to reach rooftops, swing across streets, or reposition fast.

---

## Ultimates

Unlock these in the shop and activate them in-game with the assigned key.

**Cyber Bullet** -- Fires a homing car that tracks and destroys the nearest missile. Has a cooldown.

**RAJPN Fist Bump** -- Sends two massive fists slamming together in front of you, destroying any missiles caught in the blast.
---

## Gadgets

Buy gadgets from the shop and carry them into battle.

- **Flashbang** -- Blinds and disorients nearby enemies
- **Airstrike** -- Calls in a strike that destroys a cluster of missiles and soldiers
- **Cover Charge** -- Drops a deployable barrier to block incoming fire

---

## Shop and Upgrades

Earn points by shooting down missiles and killing soldiers. Spend them in the in-game shop to unlock:

- New weapons
- Ultimate abilities
- Gadgets
- Character cosmetics (outfit colors, visor tints, backpack styles)
- Stat upgrades (armor, speed, damage, fire rate)
- Battle pass progression

Purchases and progress are saved to your account.

---

## Accounts and Cloud Saves

Create an account with a username and password. Your save data (unlocks, cosmetics, currency, battle pass tier) syncs to the cloud via Firebase so you never lose progress.

---

## Online Multiplayer

Uses peer-to-peer networking (PeerJS). Create a lobby and share your room code with a friend. One player hosts, the other joins. Once both are in, the 1v1 Gulag battle starts.

---

## Enemy Soldiers

Ground soldiers spawn alongside missiles as waves progress. Three types:

- **Grunt** -- Fast, low health, aggressive engagement range
- **Heavy** -- Slow, high health, high damage
- **Sniper** -- Stays at distance, high accuracy, dangerous at range

Killing soldiers drops ammo packs.

---

## Building Damage

Missiles that reach buildings deal structural damage. Once a building takes enough hits it collapses. Lose too many buildings and the city falls.

---

## Tech

Built entirely in vanilla JavaScript with Three.js (r128) for 3D rendering. No build tools or frameworks. Runs in any modern browser with no install required.
