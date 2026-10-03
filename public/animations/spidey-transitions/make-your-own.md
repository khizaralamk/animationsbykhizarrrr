# Make your own glitch animation for an OLED

This is how the Spidey Transitions animation works, and how you can make the same thing with your own pictures. You do not need to know how to code. You need to be able to copy, paste and press Upload.

## The idea in four steps

```
your image  ->  128 x 64 black and white picture  ->  list of numbers in a sketch  ->  ESP32 draws it on the OLED
```

1. **A tiny OLED can only turn pixels on or off.** It has 128 pixels across and 64 down. So every picture has to become a grid of 128 x 64 dots that are either lit or dark.
2. **That grid is stored as numbers.** 8 pixels fit in one number (one byte), so a whole picture is 1024 numbers. In the code it looks like `0x00, 0x3f, 0xff, ...`.
3. **The board copies those numbers to the screen.** One line of code does it: `display.drawBitmap(...)`.
4. **The glitch is just mixing two pictures badly on purpose.** For a fraction of a second the board shows rows from the old picture shifted sideways, then bands of old and new mixed together, then the new picture settling. Add some random noise blocks and it looks like a broken TV.

That is all there is to it. The rest of this guide is the exact clicks.

## What you need

- An **ESP32 DevKit** board
- A **0.96 inch I2C OLED**, 128 x 64 (4 pins: GND, VCC, SCL, SDA)
- 4 jumper wires and a USB data cable
- The free **Arduino IDE**
- 2 or more images you like. Simple black and white logos work best.

If you have never set up the board before, do steps 1 and 2 of the Spidey Transitions set up guide first (wiring and installing the Arduino IDE). Then come back here.

## Step 1: pick good images

The screen is tiny and has only two states, on and off. So:

- **Good:** logos, silhouettes, bold line art, big text. High contrast, few details.
- **Bad:** photos, gradients, thin pencil sketches, anything with lots of small detail.

A quick test: shrink the image on your screen until it is the size of a postage stamp. If you can still tell what it is, it will work.

## Step 2: turn each image into numbers

Use the free online tool **image2cpp**: https://javl.github.io/image2cpp/

For each image:

1. **Select image:** choose your file.
2. **Image settings:**
   - Canvas size: `128` x `64`
   - Background color: **Black**
   - Scaling: **scale to fit, keeping proportions**
   - Center: tick **horizontally** and **vertically**
   - Look at the preview. The parts that are **white in the preview will be lit** on the OLED. If your picture came out as a white block with a dark drawing, tick **Invert image colors**.
   - Move **Brightness / alpha threshold** until the picture looks clean.
3. **Output:**
   - Code output format: **Arduino code**
   - Draw mode: **Horizontal - 1 bit per pixel**
   - Press **Generate code**.
4. Copy everything in the output box. It looks like this:

```
const unsigned char epd_bitmap_mylogo [] PROGMEM = {
  0x00, 0x00, 0x00, ...
};
```

Do this once per image. Give each one a different name (the word after `epd_bitmap_`).

## Step 3: put your pictures in the starter sketch

There is a ready starter sketch called MakeYourOwn. It is two files, `MakeYourOwn.ino` and `pictures.h`, and both must sit in one folder named `MakeYourOwn`. It already works with three spider pictures, so you can upload it first to see it run.

1. Open `MakeYourOwn.ino` in the Arduino IDE. You will see two tabs: `MakeYourOwn.ino` and `pictures.h`.
2. Click the `pictures.h` tab.
3. Delete the three example pictures and paste your own arrays from image2cpp in their place.
4. At the bottom of `pictures.h`, list your picture names in the order you want them shown:

```
const unsigned char* const PICTURES[] = { epd_bitmap_mylogo, epd_bitmap_second, epd_bitmap_third };
```

That is the only line you have to edit by hand.

## Step 4: set the timing

At the top of `MakeYourOwn.ino`:

```
const int HOLD_MS   = 1500;   // how long each picture stays on screen
const int GLITCH_MS = 720;    // how long one glitch takes. Smaller = faster
```

1000 means one second. Change the numbers to taste.

## Step 5: upload

1. Plug in the board.
2. **Tools > Board > esp32 > ESP32 Dev Module**, then pick the port under **Tools > Port**.
3. Press **Upload**.

If it fails with "Wrong boot mode" or "Failed to connect": hold **BOOT**, tap **RST**, let go of **BOOT**, then press Upload again.

Your pictures now glitch from one to the next.

## How the glitch code works

You do not have to read this to use it. It is here if you are curious. The whole effect is the `glitch()` function in the sketch, about 30 lines.

It gets a number `u` that goes from 0 (start) to 1 (end), and builds one mixed picture every frame:

| When | What it shows |
| --- | --- |
| First third (`u` under 0.35) | The **old** picture. Some rows are shoved left or right by a random amount. The shove gets bigger as time goes on. |
| Middle third | Rows come from the old or the new picture in bands of 4 rows, and the bands swap every frame. A few rows are inverted. |
| Last third (`u` over 0.65) | The **new** picture, with the sideways shoving dying down until it is clean. |

On top of that, every frame adds a few small rectangles of random on and off pixels, and one row that rolls down the screen with its pixels flipped. Because all of it uses `random()`, no two glitches look the same.

Shifting a row sideways is one line: instead of reading pixel `x`, read pixel `x - tear`. Mixing two pictures is also one line: pick which picture to read each row from.

## How the original was made

The Spidey Transitions page was built with an AI coding assistant (Claude Code). I gave it three spider images and described what I wanted. It wrote a script that traced the images into pixels, a web page that previews the result at the real screen size, and the ESP32 sketch. The preview page and the board use the same maths, so what shows in the browser is what shows on the glass.

You do not need any of that to make your own. image2cpp plus the starter sketch gets you the same result. The page just makes it faster to try sizes, angles and speeds before uploading.

## If something goes wrong

- **Screen stays black:** check the four wires. If they are right, change `0x3C` to `0x3D` in `setup()` and upload again.
- **Picture is a white block with a dark drawing:** go back to image2cpp and tick Invert image colors.
- **Picture is shifted or cut off:** the canvas size in image2cpp was not 128 x 64.
- **Picture looks like random noise:** the draw mode was not "Horizontal - 1 bit per pixel".
- **Top of the picture is yellow:** you have a two colour OLED. The top 16 rows are always yellow on those. Nothing is broken.
