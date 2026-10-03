// MAKE YOUR OWN glitch slideshow for an ESP32 + 0.96" OLED (128 x 64, I2C)
// Wiring: OLED VCC -> 3V3, GND -> GND, SDA -> G25, SCL -> G26
//
// Shows the pictures in pictures.h one after another with a glitch between them.
// To use your own art: convert each image to a 128 x 64 array with image2cpp,
// paste the arrays into pictures.h, and list their names in PICTURES at the bottom of that file.
// Needs the Adafruit SSD1306 and Adafruit GFX libraries (Library Manager).

#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>
#include "pictures.h"

const int SDA_PIN = 25;
const int SCL_PIN = 26;

const int SCREEN_W = 128;
const int SCREEN_H = 64;

// ----- settings you can change -----
const int HOLD_MS   = 1500;        // how long each picture stays on screen
const int GLITCH_MS = 720;         // how long one glitch takes. Smaller = faster
const int FRAME_MS  = 42;          // one glitch frame every 42 ms = 24 frames a second

Adafruit_SSD1306 display(SCREEN_W, SCREEN_H, &Wire, -1);

const int PIC_BYTES = SCREEN_W * SCREEN_H / 8;   // 1024 bytes per picture
uint8_t outPic[PIC_BYTES];                       // the mixed picture shown during a glitch

int  current = 0;                  // the picture on screen now
int  next = 1;                     // the picture the glitch is changing to
bool glitching = false;
unsigned long stageStart = 0;

// ---------------------------------------------------------------------
// Small helpers
// ---------------------------------------------------------------------
// Is pixel number i lit in a stored picture? (i = y * 128 + x)
bool storedPixel(const unsigned char* pic, int i) { return pgm_read_byte(pic + (i >> 3)) & (0x80 >> (i & 7)); }
bool outPixel(int i) { return outPic[i >> 3] & (0x80 >> (i & 7)); }
void setOutPixel(int i, bool on) {
  if (on) outPic[i >> 3] |= (0x80 >> (i & 7));
  else    outPic[i >> 3] &= ~(0x80 >> (i & 7));
}
float rand01() { return random(0, 10000) / 10000.0f; }          // a random number from 0 to 1

// ---------------------------------------------------------------------
// The glitch. u goes from 0 to 1.
//   first third:  the old picture, with rows torn sideways more and more
//   middle third: bands of old and new picture fighting, some rows inverted
//   last third:   the new picture, tearing less and less until it is clean
// On top: a few blocks of random noise and one bright rolling line.
// ---------------------------------------------------------------------
void glitch(const unsigned char* A, const unsigned char* B, float u, unsigned long t) {
  const unsigned char* src = u < 0.35f ? A : u > 0.65f ? B : nullptr;
  float heat = u < 0.35f ? u / 0.35f : u > 0.65f ? (1 - u) / 0.35f : 1;      // how wild it is, 0 to 1
  for (int y = 0; y < SCREEN_H; y++) {
    int band = (y >> 2) + (int)(rand01() * 3);
    const unsigned char* from = src ? src : (((band + (int)(t / 42)) & 1) ? B : A);
    int tear = rand01() < 0.18f * heat ? (int)((rand01() - 0.5f) * 30 * heat) : 0;   // shift this row sideways
    bool invert = !src && rand01() < 0.06f;
    for (int x = 0; x < SCREEN_W; x++) {
      bool v = storedPixel(from, y * SCREEN_W + ((x - tear + SCREEN_W) % SCREEN_W));
      if (invert) v = !v;
      setOutPixel(y * SCREEN_W + x, v);
    }
  }
  int blocks = (int)(6 * heat + 0.5f);                                        // blocks of noise
  for (int n = 0; n < blocks; n++) {
    int bx = (int)(rand01() * SCREEN_W), by = (int)(rand01() * SCREEN_H);
    int bw = (int)(3 + rand01() * 14), bh = (int)(1 + rand01() * 3);
    for (int y = by; y < min(SCREEN_H, by + bh); y++)
      for (int x = bx; x < min(SCREEN_W, bx + bw); x++)
        setOutPixel(y * SCREEN_W + x, rand01() < 0.5f);
  }
  if (heat > 0.5f) {                                                          // the rolling line
    int ry = (int)(t / 12) % SCREEN_H;
    for (int x = 0; x < SCREEN_W; x++)
      if ((x + ry) % 3) setOutPixel(ry * SCREEN_W + x, !outPixel(ry * SCREEN_W + x));
  }
}

// ---------------------------------------------------------------------
// Setup and loop
// ---------------------------------------------------------------------
void setup() {
  Serial.begin(115200);
  Wire.begin(SDA_PIN, SCL_PIN);
  // Most modules answer at address 0x3C. If your screen stays black, try 0x3D.
  if (!display.begin(SSD1306_SWITCHCAPVCC, 0x3C)) {
    Serial.println("OLED not found. Check the 4 wires and the address.");
    while (true) delay(1000);
  }
  randomSeed(micros());
  display.clearDisplay();
  display.drawBitmap(0, 0, PICTURES[current], SCREEN_W, SCREEN_H, SSD1306_WHITE);
  display.display();
  stageStart = millis();
}

void loop() {
  unsigned long now = millis();

  if (!glitching) {
    // holding a picture: when its time is up, start a glitch to the next one
    if (now - stageStart >= (unsigned long)HOLD_MS) {
      next = (current + 1) % PICTURE_COUNT;
      glitching = true;
      stageStart = now;
    } else {
      delay(5);
    }
    return;
  }

  float u = (float)(now - stageStart) / GLITCH_MS;
  display.clearDisplay();
  if (u >= 1) {                                                  // glitch finished: show the new picture clean
    current = next;
    glitching = false;
    stageStart = now;
    display.drawBitmap(0, 0, PICTURES[current], SCREEN_W, SCREEN_H, SSD1306_WHITE);
    display.display();
    return;
  }
  glitch(PICTURES[current], PICTURES[next], u, now - stageStart);
  display.drawBitmap(0, 0, outPic, SCREEN_W, SCREEN_H, SSD1306_WHITE);
  display.display();

  unsigned long took = millis() - now;                           // keep a steady 24 frames a second
  if (took < (unsigned long)FRAME_MS) delay(FRAME_MS - took);
}
