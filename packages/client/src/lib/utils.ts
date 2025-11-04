export const BOARD_SIZE = 48;
export const PIXEL_SIZE = 12;

export function getPixelCoords(
  canvas: HTMLCanvasElement,
  clientX: number,
  clientY: number,
) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;

  const x = Math.floor(((clientX - rect.left) * scaleX) / PIXEL_SIZE);
  const y = Math.floor(((clientY - rect.top) * scaleY) / PIXEL_SIZE);
  return { x, y };
}

export function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}
