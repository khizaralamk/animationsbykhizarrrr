# Spidey Transitions: put it on your ESP32

This guide takes you from "I have the parts" to "the spiders are glitching on my screen".
No experience needed. Every step is spelled out.

## What is in this folder

| File | What it is |
| --- | --- |
| `spidey-transitions.html` | The preview page. Open it in any browser. Tune the spider, then copy the program with your settings. |
| `guide.md` | This guide. |
| `SpiderShow_OneFile/SpiderShow_OneFile.ino` | The whole program in one file. Open it, upload it, done. |
| `SpiderShow/SpiderShow.ino` | The same program split in two: the code you can read and change... |
| `SpiderShow/spider_masters.h` | ...and the three spider pictures as data. Do not edit this one. |

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

If your board does not have pins 25 and 26 free, pick any two other GPIO pins and change these two lines near the top of `SpiderShow.ino`:

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

## Step 3: pick your settings on the preview page

1. Open `spidey-transitions.html` in a browser.
2. Pick a spider, a size, a line weight and the show timing. The screen on the page shows exactly what the board will draw.
3. Scroll down to **Put it on your board**.

## Step 4: get the program into the Arduino IDE

Pick whichever of these you like. They end up with the same program.

**Option A: paste it (easiest)**

1. On the page press the red button **Copy the complete sketch with my settings**. The whole program is now on your clipboard, spiders included.
2. In the Arduino IDE go to **File > New Sketch**.
3. Click inside the code, press **Ctrl+A** (Cmd+A on a Mac) to select everything, then **Ctrl+V** (Cmd+V) to paste over it.
4. **File > Save** and give it a name, for example SpiderShow.

**Option B: open the file**

1. Copy the `SpiderShow_OneFile` folder somewhere handy, for example your Documents folder.
2. In the Arduino IDE go to **File > Open** and open `SpiderShow_OneFile/SpiderShow_OneFile.ino`.
3. To use your own settings, press **Copy only the settings lines** on the page and paste them over the six matching lines near the top of the sketch (under the comment "settings you can change"). They look like this:

```
const int SPIDER_SIZE  = 48;      // Size
const int SPIDER_ANGLE = 0;       // Angle (0 = upright)
const int LINE_WEIGHT  = 7;       // Line weight, 1 thin to 10 bold
const int CENTRE_Y     = 32;      // 32 = middle of the screen, 40 = middle of the cyan rows
const int HOLD_MS      = 1000;    // Show each spider for
const int GLITCH_MS    = 720;     // Transition time. Smaller = faster
```

**Option C: the two-file version**

Open `SpiderShow/SpiderShow.ino`. The IDE shows two tabs, `SpiderShow.ino` for the code and `spider_masters.h` for the pictures. Handy if you want to read how it works without scrolling past the picture data.

## Step 5: upload

1. Plug the board into the PC with the USB cable.
2. In the IDE pick the board: **Tools > Board > esp32 > ESP32 Dev Module**.
3. Pick the port: **Tools > Port** and choose the one that appeared when you plugged the board in (on Windows it is called COM followed by a number, on Mac and Linux it starts with /dev/).
4. Press the **Upload** button (the right arrow at the top left).
5. Wait. The IDE compiles for a minute or two, then writes to the board. "Done uploading" means it worked.

The first spider appears at once. Every second it glitches into the next one.

### If the upload fails with "Wrong boot mode" or "Failed to connect"

Many ESP32 boards need a little help going into upload mode. Do this, then press Upload again:

1. Hold down the **BOOT** button on the board.
2. While holding it, tap the **RST** (or EN) button once.
3. Let go of **BOOT**.
4. Press **Upload** in the IDE.

If the screen stays dark after a successful upload, press **RST** once.

## Changing things later

Everything you can tune is a number near the top of the sketch, under the comment "settings you can change":

| Setting | What it does |
| --- | --- |
| `SPIDER_SIZE` | Longest side of the spider in pixels. 16 to 64 fits on the screen upright. |
| `SPIDER_ANGLE` | 0 is upright. 90 turns it on its side, 180 is upside down. |
| `LINE_WEIGHT` | 1 is the thinnest legs, 10 the boldest. Raise it if a leg goes missing at a small size. |
| `CENTRE_Y` | 32 puts the spider in the middle of the screen. 40 keeps it inside the cyan rows of a two colour module. |
| `HOLD_MS` | How many milliseconds each spider stays on screen. 1000 is one second. |
| `GLITCH_MS` | How long one glitch takes. 720 is the normal speed. 360 is twice as fast. |

Change a number, save, upload again.

## Troubleshooting

**The screen stays black, but the IDE said "Done uploading".**
Open **Tools > Serial Monitor** and set it to **115200 baud**. Press RST on the board. You will see one of these:

- `OLED found at 0x3C` (or `0x3D`) followed by three lines of pixel counts: the board is drawing. Check the VCC and GND wires, and try the other 3V3 pin if the board has two.
- `OLED NOT found`: the SDA and SCL wires are swapped or on the wrong pins. Swap them and press RST.
- Nothing at all: the board is still in upload mode. Press RST once.

**The picture is faint, striped or shifted.**
Your module uses a slightly different driver chip (SH1106 instead of SSD1306). Install the **Adafruit SH110X** library and in `SpiderShow.ino` change `Adafruit_SSD1306` to `Adafruit_SH1106G`, `SSD1306_WHITE` to `SH110X_WHITE`, and `display.begin(SSD1306_SWITCHCAPVCC, foundAddr)` to `display.begin(foundAddr, true)`.

**The top of the spider is yellow.**
You have a two colour module. The top 16 rows are always yellow. Either enjoy it, or set `CENTRE_Y` to 40 and `SPIDER_SIZE` to 46 or less so the spider stays in the cyan part.

**The board shows up on the PC for a moment and then disappears.**
Try another USB cable or another USB port. Charging only cables are a common cause.
