import React, { useEffect, useRef, useState } from 'react';

const SPRITE_URL =
  'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20261030_025250_100df7b8-31fd-4614-aa4a-c1b7d5b6b273.png&w=1600&q=85';

// Sheet coordinates [x, y, w, h] normalized
const SHEET = {
  LA: [0.00, 0.06, 0.47, 0.40],
  RA: [0.53, 0.06, 0.47, 0.40],
  LB: [0.00, 0.55, 0.47, 0.40],
  RB: [0.53, 0.55, 0.47, 0.40],
} as const;

interface DotMatrixHandsProps {
  className?: string;
  showQuietZone?: boolean;
  quietZoneIntensity?: number;
  interactive?: boolean;
}

export const DotMatrixHands: React.FC<DotMatrixHandsProps> = ({
  className = '',
  showQuietZone = true,
  quietZoneIntensity = 0.85,
  interactive = true,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [useFallback, setUseFallback] = useState(false);

  // Mouse interaction state for subtle hover responsiveness
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: 0,
    y: 0,
    active: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let resizeObserver: ResizeObserver | null = null;
    let isDestroyed = false;

    // Check prefers-reduced-motion
    const reducedMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let prefersReducedMotion = reducedMotionQuery.matches;
    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
    };
    reducedMotionQuery.addEventListener('change', handleMotionChange);

    // Pre-allocated offscreen canvases for sampling
    const offscreenSampleWidth = 240;
    const offscreenSampleHeight = 200;

    const canvasLA = document.createElement('canvas');
    canvasLA.width = offscreenSampleWidth;
    canvasLA.height = offscreenSampleHeight;
    const ctxLA = canvasLA.getContext('2d');

    const canvasRA = document.createElement('canvas');
    canvasRA.width = offscreenSampleWidth;
    canvasRA.height = offscreenSampleHeight;
    const ctxRA = canvasRA.getContext('2d');

    const canvasLB = document.createElement('canvas');
    canvasLB.width = offscreenSampleWidth;
    canvasLB.height = offscreenSampleHeight;
    const ctxLB = canvasLB.getContext('2d');

    const canvasRB = document.createElement('canvas');
    canvasRB.width = offscreenSampleWidth;
    canvasRB.height = offscreenSampleHeight;
    const ctxRB = canvasRB.getContext('2d');

    // Grayscale luminance lookup buffers
    let dataLA: Float32Array | null = null;
    let dataRA: Float32Array | null = null;
    let dataLB: Float32Array | null = null;
    let dataRB: Float32Array | null = null;

    // Load sprite sheet
    const spriteImg = new Image();
    spriteImg.crossOrigin = 'anonymous';

    const sampleOffscreen = () => {
      if (!ctxLA || !ctxRA || !ctxLB || !ctxRB) return;

      const sw = spriteImg.naturalWidth;
      const sh = spriteImg.naturalHeight;
      if (sw === 0 || sh === 0) return;

      // Draw LA
      ctxLA.drawImage(
        spriteImg,
        SHEET.LA[0] * sw, SHEET.LA[1] * sh, SHEET.LA[2] * sw, SHEET.LA[3] * sh,
        0, 0, offscreenSampleWidth, offscreenSampleHeight
      );
      // Draw RA
      ctxRA.drawImage(
        spriteImg,
        SHEET.RA[0] * sw, SHEET.RA[1] * sh, SHEET.RA[2] * sw, SHEET.RA[3] * sh,
        0, 0, offscreenSampleWidth, offscreenSampleHeight
      );
      // Draw LB
      ctxLB.drawImage(
        spriteImg,
        SHEET.LB[0] * sw, SHEET.LB[1] * sh, SHEET.LB[2] * sw, SHEET.LB[3] * sh,
        0, 0, offscreenSampleWidth, offscreenSampleHeight
      );
      // Draw RB
      ctxRB.drawImage(
        spriteImg,
        SHEET.RB[0] * sw, SHEET.RB[1] * sh, SHEET.RB[2] * sw, SHEET.RB[3] * sh,
        0, 0, offscreenSampleWidth, offscreenSampleHeight
      );

      const processLuminance = (context: CanvasRenderingContext2D) => {
        const imgData = context.getImageData(0, 0, offscreenSampleWidth, offscreenSampleHeight);
        const pixels = imgData.data;
        const total = offscreenSampleWidth * offscreenSampleHeight;
        const darkness = new Float32Array(total);
        for (let i = 0; i < total; i++) {
          const r = pixels[i * 4];
          const g = pixels[i * 4 + 1];
          const b = pixels[i * 4 + 2];
          const a = pixels[i * 4 + 3] / 255;
          // Luminance formula
          const lum = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
          // White or transparent gives 0 darkness; dark gives higher value
          if (a < 0.1 || lum > 0.90) {
            darkness[i] = 0;
          } else {
            darkness[i] = Math.max(0, 1 - lum);
          }
        }
        return darkness;
      };

      try {
        dataLA = processLuminance(ctxLA);
        dataRA = processLuminance(ctxRA);
        dataLB = processLuminance(ctxLB);
        dataRB = processLuminance(ctxRB);
        setImageLoaded(true);
      } catch {
        // Pixel reading blocked by CORS or security
        setUseFallback(true);
      }
    };

    spriteImg.onload = () => {
      sampleOffscreen();
    };

    spriteImg.onerror = () => {
      setUseFallback(true);
    };

    spriteImg.src = SPRITE_URL;

    // Sizing and high-DPI
    let width = container.clientWidth || 800;
    let height = container.clientHeight || 500;

    const updateSize = () => {
      if (!canvas || !container) return;
      width = container.clientWidth;
      height = container.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    updateSize();

    resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // Mouse listener
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
        active: true,
      };
    };
    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    if (interactive) {
      container.addEventListener('mousemove', handleMouseMove);
      container.addEventListener('mouseleave', handleMouseLeave);
    }

    // Five quantized dot sizes based on baseRadius
    const getQuantizedRadius = (darkness: number, baseRadius: number): number => {
      if (darkness <= 0.08) return 0;
      if (darkness < 0.25) return baseRadius * 0.35;
      if (darkness < 0.45) return baseRadius * 0.60;
      if (darkness < 0.68) return baseRadius * 0.85;
      if (darkness < 0.85) return baseRadius * 1.10;
      return baseRadius * 1.35;
    };

    // Procedural Fallback Hand Contour if Sprite Sheet Fails / CORS Offline
    const sampleProceduralFallback = (
      nx: number,
      ny: number,
      side: 'left' | 'right',
      poseProgress: number
    ): number => {
      // Create organic hand/palm and finger silhouettes using distance field curves
      const px = side === 'left' ? nx : 1 - nx;
      const py = ny;

      // Arm wrist to palm
      const inWrist = px > 0.05 && px < 0.35 && Math.abs(py - 0.55) < 0.18 * (1 - px * 0.5);
      // Palm
      const palmDist = Math.hypot((px - 0.45) * 1.2, (py - 0.50));
      const inPalm = palmDist < 0.22;

      // Fingers reaching toward center
      let inFinger = false;
      const fingerCount = 4;
      for (let f = 0; f < fingerCount; f++) {
        const fingerY = 0.38 + f * 0.08 + Math.sin(poseProgress * Math.PI) * 0.02 * (f - 1.5);
        const fingerLength = 0.78 - Math.abs(f - 1.5) * 0.05;
        const dxF = px - 0.45;
        const dyF = py - fingerY;
        if (px >= 0.42 && px <= fingerLength && Math.abs(dyF) < 0.026) {
          inFinger = true;
          break;
        }
      }
      // Thumb
      const thumbDist = Math.hypot((px - 0.40) * 1.5, (py - 0.68) * 1.2);
      const inThumb = thumbDist < 0.09;

      if (inPalm || inFinger || inThumb || inWrist) {
        return 0.75 + 0.2 * Math.sin(px * 10 + py * 10);
      }
      return 0;
    };

    // Sample darkness from preprocessed buffers
    const sampleHand = (
      data: Float32Array | null,
      u: number, // 0 to 1 inside hand bounding box
      v: number  // 0 to 1 inside hand bounding box
    ): number => {
      if (!data) return 0;
      if (u < 0 || u >= 1 || v < 0 || v >= 1) return 0;
      const ix = Math.floor(u * offscreenSampleWidth);
      const iy = Math.floor(v * offscreenSampleHeight);
      const index = iy * offscreenSampleWidth + ix;
      return data[index] || 0;
    };

    // Animation Loop: 20-second seamless cycle
    const LOOP_DURATION = 20000; // 20s
    let startTime = performance.now();

    const render = (now: number) => {
      if (isDestroyed) return;

      const elapsed = prefersReducedMotion ? 0 : now - startTime;
      const loopTime = (elapsed % LOOP_DURATION) / LOOP_DURATION; // 0 to 1
      const loopSeconds = (elapsed % LOOP_DURATION) / 1000;

      // Responsive Grid Calculations
      const isPortrait = height > width;
      const dx = Math.max(5, width / 205);
      const dy = 2.05 * dx;
      const baseRadius = 0.46 * dx;

      // Clear Canvas
      ctx.clearRect(0, 0, width, height);

      // Animation Dynamics: counter-phase drift and subtle breathing
      const breath = Math.sin(loopTime * Math.PI * 4) * 0.025;
      const leftDriftX = Math.sin(loopTime * Math.PI * 2) * (width * 0.015);
      const leftDriftY = Math.cos(loopTime * Math.PI * 2) * (height * 0.015);
      const rightDriftX = -Math.sin(loopTime * Math.PI * 2) * (width * 0.015);
      const rightDriftY = -Math.cos(loopTime * Math.PI * 2) * (height * 0.015);

      // Subtle mouse attraction/parallax
      let mouseOffsetX = 0;
      let mouseOffsetY = 0;
      if (mouseRef.current.active) {
        const mx = mouseRef.current.x - width / 2;
        const my = mouseRef.current.y - height / 2;
        mouseOffsetX = (mx / width) * 12;
        mouseOffsetY = (my / height) * 12;
      }

      // Smoothstep Pose Switching
      // Pose A (0 - 0.40), Transition A->B (0.40 - 0.55), Pose B (0.55 - 0.85), Transition B->A (0.85 - 1.00)
      let poseProgress = 0; // 0 = 100% Pose A, 1 = 100% Pose B
      let isTransitioning = false;
      let transitionPhase = 0;

      if (loopSeconds >= 8 && loopSeconds < 11) {
        // Transition A -> B
        isTransitioning = true;
        transitionPhase = (loopSeconds - 8) / 3;
        // Smoothstep
        poseProgress = transitionPhase * transitionPhase * (3 - 2 * transitionPhase);
      } else if (loopSeconds >= 11 && loopSeconds < 17) {
        poseProgress = 1; // Pure Pose B
      } else if (loopSeconds >= 17 && loopSeconds < 20) {
        // Transition B -> A
        isTransitioning = true;
        transitionPhase = 1 - (loopSeconds - 17) / 3;
        poseProgress = transitionPhase * transitionPhase * (3 - 2 * transitionPhase);
      } else {
        poseProgress = 0; // Pure Pose A
      }

      // Hand Bounding Boxes on main Canvas
      // In landscape: left hand occupies left 55%, right hand occupies right 55% with centre fade
      // In portrait: scale down and adjust vertical offsets
      const handScale = isPortrait ? 0.75 + breath : 1.0 + breath;
      const handW = (width * 0.54) * handScale;
      const handH = (height * 0.78) * handScale;

      const leftHandX = isPortrait ? width * 0.02 + leftDriftX + mouseOffsetX * 0.5 : width * 0.03 + leftDriftX + mouseOffsetX * 0.5;
      const leftHandY = (height - handH) * 0.5 + leftDriftY + mouseOffsetY * 0.5;

      const rightHandX = isPortrait ? width * 0.44 + rightDriftX - mouseOffsetX * 0.5 : width * 0.43 + rightDriftX - mouseOffsetX * 0.5;
      const rightHandY = (height - handH) * 0.5 + rightDriftY - mouseOffsetY * 0.5;

      // Grid Rows and Columns
      const totalRows = Math.floor(height / dy);
      const totalCols = Math.floor(width / dx);

      ctx.fillStyle = '#0D0D0D'; // Dot Black

      // Scanline dot rendering loop
      for (let r = 0; r < totalRows; r++) {
        const rawY = r * dy + dy * 0.5;

        // Occasional horizontal scanline displacement during transitions (analog CRT/dot matrix glitch)
        let rowGlitchShift = 0;
        if (isTransitioning) {
          const glitchTrigger = Math.sin(r * 18.3 + loopSeconds * 12);
          if (glitchTrigger > 0.88) {
            rowGlitchShift = Math.sin(r * 45.1 + loopSeconds * 30) * 8 * (1 - Math.abs(transitionPhase - 0.5) * 2);
          }
        }

        // Row-biased glitch dissolve timing
        const rowBiasedBlend = isTransitioning
          ? Math.max(0, Math.min(1, (transitionPhase - (r / totalRows) * 0.15) / 0.85))
          : poseProgress;

        for (let c = 0; c < totalCols; c++) {
          const rawX = c * dx + dx * 0.5 + rowGlitchShift;

          // Deterministic seed per dot (consistent jitter/thinning)
          const dotSeed = Math.sin(c * 12.9898 + r * 78.233) * 43758.5453;
          const pseudoRand = dotSeed - Math.floor(dotSeed);

          // Subtle organic flicker
          const flicker = 1.0 + (pseudoRand - 0.5) * 0.08 * Math.sin(loopSeconds * 4 + dotSeed);

          // Sample Left Hand
          let darkL = 0;
          const uL = (rawX - leftHandX) / handW;
          const vL = (rawY - leftHandY) / handH;
          if (uL >= 0 && uL <= 1 && vL >= 0 && vL <= 1) {
            if (dataLA && dataLB && !useFallback) {
              const darkLA = sampleHand(dataLA, uL, vL);
              const darkLB = sampleHand(dataLB, uL, vL);
              darkL = darkLA * (1 - rowBiasedBlend) + darkLB * rowBiasedBlend;
            } else {
              darkL = sampleProceduralFallback(uL, vL, 'left', rowBiasedBlend);
            }
          }

          // Sample Right Hand
          let darkR = 0;
          const uR = (rawX - rightHandX) / handW;
          const vR = (rawY - rightHandY) / handH;
          if (uR >= 0 && uR <= 1 && vR >= 0 && vR <= 1) {
            if (dataRA && dataRB && !useFallback) {
              const darkRA = sampleHand(dataRA, uR, vR);
              const darkRB = sampleHand(dataRB, uR, vR);
              darkR = darkRA * (1 - rowBiasedBlend) + darkRB * rowBiasedBlend;
            } else {
              darkR = sampleProceduralFallback(uR, vR, 'right', rowBiasedBlend);
            }
          }

          // Centre fade so fingertips do not collide / form an ugly black clump in the exact middle
          const distToCenterX = Math.abs(rawX - width * 0.5);
          const centerFadeFactor = Math.min(1, Math.max(0, (distToCenterX - width * 0.015) / (width * 0.08)));

          // Combined darkness
          let darkness = Math.max(darkL, darkR) * centerFadeFactor;

          if (darkness <= 0.08) continue;

          // Quiet zone behind text
          if (showQuietZone) {
            // Text center region
            const qx = Math.abs(rawX - width * 0.5) / (width * 0.38);
            const qy = Math.abs(rawY - height * 0.44) / (height * 0.36);
            if (qx < 1 && qy < 1) {
              const quietFactor = Math.max(0, Math.min(1, Math.hypot(qx, qy)));
              darkness *= (1 - quietZoneIntensity * (1 - quietFactor));
            }
          }

          // Quantized dot radius
          const radius = getQuantizedRadius(darkness, baseRadius) * flicker;
          if (radius <= 0.3) continue;

          // Draw Dot
          ctx.beginPath();
          ctx.arc(rawX, rawY, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      isDestroyed = true;
      cancelAnimationFrame(animationFrameId);
      if (resizeObserver) resizeObserver.disconnect();
      reducedMotionQuery.removeEventListener('change', handleMotionChange);
      if (interactive) {
        container.removeEventListener('mousemove', handleMouseMove);
        container.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [interactive, showQuietZone, quietZoneIntensity, useFallback]);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full overflow-hidden select-none pointer-events-auto ${className}`}
      aria-label="Dot matrix connecting hands animation"
      role="img"
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

export default DotMatrixHands;
