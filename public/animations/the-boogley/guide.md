# The Boogley: put it on your ESP32

This guide takes you from "I have the parts" to "the Boogley is dancing on my screen".
No experience needed. Every step is spelled out.

## What is in this folder

| File | What it is |
| --- | --- |
| `the-boogley.html` | The preview page. Open it in any browser. Pick a style and a speed, then copy the program. |
| `guide.md` | This guide. |
| `BoogleyDance_OneFile/BoogleyDance_OneFile.ino` | The whole program in one file, all 151 frames included. Open it, upload it, done. |
| `BoogleyDance/BoogleyDance.ino` | The same program split in two: the code you can read and change... |
| `BoogleyDance/boogley_frames.h` | ...and the 151 frames as data. Do not edit this one. |
| `frames/` | The 151 pictures cut from the video, one every tenth of a second. |

The quickest route is: tune on the page, press **Copy the complete sketch with my settings**, paste into an empty Arduino sketch, upload. Steps 1, 2 and 5 below are still needed the first time.

## What you need

- An **ESP32 DevKit** board (the common 30 or 38 pin board with a micro USB or USB C socket).
- A **0.96 inch I2C OLED** module, 128 by 64 pixels, with 4 pins: GND, VCC, SCL, SDA.
  White, blue and two colour (yellow and cyan) modules all work.
- **4 jumper wires** (female to female if the OLED has header pins).
- A **USB data cable**. Some cables only charge. If the board never shows up on the PC, try another cable.
- The free **Arduino IDE** from arduino.cc (version 2 or newer).

## Step 1: wire the screen

Unplug the board first. Connect the four pins like this:

| OLED pin | ESP32 pin |
| --- | --- |
| GND | GND |
| VCC | 3V3 (3.3 volts, not 5V) |
| SCL | GPIO 26 (printed as G26 or D26) |
| SDA | GPIO 25 (printed as G25 or D25) |

If your board does not have pins 25 and 26 free, pick any two other GPIO pins and change these two lines near the top of the sketch:

```
const int SDA_PIN = 25;
const int SCL_PIN = 26;
```

## Step 2: set up the Arduino IDE (one time only)

1. Install the Arduino IDE and open it.
2. Add ESP32 support. Go to **File > Preferences** and paste this into **Additional boards manager URLs**:
   `https://raw.githubusercontent.com/espressif/arduino-esp32/gh-pages/package_esp32_index.json`
3. Go to **Tools > Board > Boards Manager**, search for **esp32**, and install **esp32 by Espressif Systems**.
4. Go to **Tools > Manage Libraries** (or the books icon on the left). Search for and install:
   - **Adafruit SSD1306**
   - **Adafruit GFX Library**
   - **Adafruit BusIO** (the IDE usually offers to install it with the first two. Say yes.)

## Step 3: pick your look on the preview page

1. Open `the-boogley.html` in a browser.
2. Pick a **Style**. Filled (the whole character lit, drawn lines dark) reads best on a real screen. Outline keeps only the edge and the lines.
3. Pick the **Area**. On a two colour module, Whole screen puts the ears in the yellow rows. Cyan rows only keeps the whole dancer in one colour, a little smaller.
4. Set the **Frames per second**. 10 is the speed of the original video.
5. Scroll down to **Put it on your board**.

## Step 4: get the program into the Arduino IDE

Pick whichever of these you like. They end up with the same program.

**Option A: paste it (easiest)**

1. On the page press the red button **Copy the complete sketch with my settings**. The whole program is now on your clipboard, frames included. It is about 800 KB of text, so give the copy and the paste a moment.
2. In the Arduino IDE go to **File > New Sketch**.
3. Click inside the code, press **Ctrl+A** (Cmd+A on a Mac) to select everything, then **Ctrl+V** (Cmd+V) to paste over it.
4. **File > Save** and give it a name, for example BoogleyDance.

**Option B: open the file**

