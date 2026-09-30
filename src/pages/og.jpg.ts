import path from 'node:path';
import type { APIRoute } from 'astro';
import sharp from 'sharp';

/**
 * Social preview image (/og.jpg), cut from the hero portrait at build time so
 * it can never drift from the photo on the page.
 */

const WIDTH = 1200;
const HEIGHT = 630;

/**
 * Where the 1200×630 window starts, as a share of the portrait's height once
 * scaled to 1200px wide. Picked by eye on hero.jpg: leaves headroom above the
 * head and ends at the chest. Revisit if the hero photo is replaced.
 */
const TOP = 0.147;

export const GET: APIRoute = async () => {
  // Read the file rather than importing it: an asset import yields a URL, not
  // pixels. npm always runs scripts from the package root, so this resolves.
  const source = path.resolve('src/assets/hero.jpg');

  const scaled = await sharp(source).resize(WIDTH).toBuffer({ resolveWithObject: true });
  const top = Math.min(Math.round(scaled.info.height * TOP), scaled.info.height - HEIGHT);

  const jpeg = await sharp(scaled.data)
    .extract({ left: 0, top, width: WIDTH, height: HEIGHT })
    .jpeg({ quality: 82, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: { 'Content-Type': 'image/jpeg' },
  });
};
