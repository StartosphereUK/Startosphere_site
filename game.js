// Initialize Kaboom - this sets up the game engine
// We're creating a game that's 1600 pixels wide and 900 pixels tall (zoomed out)
kaboom({
    width: 1600,
    height: 900,
    root: document.getElementById("game-container"),
    letterbox: true,  // This makes the game scale to fit the window!
});

// ============================================
// GAME SETTINGS - CHANGE THESE NUMBERS!
// ============================================

// How fast the player moves left and right
// Higher number = faster movement
const PLAYER_SPEED = 300;

// How high the player jumps
// Higher number = jump higher
const JUMP_FORCE = 600;

// How strong gravity is (how fast things fall)
// Higher number = falls faster
// Lower number = falls slower (more floaty)
const GRAVITY = 1000;

// How fast enemies move
// Lower number = slower enemies (easier to avoid)
const ENEMY_SPEED = 70;

// ============================================
// GAME STATE - Track score and game status
// ============================================

// This object stores information about the current game
let gameState = {
    score: 0,           // How many coins collected
    isGameOver: false,  // Whether the game is over
    isStartScreen: true, // Whether we're on the start screen
    scoreText: null     // The text that shows the score (we'll create this later)
};

// ============================================
// FUNCTION TO SHOW START SCREEN
// ============================================

// This function shows the start screen with instructions
// The player presses SPACE to start the game
function showStartScreen() {
    // Set start screen flag
    gameState.isStartScreen = true;
    gameState.isGameOver = false;

    // Clear everything from the screen
    destroyAll();

    // Set the background color to sky blue
    setBackground(135, 206, 235);

    // Reset camera zoom for the start screen
    camScale(1);
    camPos(800, 450); // Center the camera on the 1600x900 screen

    // Create a semi-transparent overlay
    add([
        rect(1600, 900),
        pos(0, 0),
        color(0, 0, 0, 150),  // Black with some transparency
        z(100)
    ]);

    // Title text (centered for 1600x900 screen)
    add([
        text("Raihan's New Game", { size: 48 }),
        pos(500, 150),
        color(255, 255, 0),   // Yellow color
        z(101)
    ]);

    // Instructions (centered for 1600x900 screen)
    add([
        text("HOW TO PLAY:", { size: 32 }),
        pos(600, 250),
        color(255, 255, 255),  // White color
        z(101)
    ]);

    add([
        text("Arrow Keys - Move left and right", { size: 24 }),
        pos(500, 300),
        color(255, 255, 255),
        z(101)
    ]);

    add([
        text("Space Bar - Jump", { size: 24 }),
        pos(600, 340),
        color(255, 255, 255),
        z(101)
    ]);

    add([
        text("Collect all the gold coins!", { size: 24 }),
        pos(550, 390),
        color(255, 215, 0),   // Gold color
        z(101)
    ]);

    add([
        text("Avoid the purple enemies!", { size: 24 }),
        pos(550, 430),
        color(255, 0, 0),     // Red color
        z(101)
    ]);

    add([
        text("Press SPACE to start", { size: 32 }),
        pos(550, 500),
        color(0, 255, 0),      // Green color
        z(101)
    ]);

    // Good luck message
    add([
        text("Good luck, Sabrina and Numa!", { size: 36 }),
        pos(550, 570),
        color(255, 192, 203),  // Pink color
        z(101)
    ]);

    // Wait for spacebar to start the game
    // Only works when on start screen
    onKeyPress("space", () => {
        if (gameState.isStartScreen) {
            startGame();  // Start the actual game
        }
    });
}

// ============================================
// FUNCTION TO START/RESTART THE GAME
// ============================================

