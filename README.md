# Super Mario Style 2D Platformer

A simple 2D platformer game built with JavaScript and Kaboom.js.

## How to Play

1. Open `index.html` in your web browser (double-click the file)
2. Use the **Arrow Keys** to move left and right
3. Press **Space** to jump

## Game Features

- Player character (red rectangle)
- Left/right movement
- Jumping mechanics
- Gravity physics
- Multiple platforms to jump on
- Fixed camera view

## Customization

Edit the game settings at the top of `game.js`:

- **JUMP_FORCE**: Change jump height (default: 500)
  - Higher = jump higher (try 700 or 800)
  - Lower = jump lower (try 300 or 400)

- **PLAYER_SPEED**: Change movement speed (default: 200)
  - Higher = move faster (try 300 or 400)
  - Lower = move slower (try 100 or 150)

- **GRAVITY**: Change fall speed (default: 1000)
  - Higher = fall faster (try 1500 or 2000)
  - Lower = fall slower, more floaty (try 500 or 600)

After changing any number, save the file and refresh your browser to see the changes.

## How It Works

### Game Loop
The game runs a loop that updates 60 times per second. Each frame:
- Checks for keyboard input
- Applies gravity
- Checks collisions
- Updates positions
- Draws everything on screen

The game engine (Kaboom.js) handles this automatically - you don't need to write the loop yourself.

### Jumping
When you press Space:
1. The code checks if you're on the ground using `player.isGrounded()`
2. If yes, it calls `player.jump(JUMP_FORCE)` which pushes you upward
3. Gravity then pulls you back down
4. When you land on a platform, `isGrounded()` becomes true again, so you can jump again

### Gravity
Gravity is a constant downward force. The `setGravity(GRAVITY)` line sets how strong it is. Every frame, the engine applies this force to objects with a `body()`, making them fall. When you land on a platform (which has `isStatic: true`), the collision stops your fall.

## Requirements

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No installation or build tools needed
- Internet connection (to load Kaboom.js from CDN)

## Files

- `index.html` - Main HTML file that loads the game
- `game.js` - All the game logic and code
- `README.md` - This file with instructions

## Getting Started

Since you have zero coding experience, here's what each file does:

- **index.html**: This is the webpage. It sets up the basic structure and loads the game framework (Kaboom.js) and your game code (game.js).

- **game.js**: This is where all the game logic lives. You can edit this file to change how the game works. All the comments explain what each part does.

- **README.md**: This file - it's just documentation to help you understand the game.

To play the game, just double-click `index.html` and it will open in your browser!

