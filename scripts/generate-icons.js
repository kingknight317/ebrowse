/**
 * Generate 16x16, 48x48, and 128x128 PNG icons using pure Node.js standard library (zlib)
 * Zero external packages required!
 */
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function createPng(width, height, color = [59, 130, 246]) { // Tailwind blue #3b82f6
  // PNG signature
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData.writeUInt8(8, 8); // 8-bit depth
  ihdrData.writeUInt8(6, 9); // RGBA color type
  ihdrData.writeUInt8(0, 10); // deflate compression
  ihdrData.writeUInt8(0, 11); // filter method
  ihdrData.writeUInt8(0, 12); // interlace method
  const ihdrChunk = createChunk('IHDR', ihdrData);

  // Raw image data with scanline filter (filter type 0: None)
  const bytesPerPixel = 4;
  const rawData = Buffer.alloc(height * (1 + width * bytesPerPixel));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // Filter byte: 0
    for (let x = 0; x < width; x++) {
      // Draw rounded rectangle icon with link/sparkle pattern
      const dx = x - width / 2;
      const dy = y - height / 2;
      const radius = width * 0.45;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Background rounded circle
      if (dist <= radius) {
        // Inner link symbol / center light highlight
        const inCenter = Math.abs(dx) < width * 0.25 && Math.abs(dy) < height * 0.25;
        if (inCenter) {
          rawData[offset++] = 255; // R
          rawData[offset++] = 255; // G
          rawData[offset++] = 255; // B
          rawData[offset++] = 255; // A
        } else {
          rawData[offset++] = color[0];
          rawData[offset++] = color[1];
          rawData[offset++] = color[2];
          rawData[offset++] = 240;
        }
      } else {
        // Transparent
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
        rawData[offset++] = 0;
      }
    }
  }

  // Deflate compressed IDAT chunk
  const compressed = zlib.deflateSync(rawData);
  const idatChunk = createChunk('IDAT', compressed);

  // IEND chunk
  const iendChunk = createChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

function createChunk(type, data) {
  const length = data.length;
  const chunk = Buffer.alloc(8 + length + 4);
  chunk.writeUInt32BE(length, 0);
  chunk.write(type, 4, 4, 'ascii');
  data.copy(chunk, 8);
  const crc = crc32(chunk.subarray(4, 8 + length));
  chunk.writeUInt32BE(crc, 8 + length);
  return chunk;
}

// CRC32 implementation
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc ^= buf[i];
    for (let j = 0; j < 8; j++) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

// Ensure icons directory
const iconsDir = path.resolve('icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

[16, 48, 128].forEach(size => {
  const iconBuffer = createPng(size, size);
  const targetPath = path.join(iconsDir, `icon-${size}.png`);
  fs.writeFileSync(targetPath, iconBuffer);
  console.log(`Generated icon-${size}.png (${iconBuffer.length} bytes)`);
});
