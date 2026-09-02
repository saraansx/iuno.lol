// Matches the OS default cursor size.
export const CURSOR_PX = 32;

/**
 * The hotspot is the pixel the browser treats as the actual pointer. Left
 * unspecified it defaults to the image's top-left corner, so the real click
 * point sits up to 32px above and to the left of where the cursor looks like it
 * is — hovering something visually then misses it. Centring the hotspot lines
 * the two up, which only holds because every stored cursor is padded out to a
 * square `CURSOR_PX` canvas; a coordinate outside the image is undefined
 * behaviour across browsers.
 */
export const CURSOR_HOTSPOT = CURSOR_PX / 2;
