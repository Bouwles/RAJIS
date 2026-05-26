# Richard Abou Jamra Interception Simulation

**Richard Abou Jamra Interception Simulation** is a browser-based 3D first-person missile defense game built with Three.js. Defend the city from incoming missile strikes, survive increasingly difficult waves, unlock new equipment, and compete against other players online.

Play it here: [https://bouwles.github.io/RAJIS/](https://bouwles.github.io/RAJIS/)

## Overview

Missiles are falling toward the city, and your job is to intercept them before they hit. As the waves progress, the attacks become faster and more intense. Enemy soldiers also begin spawning across the map, forcing you to balance missile defense, combat, movement, and survival.

Earn points by destroying missiles and eliminating enemies, then spend those points in the shop to unlock weapons, gadgets, ultimates, upgrades, and cosmetics.

## Game Modes

### Solo

A wave-based survival mode where you protect the city from missile strikes while fighting enemy soldiers. Each wave increases in difficulty with faster missiles, more enemies, and greater pressure on the city.

### 1v1 Battle

An online head-to-head arena mode where two players fight in an enclosed combat zone. The first player to eliminate the other wins.

## Locations

Choose your map before starting. Each location has its own atmosphere, weather, layout, and visual style.

- **Sweden**: Cold overcast skies, dense brick buildings, trees, and snow-covered rooftops
- **Beirut**: Sunny and dry urban environment with sandy streets, palm trees, and warm lighting
- **Dubai**: Harsh desert sunlight, wide roads, and large modern skyscrapers

## Weapons

You start with a pistol and an RPG launcher. More weapons can be unlocked through the shop and progression systems.

| Weapon | Type | Description |
|---|---|---|
| M9 Pistol | Semi-auto sidearm | Default weapon with reliable fire rate and low damage |
| RPG Launcher | Explosive launcher | Default heavy weapon with high damage and slow fire rate |
| P90 SMG | Full-auto weapon | Fast fire rate with a 30-round magazine |
| Super Shotgun | Burst spread weapon | Fires 8 pellets per shot and includes a grappling hook ability |
| Sniper Rifle | Bolt-action rifle | Scoped weapon with high precision and strong long-range damage |

Right-click to scope with the sniper rifle. Right-click with the Super Shotgun to fire the grappling hook.

## Movement

The game uses standard first-person movement.

- **WASD**: Move
- **Mouse**: Look around
- **Space**: Jump
- **Shift**: Sprint
- **Right-click**: Scope or use secondary weapon ability

### Grappling Hook

Equip the Super Shotgun and right-click a surface or building to latch on. The grappling hook pulls you toward the target, allowing you to reach rooftops, cross streets quickly, or reposition during combat.

You have full air control while grappling.

## Ultimates

Ultimates can be unlocked in the shop and activated during gameplay with their assigned key.

### Cyber Bullet

Fires a homing car that tracks and destroys the nearest missile. This ability has a cooldown.

### RAJPN Fist Bump

Summons two massive fists that slam together in front of the player, destroying missiles caught in the blast zone.

## Gadgets

Gadgets can be purchased from the shop and carried into battle.

- **Flashbang**: Blinds and disorients nearby enemies
- **Airstrike**: Calls in a strike that destroys a cluster of missiles and soldiers
- **Cover Charge**: Deploys a temporary barrier for protection

## Shop and Upgrades

Earn points by intercepting missiles and eliminating enemy soldiers. Spend points in the in-game shop to unlock and upgrade:

- Weapons
- Ultimate abilities
- Gadgets
- Character cosmetics
- Outfit colors
- Visor tints
- Backpack styles
- Armor upgrades
- Speed upgrades
- Damage upgrades
- Fire rate upgrades
- Battle pass progression

Purchases and progress are saved to your account.

## Accounts and Cloud Saves

Create an account with a username and password. Your save data is synced through Firebase, including:

- Unlocks
- Cosmetics
- Currency
- Battle pass tier
- Progression
- Equipped items

This allows your progress to stay saved across sessions.

## Online Multiplayer

Online multiplayer uses peer-to-peer networking through PeerJS.

Players can create a lobby and share a room code with a friend. One player hosts, the other joins, and once both players are connected, the 1v1 battle begins.

## Enemy Soldiers

Enemy soldiers spawn alongside missile waves as the game progresses.

| Enemy | Behavior |
|---|---|
| Grunt | Fast, low health, aggressive at close to medium range |
| Heavy | Slow, high health, high damage |
| Sniper | Keeps distance, has high accuracy, dangerous at long range |

Killing soldiers can drop ammo packs.

## Building Damage

Missiles that reach the city damage nearby buildings. Buildings have structural health and collapse after taking enough damage. If too many buildings are destroyed, the city falls and the run ends.

## Tech Stack

- Vanilla JavaScript
- Three.js r128
- Firebase for accounts and cloud saves
- PeerJS for online multiplayer
- Browser-based deployment through GitHub Pages

No build tools or frameworks are required. The game runs directly in any modern browser.

## Main Features

- Browser-based 3D first-person gameplay
- Missile interception mechanics
- Wave-based survival
- Destructible city buildings
- Multiple playable locations
- Unlockable weapons
- Gadgets and ultimate abilities
- Character cosmetics
- Shop and upgrade system
- Firebase cloud saves
- Online 1v1 multiplayer
- Enemy soldier AI
- Grappling hook movement
- Battle pass progression

## How to Play

1. Open the game link.
2. Create or log into your account.
3. Choose a location.
4. Start Solo mode or join a 1v1 battle.
5. Shoot down missiles before they destroy the city.
6. Fight enemy soldiers as waves become harder.
7. Earn points and unlock better equipment.
8. Survive as long as possible.
