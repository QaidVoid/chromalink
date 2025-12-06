<script lang="ts">
  import { getSocket } from "$lib/api/socket";
  import {
    currentRoom,
    cursors,
    isDrawing,
    pixels,
    selectedColor,
    users,
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

    // Cursors with usernames
    for (const [userId, cursor] of Object.entries($cursors)) {
      const x = cursor.x * PIXEL_SIZE;
      const y = cursor.y * PIXEL_SIZE;

      // Draw fancy cursor with glow effect
      ctx.shadowColor = cursor.color;
      ctx.shadowBlur = 8;

      // Outer glow border
      ctx.strokeStyle = cursor.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(
        x - 1,
        y - 1,
        PIXEL_SIZE + 2,
        PIXEL_SIZE + 2,
      );

      // Inner highlight
      ctx.shadowBlur = 0;
      ctx.strokeStyle = cursor.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        x + 2,
        y + 2,
        PIXEL_SIZE - 4,
        PIXEL_SIZE - 4,
      );

      // Corner accents
      const cornerSize = 4;
      ctx.fillStyle = cursor.color;
      // Top-left corner
      ctx.fillRect(x - 2, y - 2, cornerSize, cornerSize);
      // Top-right corner
      ctx.fillRect(x + PIXEL_SIZE - 2, y - 2, cornerSize, cornerSize);
      // Bottom-left corner
      ctx.fillRect(x - 2, y + PIXEL_SIZE - 2, cornerSize, cornerSize);
      // Bottom-right corner
      ctx.fillRect(x + PIXEL_SIZE - 2, y + PIXEL_SIZE - 2, cornerSize, cornerSize);

      ctx.shadowBlur = 0; // Reset shadow

      // Find user nickname
      const user = $users.find(u => u.id === userId);
      if (user) {
        const nickname = user.nickname;

        // Measure text to create background
        ctx.font = "bold 11px sans-serif";
        const textMetrics = ctx.measureText(nickname);
        const textWidth = textMetrics.width;
        const textHeight = 11;
        const padding = 5;
        const borderRadius = 4;

        const labelX = x;
        const labelY = y - textHeight - padding * 2 - 4;

        // Draw rounded rectangle background
        ctx.fillStyle = cursor.color;
        ctx.beginPath();
        ctx.roundRect(
          labelX - 2,
          labelY - 2,
          textWidth + padding * 2 + 4,
          textHeight + padding * 2 + 4,
          borderRadius
        );
        ctx.fill();

        // Inner background
        ctx.fillStyle = "rgba(0, 0, 0, 0.85)";
        ctx.beginPath();
        ctx.roundRect(
          labelX,
          labelY,
          textWidth + padding * 2,
          textHeight + padding * 2,
          borderRadius - 1
        );
        ctx.fill();

        // Draw text
        ctx.fillStyle = "#ffffff";
        ctx.textBaseline = "top";
        ctx.fillText(nickname, labelX + padding, labelY + padding);
      }
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
    if (!canvas) return;

    let animationFrameId: number | null = null;

    const scheduleRedraw = () => {
      if (animationFrameId === null) {
        animationFrameId = requestAnimationFrame(() => {
          draw();
          animationFrameId = null;
        });
      }
    };

    scheduleRedraw();

    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseUp);

    const unsub1 = pixels.subscribe(scheduleRedraw);
    const unsub2 = cursors.subscribe(scheduleRedraw);
    const unsub3 = currentRoom.subscribe(scheduleRedraw);
    const unsub4 = users.subscribe(scheduleRedraw);

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      if (canvas) {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseUp);
      }
    };
  });
</script>

<canvas
  bind:this={canvas}
  width={BOARD_SIZE * PIXEL_SIZE}
  height={BOARD_SIZE * PIXEL_SIZE}
  class="border-4 border-gray-300 rounded-lg cursor-crosshair shadow-lg w-full"
></canvas>