1. Copy the `BoogleyDance_OneFile` folder somewhere handy, for example your Documents folder.
2. In the Arduino IDE go to **File > Open** and open `BoogleyDance_OneFile/BoogleyDance_OneFile.ino`.

This file has the Filled style at whole screen size. For another style, use Option A.

**Option C: the two-file version**

Open `BoogleyDance/BoogleyDance.ino`. The IDE shows two tabs, `BoogleyDance.ino` for the code and `boogley_frames.h` for the frames. Handy if you want to read how it works without scrolling past 150 KB of numbers. To change the style here, press **Copy only the frames as a C header** on the page. That header has one array per frame, so it suits a sketch of your own more than this one.

## Step 5: upload

1. Plug the board into the PC with the USB cable.
2. In the IDE pick the board: **Tools > Board > esp32 > ESP32 Dev Module**.
3. Pick the port: **Tools > Port** and choose the one that appeared when you plugged the board in (on Windows it is called COM followed by a number, on Mac and Linux it starts with /dev/).
4. Press the **Upload** button (the right arrow at the top left).
5. Wait. The IDE compiles for a minute or two, then writes to the board. "Done uploading" means it worked.

The dance starts at once and loops every 15 seconds.

### If the upload fails with "Wrong boot mode" or "Failed to connect"

Many ESP32 boards need a little help going into upload mode. Do this, then press Upload again:

1. Hold down the **BOOT** button on the board.
2. While holding it, tap the **RST** (or EN) button once.
3. Let go of **BOOT**.
4. Press **Upload** in the IDE.

If the screen stays dark after a successful upload, press **RST** once.

## Changing things later

Three settings sit near the top of the sketch, under the comment "settings you can change":

| Setting | What it does |
| --- | --- |
| `FRAMES_PER_SECOND` | 10 is the speed of the video. 20 is twice as fast, 5 is slow motion. Above about 30 the screen cannot keep up. |
| `BOUNCE` | `false` jumps back to the start after the last frame. `true` plays forward, then backward. |
| `MIRROR` | `true` flips the dancer left to right. |

Change a value, save, upload again. The style and the area are drawn into the frames themselves, so to change those go back to the page and copy the sketch again.

## How it was made

The dance comes from a 15 second green screen video. One frame was taken every tenth of a second, which gives 151 frames. For each frame the green was removed to find the character's shape, the dark drawn lines inside it were kept as a second layer, and both were shrunk to 128 by 64 pixels. The same crop box is used for every frame, so the character moves on the OLED exactly the way it moves in the video.

## Troubleshooting

**The screen stays black, but the IDE said "Done uploading".**
Open **Tools > Serial Monitor** and set it to **115200 baud**. Press RST on the board. You will see one of these:

- `OLED found at 0x3C` (or `0x3D`) and `151 frames. Frame 0 has ... pixels lit.`: the board is drawing. Check the VCC and GND wires, and try the other 3V3 pin if the board has two.
- `OLED NOT found`: the SDA and SCL wires are swapped or on the wrong pins. Swap them and press RST.
- Nothing at all: the board is still in upload mode. Press RST once.

**The picture is faint, striped or shifted.**
Your module uses a slightly different driver chip (SH1106 instead of SSD1306). Install the **Adafruit SH110X** library and in the sketch change `Adafruit_SSD1306` to `Adafruit_SH1106G`, `SSD1306_WHITE` to `SH110X_WHITE`, and `display.begin(SSD1306_SWITCHCAPVCC, foundAddr)` to `display.begin(foundAddr, true)`.

**The ears are yellow.**
You have a two colour module. The top 16 rows are always yellow. Pick **Cyan rows only** on the page and copy the sketch again to keep the dancer in one colour.

**The paste into the Arduino IDE hangs.**
The sketch is large. Wait a few seconds. If it never finishes, use Option B and open the file.

**The board shows up on the PC for a moment and then disappears.**
Try another USB cable or another USB port. Charging only cables are a common cause.
