# Nah, I'd Win 2: put it on your ESP32

This guide takes you from "I have the parts" to "Nah, I'd Win 2 is on my screen".
No experience needed. Every step is spelled out.

## What it does

The blindfolded head with the "Nah, I'd win." speech bubble next to it, traced pixel by pixel for the full 128 by 64 screen. The picture stays still and every few seconds a shine slides across it. It comes in two layouts: Fitted, where the head and the bubble are each as big as the screen allows, and Original, which keeps the arrangement of the drawing. And in two styles: Fill, where the head and bubble are lit and the blindfold and letters are dark, and Line, where only the line work is lit.

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

## Step 3: get the sketch

1. Press **Download the sketch** on this page. You get one file, `NahIdWin2_OneFile.ino`, with the pictures already inside.
2. Make a folder called `NahIdWin2_OneFile` and put the file in it. The Arduino IDE wants the folder and the file to share a name.
3. In the Arduino IDE go to **File > Open** and open the file.

## Step 4: pick the look

Near the top of the sketch, under the comment "settings you can change":

| Setting | What it does |
| --- | --- |
| `FITTED` | `true` makes the head and the bubble each as big as the screen allows. `false` keeps the exact arrangement of the original drawing, a little smaller. |
| `FILL` | `true` is the Fill style: head and bubble lit, blindfold and letters dark. `false` is the Line style: only the line work lit. |

The preview above shows each choice, so try the buttons there first, then set the same thing in the sketch.

## Step 5: upload

1. Plug the board into the PC with the USB cable.
2. In the IDE pick the board: **Tools > Board > esp32 > ESP32 Dev Module**.
3. Pick the port: **Tools > Port** and choose the one that appeared when you plugged the board in (on Windows it is called COM followed by a number, on Mac and Linux it starts with /dev/).
4. Press the **Upload** button (the right arrow at the top left).
5. Wait. The IDE compiles for a minute or two, then writes to the board. "Done uploading" means it worked.

The picture appears at once. About every three seconds a shine slides across it.

### If the upload fails with "Wrong boot mode" or "Failed to connect"

Many ESP32 boards need a little help going into upload mode. Do this, then press Upload again:

1. Hold down the **BOOT** button on the board.
2. While holding it, tap the **RST** (or EN) button once.
3. Let go of **BOOT**.
4. Press **Upload** in the IDE.

If the screen stays dark after a successful upload, press **RST** once.

## Changing the shine

The shine has its own settings in the same place:

| Setting | What it does |
| --- | --- |
| `FRAMES_PER_SECOND` | 30 matches the preview. Lower is slower. |
| `SHINE_FRAMES` | How many frames the shine takes to cross the screen. 22 is about three quarters of a second. |
| `REST_FRAMES` | How many still frames between two shines. 75 is two and a half seconds. |
| `SHINE_WIDTH` | Width of the wide stripe, in pixels. |
| `SHINE_GAP` | Gap between the wide stripe and the thin one behind it. |
| `SHINE_SLANT` | How much the stripes lean. 0 is straight up and down. |

## Using the picture in your own sketch

The preview page has an **Arduino bitmap** box with a Copy button. It gives you the picture for the direction and style you picked as one array, plus the three lines that draw it. Paste that into any sketch that already has an Adafruit SSD1306 display set up.

## Troubleshooting

**The screen stays black, but the IDE said "Done uploading".**
Open **Tools > Serial Monitor** and set it to **115200 baud**. Press RST on the board. You will see one of these:

- `OLED found at 0x3C` (or `0x3D`) and a line ending in `pixels lit`: the board is drawing. Check the VCC and GND wires, and try the other 3V3 pin if the board has two.
- `OLED NOT found`: the SDA and SCL wires are swapped or on the wrong pins. Swap them and press RST.
- Nothing at all: the board is still in upload mode. Press RST once.

**The picture is faint, striped or shifted.**
Your module uses a slightly different driver chip (SH1106 instead of SSD1306). Install the **Adafruit SH110X** library and in the sketch change `Adafruit_SSD1306` to `Adafruit_SH1106G`, `SSD1306_WHITE` to `SH110X_WHITE`, `SSD1306_INVERSE` to `SH110X_INVERSE`, and `display.begin(SSD1306_SWITCHCAPVCC, foundAddr)` to `display.begin(foundAddr, true)`.

**The top of the picture is yellow.**
You have a two colour module. The top 16 rows are always yellow. Nothing is broken.

**The board shows up on the PC for a moment and then disappears.**
Try another USB cable or another USB port. Charging only cables are a common cause.
