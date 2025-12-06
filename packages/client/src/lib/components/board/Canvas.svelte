<script lang="ts">
  import { getSocket } from "$lib/api/socket";
  import {
    currentRoom,
    cursors,
    isDrawing,
    pixels,
    selectedColor,
    brushSize,
    symmetryMode,
    users,
  } from "$lib/stores";
  import { assert, BOARD_SIZE, getPixelCoords, PIXEL_SIZE } from "$lib/utils";
  import { onMount } from "svelte";

  let canvas: HTMLCanvasElement;
  let mousePos = $state<{ x: number; y: number } | null>(null);

  const getSymmetricPositions = (x: number, y: number): { x: number; y: number }[] => {
    const center = (BOARD_SIZE - 1) / 2;
    const positions: { x: number; y: number }[] = [{ x, y }];

    if ($symmetryMode === "none") return positions;

    if ($symmetryMode === "horizontal" || $symmetryMode === "both") {
      const mirrorX = BOARD_SIZE - 1 - x;
      positions.push({ x: mirrorX, y });
    }

    if ($symmetryMode === "vertical" || $symmetryMode === "both") {
      const mirrorY = BOARD_SIZE - 1 - y;
      positions.push({ x, y: mirrorY });
    }

    if ($symmetryMode === "both") {
      const mirrorX = BOARD_SIZE - 1 - x;
      const mirrorY = BOARD_SIZE - 1 - y;
      positions.push({ x: mirrorX, y: mirrorY });
    }

    if ($symmetryMode === "radial4") {
      const dx = x - center;
      const dy = y - center;
      positions.push(
        { x: Math.round(center - dx), y: Math.round(center - dy) },
        { x: Math.round(center + dy), y: Math.round(center - dx) },
        { x: Math.round(center - dy), y: Math.round(center + dx) },
      );
    }

    if ($symmetryMode === "radial8") {
      const dx = x - center;
      const dy = y - center;
      positions.push(
        { x: Math.round(center - dx), y: Math.round(center + dy) },
        { x: Math.round(center + dx), y: Math.round(center - dy) },
        { x: Math.round(center - dx), y: Math.round(center - dy) },
        { x: Math.round(center + dy), y: Math.round(center + dx) },
        { x: Math.round(center - dy), y: Math.round(center + dx) },
        { x: Math.round(center + dy), y: Math.round(center - dx) },
        { x: Math.round(center - dy), y: Math.round(center - dx) },
      );
    }

    return positions;
  };

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
      const cursorSize = cursor.size || 1;
      const width = cursorSize * PIXEL_SIZE;
      const height = cursorSize * PIXEL_SIZE;

      // Draw fancy cursor with glow effect
      ctx.shadowColor = cursor.color;
      ctx.shadowBlur = 8;

      // Outer glow border
      ctx.strokeStyle = cursor.color;
      ctx.lineWidth = 3;
      ctx.strokeRect(
        x - 1,
        y - 1,
        width + 2,
        height + 2,
      );

      // Inner highlight
      ctx.shadowBlur = 0;
      ctx.strokeStyle = cursor.color;
      ctx.lineWidth = 1.5;
      ctx.strokeRect(
        x + 2,
        y + 2,
        width - 4,
        height - 4,
      );

      // Corner accents
      const cornerSize = 4;
      ctx.fillStyle = cursor.color;
      // Top-left corner
      ctx.fillRect(x - 2, y - 2, cornerSize, cornerSize);
      // Top-right corner
      ctx.fillRect(x + width - 2, y - 2, cornerSize, cornerSize);
      // Bottom-left corner
      ctx.fillRect(x - 2, y + height - 2, cornerSize, cornerSize);
      // Bottom-right corner
      ctx.fillRect(x + width - 2, y + height - 2, cornerSize, cornerSize);

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

    // Draw local cursor preview with symmetry
    if (mousePos) {
      const cursorSize = $brushSize;
      const cursorColor = $selectedColor === "#ERASER" ? "#888888" : $selectedColor;
      const offset = Math.floor(cursorSize / 2);

      const previewPixels = new Set<string>();

      for (let dx = -offset; dx < cursorSize - offset; dx++) {
        for (let dy = -offset; dy < cursorSize - offset; dy++) {
          const brushX = mousePos.x + dx;
          const brushY = mousePos.y + dy;

          const symmetricPositions = getSymmetricPositions(brushX, brushY);

          for (const pos of symmetricPositions) {
            if (pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE) {
              previewPixels.add(`${pos.x},${pos.y}`);
            }
          }
        }
      }

      // Draw preview pixels
      ctx.globalAlpha = 0.5;
      ctx.fillStyle = cursorColor;

      for (const key of previewPixels) {
        const [x, y] = key.split(",").map(Number);
        ctx.fillRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }

      // Draw border around preview pixels for visibility
      ctx.globalAlpha = 0.8;
      ctx.strokeStyle = cursorColor;
      ctx.lineWidth = 1;

      for (const key of previewPixels) {
        const [x, y] = key.split(",").map(Number);
        ctx.strokeRect(x * PIXEL_SIZE, y * PIXEL_SIZE, PIXEL_SIZE, PIXEL_SIZE);
      }

      ctx.globalAlpha = 1.0;
    }
  };

  const handleMouseDown = (e: MouseEvent) => {
    isDrawing.set(true);
    const { x, y } = getPixelCoords(canvas, e.clientX, e.clientY);
    drawPixel(x, y);
  };

  let lastCursorEmit = 0;
  let lastDrawPos = { x: -1, y: -1 };

  const handleMouseMove = (e: MouseEvent) => {
    const { x, y } = getPixelCoords(canvas, e.clientX, e.clientY);

    // Update local cursor position
    mousePos = { x, y };

    // Throttle cursor-move events to 50ms
    const now = Date.now();
    if (now - lastCursorEmit > 50) {
      const cursorColor = $selectedColor === "#ERASER" ? "#888888" : $selectedColor;
      getSocket()?.emit("cursor-move", { x, y, color: cursorColor, size: $brushSize });
      lastCursorEmit = now;
    }

    // Only draw if position changed
    if ($isDrawing && (lastDrawPos.x !== x || lastDrawPos.y !== y)) {
      drawPixel(x, y);
      lastDrawPos = { x, y };
    }
  };

  const handleMouseUp = () => {
    isDrawing.set(false);
    lastDrawPos = { x: -1, y: -1 };
  };

  const handleMouseLeave = () => {
    lastDrawPos = { x: -1, y: -1 };
    mousePos = null;
  };

  const handleGlobalMouseUp = () => {
    isDrawing.set(false);
    lastDrawPos = { x: -1, y: -1 };
  };

  const drawPixel = (x: number, y: number) => {
    const socket = getSocket();
    if (!socket) return;

    const size = $brushSize;
    const pixels: { x: number; y: number }[] = [];
    const pixelSet = new Set<string>();

    // Calculate brush offset to center it
    const offset = Math.floor(size / 2);

    // For each pixel in the centered brush, get its symmetric positions
    for (let dx = -offset; dx < size - offset; dx++) {
      for (let dy = -offset; dy < size - offset; dy++) {
        const brushX = x + dx;
        const brushY = y + dy;

        // Get symmetric positions for this specific brush pixel
        const symmetricPositions = getSymmetricPositions(brushX, brushY);

        for (const pos of symmetricPositions) {
          if (pos.x >= 0 && pos.x < BOARD_SIZE && pos.y >= 0 && pos.y < BOARD_SIZE) {
            const key = `${pos.x},${pos.y}`;
            if (!pixelSet.has(key)) {
              pixelSet.add(key);
              pixels.push({ x: pos.x, y: pos.y });
            }
          }
        }
      }
    }

    if (pixels.length === 0) return;

    if ($selectedColor === "#ERASER") {
      socket.emit("batch-erase-pixels", { pixels });
    } else {
      socket.emit("batch-draw-pixels", { pixels, color: $selectedColor });
    }
  };

  $effect(() => {
    if (mousePos && canvas) {
      draw();
    }
  });

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
    canvas.addEventListener("mouseleave", handleMouseLeave);

    // Listen for mouseup globally to stop drawing even outside canvas
    window.addEventListener("mouseup", handleGlobalMouseUp);

    const unsub1 = pixels.subscribe(scheduleRedraw);
    const unsub2 = cursors.subscribe(scheduleRedraw);
    const unsub3 = currentRoom.subscribe(scheduleRedraw);
    const unsub4 = users.subscribe(scheduleRedraw);
    const unsub5 = brushSize.subscribe(scheduleRedraw);

    return () => {
      unsub1();
      unsub2();
      unsub3();
      unsub4();
      unsub5();

      if (animationFrameId !== null) {
        cancelAnimationFrame(animationFrameId);
      }

      window.removeEventListener("mouseup", handleGlobalMouseUp);

      if (canvas) {
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  });
</script>

<canvas
  bind:this={canvas}
  width={BOARD_SIZE * PIXEL_SIZE}
  height={BOARD_SIZE * PIXEL_SIZE}
  class="border-4 border-gray-300 rounded-lg shadow-lg w-full"
  style="cursor: none;"
></canvas>
