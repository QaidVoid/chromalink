<script lang="ts">
  import { getSocket } from "$lib/socket";
  import {
    currentRoom,
    cursors,
    isDrawing,
    pixels,
    selectedColor,
  } from "$lib/stores";
  import { assert, BOARD_SIZE, getPixelCoords, PIXEL_SIZE } from "$lib/utils";
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;

  const draw = () => {
    const ctx = canvas.getContext("2d");

    assert(ctx, "Canvas context is not available");

    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, BOARD_SIZE * PIXEL_SIZE, BOARD_SIZE * PIXEL_SIZE);

    // Grid
    ctx.strokeStyle = "#e0e0e0";
    ctx.lineWidth = 0.5;

    for (let x = 0; x <= BOARD_SIZE; x++) {
      ctx.beginPath();
      ctx.moveTo(x * PIXEL_SIZE, 0);
      ctx.lineTo(x * PIXEL_SIZE, BOARD_SIZE * PIXEL_SIZE);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(0, x * PIXEL_SIZE);
      ctx.lineTo(BOARD_SIZE * PIXEL_SIZE, x * PIXEL_SIZE);
      ctx.stroke();
    }

    // Pixels
    for (const [key, color] of Object.entries($pixels)) {
      const [x, y] = key.split(",").map(Number);
      ctx.fillStyle = color;
      ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
    }

    // Cursors
    for (const cursor of Object.values($cursors)) {
      ctx.strokeStyle = cursor.color;
      ctx.lineWidth = 2;
      ctx.strokeRect(
        cursor.x * PIXEL_SIZE,
        cursor.y * PIXEL_SIZE,
        PIXEL_SIZE,
        PIXEL_SIZE,
      );
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    isDrawing.set(true);
    const { x, y } = getPixelCoords(canvas, e.clientX, e.clientY);
    drawPixel(x, y);
  };

  const handleMouseMove = (e: MouseEvent) => {
    const { x, y } = getPixelCoords(canvas, e.clientX, e.clientY);
    getSocket()?.emit("cursor-move", { x, y, color: $selectedColor });
    if ($isDrawing) drawPixel(x, y);
  };

  const handleMouseUp = () => {
    isDrawing.set(false);
  };

  const drawPixel = (x: number, y: number) => {
    if (x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE) {
      getSocket()?.emit("draw-pixel", { x, y, color: $selectedColor });
    }
  };

  onMount(() => {
    draw();
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    const unsub1 = pixels.subscribe(() => requestAnimationFrame(draw));
    const unsub2 = cursors.subscribe(() => requestAnimationFrame(draw));
    const unsub3 = currentRoom.subscribe(() => requestAnimationFrame(draw));

    return () => {
      unsub1();
      unsub2();
      unsub3();

      canvas.removeEventListener("mousedown", handleMouseDown);
      canvas.removeEventListener("mousemove", handleMouseMove);
      canvas.removeEventListener("mouseup", handleMouseUp);
      canvas.removeEventListener("mouseleave", handleMouseUp);
    };
  });
</script>

<canvas
  bind:this={canvas}
  width={BOARD_SIZE * PIXEL_SIZE}
  height={BOARD_SIZE * PIXEL_SIZE}
  class="border-4 border-gray-300 rounded-lg cursor-crosshair shadow-lg w-full"
></canvas>