// This function sets up everything in the game
// We can call it again to restart the game
function startGame() {
    // Reset the game state
    gameState.score = 0;
    gameState.isGameOver = false;
    gameState.isStartScreen = false;  // We're no longer on the start screen

    // Clear everything from the screen
    destroyAll();

    // ============================================
    // SOUND SYSTEM (No external files needed!)
    // ============================================

    // We use the browser's built-in AudioContext to make retro sounds
    // This way you don't need to download any mp3 files!
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    function playSynthSound(type) {
        if (audioCtx.state === 'suspended') audioCtx.resume();
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        const now = audioCtx.currentTime;

        if (type === "jump") {
            // Jump sound: rising pitch
            osc.type = "square";
            osc.frequency.setValueAtTime(150, now);
            osc.frequency.exponentialRampToValueAtTime(600, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
            osc.start(now);
            osc.stop(now + 0.1);
        }
        else if (type === "coin") {
            // Coin sound: two high beeps
            osc.type = "sine";
            osc.frequency.setValueAtTime(1200, now);
            osc.frequency.setValueAtTime(1600, now + 0.1);
            gainNode.gain.setValueAtTime(0.1, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
        else if (type === "hit") {
            // Hit/Die sound: falling chaotic noise (simulated with saw)
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(200, now);
            osc.frequency.exponentialRampToValueAtTime(50, now + 0.3);
            gainNode.gain.setValueAtTime(0.2, now);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
            osc.start(now);
            osc.stop(now + 0.3);
        }
    }

    // ============================================
    // SET UP THE GAME WORLD
    // ============================================

    // Set the background color to sky blue
    setBackground(135, 206, 235);

    // ZOOM IN! 
    // The user wanted it less zoomed out, so we zoom in 1.5x
    camScale(1.0);
    // Note: Since we're zoomed in, we need the camera to follow the player now!

    // ============================================
    // CREATE SCORE DISPLAY
    // ============================================

    // Create text at the top of the screen to show the score
    // This will update as you collect coins
    gameState.scoreText = add([
        text("Score: 0", { size: 32 }),  // text() = create text, size = font size
        pos(20, 20),                     // Position at top left
        fixed(),                         // fixed() = stays in place when camera moves
        color(255, 255, 0),              // Yellow color
        z(100)                           // z() = draw on top of everything
    ]);

    // ============================================
    // CREATE THE GROUND (the floor platforms)
    // ============================================

    // This creates a platform at the bottom of the screen
    // It's a rectangle that's 1600 pixels wide and 40 pixels tall
    // The color is green (like grass)
    // Screen is 900 pixels tall (coordinates 0-899), so position ground so it's fully visible
    // Position at y=860 means top at 860, and with height 40, bottom extends to 900
    add([
        rect(1600, 40),       // rect = rectangle shape (width, height)
        pos(0, 860),          // pos = position (x, y) - top at 860, extends to 900
        area(),               // area() = this can be collided with
        body({ isStatic: true }),  // isStatic = doesn't move (like a wall)
        color(34, 139, 34),   // color = green color
        "ground"              // "ground" = a label so we can find it later
    ]);

    // Create multiple platforms across the wider level
    // Platform 1 - left side
    add([
        rect(200, 20),
        pos(150, 700),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // Platform 2 - left-middle
    add([
        rect(180, 20),
        pos(400, 600),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // Platform 3 - middle
    add([
        rect(250, 20),
        pos(600, 500),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // Platform 4 - middle-right
    add([
        rect(200, 20),
        pos(900, 400),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // Platform 5 - right side
    add([
        rect(180, 20),
        pos(1200, 500),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // Platform 6 - high platform left
    add([
        rect(150, 20),
        pos(200, 350),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // Platform 7 - high platform middle
    add([
        rect(200, 20),
        pos(700, 300),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // Platform 8 - high platform right
    add([
        rect(150, 20),
        pos(1250, 350),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // Platform 9 - very high platform
    add([
        rect(180, 20),
        pos(500, 200),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // Platform 10 - very high platform right
    add([
        rect(180, 20),
        pos(1000, 200),
        area(),
        body({ isStatic: true }),
        color(139, 69, 19),
        "platform"
    ]);

    // ============================================
    // CREATE BOUNDARY WALLS (prevent player from going off screen)
    // ============================================

    // Create an invisible wall on the left side of the screen
    // This stops the player from moving off the left edge
    add([
        rect(10, 900),        // Thin wall, full height of screen
        pos(-5, 0),           // Position it just off the left edge
        area(),
        body({ isStatic: true }),
        opacity(0),           // Make it invisible (opacity 0 = completely transparent)
        "leftWall"
    ]);

    // Create an invisible wall on the right side of the screen
    // This stops the player from moving off the right edge
    add([
        rect(10, 900),        // Thin wall, full height of screen
        pos(1595, 0),         // Position it just off the right edge (1600 - 5 = 1595)
        area(),
        body({ isStatic: true }),
        opacity(0),           // Make it invisible
        "rightWall"
    ]);

    // ============================================
    // CREATE THE PLAYER CHARACTER
    // ============================================

    // Create a player object - this is the character you control
    const player = add([
        rect(30, 40),         // Player is a rectangle: 30 pixels wide, 40 pixels tall
        pos(100, 100),        // Starting position (x, y)
        area(),               // Can collide with other objects
        body(),               // Has physics (gravity, jumping, etc.)
        color(255, 0, 0),     // Red color
        "player"              // Label it "player" so we can find it
    ]);

    // ============================================
    // CREATE COINS TO COLLECT
    // ============================================

    // Create several coins around the level
    // Coins are yellow circles that you can collect

    // Create many coins around the expanded level
    // Coins on platforms
    add([circle(15), pos(250, 680), area(), color(255, 215, 0), "coin"]);  // Platform 1
    add([circle(15), pos(490, 580), area(), color(255, 215, 0), "coin"]);  // Platform 2
    add([circle(15), pos(725, 480), area(), color(255, 215, 0), "coin"]);  // Platform 3
    add([circle(15), pos(1000, 380), area(), color(255, 215, 0), "coin"]); // Platform 4
    add([circle(15), pos(1290, 480), area(), color(255, 215, 0), "coin"]); // Platform 5
    add([circle(15), pos(275, 330), area(), color(255, 215, 0), "coin"]);  // Platform 6
    add([circle(15), pos(800, 280), area(), color(255, 215, 0), "coin"]);  // Platform 7
    add([circle(15), pos(1325, 330), area(), color(255, 215, 0), "coin"]); // Platform 8
    add([circle(15), pos(590, 180), area(), color(255, 215, 0), "coin"]); // Platform 9
    add([circle(15), pos(1090, 180), area(), color(255, 215, 0), "coin"]); // Platform 10

    // Coins on the ground
    add([circle(15), pos(300, 830), area(), color(255, 215, 0), "coin"]);
    add([circle(15), pos(600, 830), area(), color(255, 215, 0), "coin"]);
    add([circle(15), pos(900, 830), area(), color(255, 215, 0), "coin"]);
    add([circle(15), pos(1200, 830), area(), color(255, 215, 0), "coin"]);
    add([circle(15), pos(1500, 830), area(), color(255, 215, 0), "coin"]);

    // Coins floating in the air (require jumps to reach)
    add([circle(15), pos(350, 450), area(), color(255, 215, 0), "coin"]);
    add([circle(15), pos(750, 350), area(), color(255, 215, 0), "coin"]);
    add([circle(15), pos(1100, 250), area(), color(255, 215, 0), "coin"]);
    add([circle(15), pos(450, 100), area(), color(255, 215, 0), "coin"]);
    add([circle(15), pos(1150, 100), area(), color(255, 215, 0), "coin"]);

    // ============================================
    // CREATE ENEMIES (bad guys to avoid)
    // ============================================

    // Create enemies that move back and forth on platforms
    // They're purple rectangles that will hurt you if you touch them

    // Create multiple enemies across the level
    // Enemy 1 - on ground, left area
    // Position at y=835 so the bottom of the enemy (25px tall) sits on the ground at y=860
    const enemy1 = add([
        rect(25, 25),
        pos(500, 835),      // y=835 means top at 835, bottom at 860 (on the ground)
        area(),
        body({ isStatic: false }),
        color(128, 0, 128),
        "enemy",
        { direction: 1 }
    ]);
    enemy1.onUpdate(() => {
        if (gameState.isGameOver) return;
        // Move the enemy in its current direction
        enemy1.move(ENEMY_SPEED * enemy1.direction, 0);
        // If enemy reaches the right boundary, turn around
        if (enemy1.pos.x > 800) {
            enemy1.direction = -1;  // Now moving left
        }
        // If enemy reaches the left boundary, turn around
        if (enemy1.pos.x < 200) {
            enemy1.direction = 1;   // Now moving right
        }
    });

    // Enemy 2 - on ground, right area
    // Position at y=835 so the bottom of the enemy (25px tall) sits on the ground at y=860
    const enemy2 = add([
        rect(25, 25),
        pos(1100, 835),     // y=835 means top at 835, bottom at 860 (on the ground)
        area(),
        body({ isStatic: false }),
        color(128, 0, 128),
        "enemy",
        { direction: -1 }
    ]);
    enemy2.onUpdate(() => {
        if (gameState.isGameOver) return;
        // Move the enemy in its current direction
        enemy2.move(ENEMY_SPEED * enemy2.direction, 0);
        // If enemy reaches the right boundary, turn around
        if (enemy2.pos.x > 1400) {
            enemy2.direction = -1;  // Now moving left
        }
        // If enemy reaches the left boundary, turn around
        if (enemy2.pos.x < 800) {
            enemy2.direction = 1;   // Now moving right
        }
    });

    // Enemy 3 - on platform 2
    const enemy3 = add([
        rect(25, 25),
        pos(450, 580),
        area(),
        body({ isStatic: false }),
        color(128, 0, 128),
        "enemy",
        { direction: 1 }
    ]);
    enemy3.onUpdate(() => {
        if (gameState.isGameOver) return;
        enemy3.move(ENEMY_SPEED * enemy3.direction, 0);
        if (enemy3.pos.x > 550) enemy3.direction = -1;
        if (enemy3.pos.x < 400) enemy3.direction = 1;
    });

    // Enemy 4 - on platform 3
    const enemy4 = add([
        rect(25, 25),
        pos(700, 480),
        area(),
        body({ isStatic: false }),
        color(128, 0, 128),
        "enemy",
        { direction: -1 }
    ]);
    enemy4.onUpdate(() => {
        if (gameState.isGameOver) return;
        enemy4.move(ENEMY_SPEED * enemy4.direction, 0);
        if (enemy4.pos.x > 800) enemy4.direction = -1;
        if (enemy4.pos.x < 600) enemy4.direction = 1;
    });

    // Enemy 5 - on platform 4
    const enemy5 = add([
        rect(25, 25),
        pos(950, 380),
        area(),
        body({ isStatic: false }),
        color(128, 0, 128),
        "enemy",
        { direction: 1 }
    ]);
    enemy5.onUpdate(() => {
        if (gameState.isGameOver) return;
        enemy5.move(ENEMY_SPEED * enemy5.direction, 0);
        if (enemy5.pos.x > 1050) enemy5.direction = -1;
        if (enemy5.pos.x < 900) enemy5.direction = 1;
    });

    // Enemy 6 - on platform 5
    const enemy6 = add([
        rect(25, 25),
        pos(1230, 480),
        area(),
        body({ isStatic: false }),
        color(128, 0, 128),
        "enemy",
        { direction: -1 }
    ]);
    enemy6.onUpdate(() => {
        if (gameState.isGameOver) return;
        enemy6.move(ENEMY_SPEED * enemy6.direction, 0);
        if (enemy6.pos.x > 1330) enemy6.direction = -1;
        if (enemy6.pos.x < 1200) enemy6.direction = 1;
    });

    // Enemy 7 - on platform 7 (high)
    const enemy7 = add([
        rect(25, 25),
        pos(750, 280),
        area(),
        body({ isStatic: false }),
        color(128, 0, 128),
        "enemy",
        { direction: 1 }
    ]);
    enemy7.onUpdate(() => {
        if (gameState.isGameOver) return;
        enemy7.move(ENEMY_SPEED * enemy7.direction, 0);
        if (enemy7.pos.x > 850) enemy7.direction = -1;
        if (enemy7.pos.x < 700) enemy7.direction = 1;
    });

    // Enemy 8 - on platform 9 (very high)
    const enemy8 = add([
        rect(25, 25),
        pos(550, 180),
        area(),
        body({ isStatic: false }),
        color(128, 0, 128),
        "enemy",
        { direction: -1 }
    ]);
    enemy8.onUpdate(() => {
        if (gameState.isGameOver) return;
        enemy8.move(ENEMY_SPEED * enemy8.direction, 0);
        if (enemy8.pos.x > 650) enemy8.direction = -1;
        if (enemy8.pos.x < 500) enemy8.direction = 1;
    });

    // ============================================
    // SET UP GRAVITY
    // ============================================

    // This makes the player fall down when not standing on something
    // The number controls how fast things fall
    setGravity(GRAVITY);

    // ============================================
    // PLAYER CONTROLS - LEFT AND RIGHT MOVEMENT
    // ============================================

    // When the LEFT arrow key is pressed, move player left
    // Only move if the game is not over
    onKeyDown("left", () => {
        if (!gameState.isGameOver) {
            // Move the player to the left
            // The negative number means move left (negative = left, positive = right)
            player.move(-PLAYER_SPEED, 0);
        }
    });

    // When the RIGHT arrow key is pressed, move player right
    // Only move if the game is not over
    onKeyDown("right", () => {
        if (!gameState.isGameOver) {
            // Move the player to the right
            // Positive number means move right
            player.move(PLAYER_SPEED, 0);
        }
    });

    // ============================================
    // PLAYER CONTROLS - JUMPING
    // ============================================

    // When the SPACE bar is pressed
    onKeyPress("space", () => {
        // If we're on the start screen, do nothing (handled by start screen)
        if (gameState.isStartScreen) {
            return;
        }

        // If game is over, restart the game
        if (gameState.isGameOver) {
            startGame();  // Call startGame() again to restart
            return;       // Stop here, don't do anything else
        }

        // If game is active, make the player jump
        // Check if the player is on the ground (standing on something)
        // isGrounded() returns true if the player is touching the ground
        if (player.isGrounded()) {
            // Make the player jump upward
            // The negative number means move up (negative = up, positive = down)
            player.jump(JUMP_FORCE);
            playSynthSound("jump"); // Play jump sound
        }
    });

    // ============================================
    // COLLISION DETECTION - COINS
    // ============================================

    // When the player collides with a coin
    player.onCollide("coin", (coin) => {
        // Remove the coin from the game
        destroy(coin);
        playSynthSound("coin"); // Play coin sound

        // Increase the score by 1
        gameState.score = gameState.score + 1;

        // Update the score text to show the new score
        gameState.scoreText.text = "Score: " + gameState.score;
    });

    // ============================================
    // COLLISION DETECTION - ENEMIES
    // ============================================

    // When the player collides with an enemy
    player.onCollide("enemy", () => {
        // Only trigger game over if the game isn't already over
        if (!gameState.isGameOver) {
            playSynthSound("hit"); // Play death sound
            // Set game over to true
            gameState.isGameOver = true;

            // Stop the player from moving
            player.vel = vec2(0, 0);

            // Create a game over screen
            add([
                rect(1600, 900),          // Full screen rectangle
                pos(0, 0),
                color(0, 0, 0, 200),       // Black with some transparency
                z(200)                    // Draw on top of everything
            ]);

            // Add "GAME OVER" text (centered manually)
            // Position it at x=650 to roughly center it (1600/2 - text width/2)
            add([
                text("GAME OVER", { size: 64 }),
                pos(650, 350),            // Positioned to be roughly centered
                color(255, 0, 0),         // Red color
                z(201)                    // Draw on top of the black screen
            ]);

            // Add instruction text (centered manually)
            add([
                text("Press SPACE to play again", { size: 32 }),
                pos(600, 450),            // Positioned to be roughly centered
                color(255, 255, 255),     // White color
                z(201)
            ]);

            // Show final score (centered manually)
            add([
                text("Final Score: " + gameState.score, { size: 36 }),
                pos(600, 520),            // Positioned to be roughly centered
                color(255, 255, 0),       // Yellow color
                z(201)
            ]);
        }
    });

    // ============================================
    // GAME LOOP - This runs continuously
    // ============================================

    // This function runs every frame (many times per second)
    // It's like a loop that never stops while the game is running
    onUpdate(() => {
        // Only run game logic if the game is not over
        if (gameState.isGameOver) {
            return;  // Stop here, don't do anything else
        }

        // The game engine automatically handles:
        // - Gravity (making the player fall)
        // - Collisions (stopping the player from going through platforms)
        // - Physics (movement, jumping, etc.)

        // CAMERA FOLLOW
        // Make the camera follow the player smoothly
        camPos(player.pos);

        // Check if the player has fallen below the screen
        // If the player's Y position is greater than 900 (below the screen), reset them
        if (player.pos.y > 900) {
            // Reset the player to their starting position
            // This prevents them from disappearing forever if they fall off
            player.pos.x = 100;  // Starting X position
            player.pos.y = 100;  // Starting Y position
            // Reset the player's velocity (speed) to zero so they don't keep falling
            player.vel = vec2(0, 0);
        }
    });
}

// ============================================
// START THE GAME
// ============================================

// Show the start screen first
// The player will press SPACE to start the actual game
showStartScreen();

