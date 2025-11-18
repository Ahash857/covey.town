# Emote Asset Generation Pipeline
* This document outlines the procedure for sourcing, processing, and implementing new emote animations for the Covey.Town frontend.

## 1. Asset Selection Criteria
When selecting source GIFs, ensure animations are "Safe for Work" (SFW), and professional enough for use in corporate virtual environments. To maintain visual consistency, prioritize animations that can be easily simplified into a pixel-art style without losing readability.

## 2. Processing Workflow
Step 1: Sourcing
* Locate a suitable reaction GIF on Tenor or Giphy.
* Download the source file (GIF format).

Step 2: Preparation for Pixelation
* Navigate to [Ezgif GIF to Video](https://ezgif.com/video-to-gif).
* Upload the downloaded GIF and convert it to MP4 format.
* Reasoning: The pixelation tool in the next step requires video input.

Step 3: Stylization (Pixel Art Effect)
* Upload the MP4 to [Blur.me](Blur.me) .
* Apply the Pixelate effect to downsample the resolution, matching the 8-bit aesthetic of Covey.Town.
* Download the processed video.

Step 4: Re-conversion
* Return to [Ezgif Video to GIF](https://ezgif.com/video-to-gif).
* Convert the pixelated MP4 back into GIF format.
* Tip: Adjust the frame rate here if the file size is too large.

Step 5: Background Removal

Make the background transparent using one of the following tools:
* [Unscreen.com](Unscreen.com) (Best for complex movement).
* [OnlineGifTools](https://onlinegiftools.com/remove-gif-background)
* [Ezgif](https://ezgif.com/remove-background)

Step 6: Sprite Sheet Generation
* Navigate to [Ezgif GIF to Sprite Sheet](https://ezgif.com/gif-to-sprite).
* Upload the transparent, pixelated GIF.
* Configuration:
  * Select "Custom grid" (auto row, 5 columns).
  * Ensure frames are aligned without padding.
* Download the final PNG sprite sheet.

## Implementation Notes
Save the final sheet to frontend/public/assets/emotes/.

* Update the frontend configuration to map the new texture key to the sprite sheet.