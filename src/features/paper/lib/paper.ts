import {
  Camera,
  CanvasTexture,
  LinearFilter,
  Mesh,
  NoBlending,
  PlaneGeometry,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer,
} from "three";
import { drawRelief, measureRelief, type Rect } from "./relief";

type PaperOptions = {
  /** The light rested on the secret comment pressed into the paper. */
  onSecretFound: () => void;
};

/** Per theme: how strongly the paper shows its relief. */
const LOOKS = {
  // `fill` tints the pressed letters themselves where the light lands, so the
  // code reads as words and not just as edges.
  light: {
    shadow: [0.25, 0.18, 0.06],
    shadowK: 0.62,
    highlightK: 1,
    fill: [0.2, 0.15, 0.06],
    fillK: 0.42,
    ink: 0,
  },
  dark: {
    shadow: [0, 0, 0],
    shadowK: 0.9,
    highlightK: 0.3,
    fill: [1, 1, 1],
    fillK: 0.3,
    ink: 0,
  },
  blueprint: {
    shadow: [0, 0.02, 0.1],
    shadowK: 0.6,
    highlightK: 0.35,
    fill: [1, 1, 1],
    fillK: 0.35,
    ink: 1,
  },
} as const;

const LIGHT_HEIGHT = 110; // css px above the paper: low, so it rakes
const LIGHT_RADIUS = 320;
const AMBIENT = 0.45; // the relief reads quietly at rest; the light brings it up
const SECRET_DWELL = 1.2; // seconds of light on the secret comment to count as found

const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;

  uniform sampler2D uRelief;
  uniform vec2 uReliefSize;
  uniform vec2 uViewport;
  uniform float uDpr;
  uniform vec2 uOffset;
  uniform vec3 uLight;
  uniform float uIntensity;
  uniform float uRadius;
  uniform float uAmbient;
  uniform float uStep;
  uniform vec3 uShadow;
  uniform float uShadowK;
  uniform float uHighlightK;
  uniform float uInk;
  uniform vec3 uFill;
  uniform float uFillK;

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
      mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  // Paper fibres: noise stretched along one axis, like laid paper.
  float fibres(vec2 p) {
    return noise(p * vec2(0.55, 0.12)) * 0.6 + noise(p * vec2(1.6, 0.4) + 7.0) * 0.4;
  }

  float relief(vec2 page) {
    vec2 uv = page / uReliefSize;
    if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) return 0.0;
    return texture2D(uRelief, vec2(uv.x, 1.0 - uv.y)).r;
  }

  void main() {
    // Viewport css px with a top-left origin, then page coordinates.
    vec2 p = vec2(gl_FragCoord.x, uViewport.y * uDpr - gl_FragCoord.y) / uDpr;
    vec2 page = p + uOffset;

    float e = uStep;
    vec2 slope = vec2(
      relief(page + vec2(e, 0.0)) - relief(page - vec2(e, 0.0)),
      relief(page + vec2(0.0, e)) - relief(page - vec2(0.0, e))
    ) / (2.0 * e) * 3.4;

    float f = fibres(page);
    vec2 fibreSlope = vec2(fibres(page + vec2(1.0, 0.0)) - f, fibres(page + vec2(0.0, 1.0)) - f) * 0.2;

    // The cursor's light rakes across relief and fibres; a fixed ambient light
    // from the top left only ever grazes the relief.
    vec3 lit = normalize(vec3(-(slope + fibreSlope), 1.0));
    vec3 still = normalize(vec3(-slope, 1.0));
    vec3 toLight = vec3(uLight.xy - p, uLight.z);
    vec3 l = normalize(toLight);
    float falloff = uIntensity * exp(-dot(toLight.xy, toLight.xy) / (uRadius * uRadius));
    vec3 ambient = normalize(vec3(-0.55, -0.75, 0.65));
    // Flat paper gives 0: only slopes add light or shade.
    float shade = (dot(lit, l) - l.z) * falloff + (dot(still, ambient) - ambient.z) * uAmbient;

    float highlight = max(shade, 0.0) * uHighlightK;
    float shadow = max(-shade, 0.0) * uShadowK;
    float h = relief(page);
    float ink = uInk * h * 0.5;
    float fill = h * falloff * uFillK;
    float alpha = highlight + shadow + ink + fill;
    vec3 color = vec3(highlight + ink) + uShadow * shadow + uFill * fill;
    float limit = 0.85;
    if (alpha > limit) {
      color *= limit / alpha;
      alpha = limit;
    }
    // Premultiplied: the page's own background shows through untouched paper.
    gl_FragColor = vec4(color, alpha);
  }
`;

function currentLook() {
  const root = document.documentElement.classList;
  if (root.contains("blueprint")) return LOOKS.blueprint;
  if (root.contains("dark")) return LOOKS.dark;
  return LOOKS.light;
}

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Blind-embossed paper. The site's own source code is pressed into the
 * background and only shows where a low light, held by the cursor, rakes
 * across it. Returns a cleanup function.
 */
export function createPaper(
  canvas: HTMLCanvasElement,
  { onSecretFound }: PaperOptions,
) {
  const renderer = new WebGLRenderer({
    canvas,
    alpha: true,
    antialias: false,
    premultipliedAlpha: true,
    powerPreference: "low-power",
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setClearColor(0x000000, 0);

  const reliefCanvas = document.createElement("canvas");
  const texture = new CanvasTexture(reliefCanvas);
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;

  const uniforms = {
    uRelief: { value: texture },
    uReliefSize: { value: new Vector2(1, 1) },
    uViewport: { value: new Vector2(1, 1) },
    uDpr: { value: renderer.getPixelRatio() },
    uOffset: { value: new Vector2() },
    uLight: { value: new Vector3(-1000, -1000, LIGHT_HEIGHT) },
    uIntensity: { value: 0 },
    uRadius: { value: LIGHT_RADIUS },
    uAmbient: { value: AMBIENT },
    uStep: { value: 1.5 },
    uShadow: { value: new Vector3() },
    uShadowK: { value: 0 },
    uHighlightK: { value: 0 },
    uInk: { value: 0 },
    uFill: { value: new Vector3() },
    uFillK: { value: 0 },
  };
  const material = new ShaderMaterial({
    uniforms,
    vertexShader,
    fragmentShader,
    blending: NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  const geometry = new PlaneGeometry(2, 2);
  const quad = new Mesh(geometry, material);
  quad.frustumCulled = false;
  const camera = new Camera();

  const applyLook = () => {
    const look = currentLook();
    uniforms.uShadow.value.fromArray(look.shadow);
    uniforms.uShadowK.value = look.shadowK;
    uniforms.uHighlightK.value = look.highlightK;
    uniforms.uInk.value = look.ink;
    uniforms.uFill.value.fromArray(look.fill);
    uniforms.uFillK.value = look.fillK;
  };
  applyLook();

  // ---------- relief: re-measured whenever the page changes shape ----------
  let secret: Rect | null = null;
  const maxTexture = renderer.capabilities.maxTextureSize;
  const rebuild = () => {
    const layout = measureRelief();
    // Type needs full resolution to press cleanly; cap the canvas at ~6 MP.
    const scale = Math.min(
      1,
      Math.sqrt(6e6 / (layout.width * layout.height)),
      maxTexture / layout.height,
      maxTexture / layout.width,
    );
    secret = drawRelief(reliefCanvas, layout, scale);
    texture.dispose(); // the canvas changed size: reallocate on the GPU
    texture.needsUpdate = true;
    uniforms.uReliefSize.value.set(layout.width, layout.height);
    // Sample a texel apart: the bevel comes from the soft strokes themselves.
    uniforms.uStep.value = 1 / scale;
    layoutCanvas();
  };
  let rebuildTimer = 0;
  const scheduleRebuild = () => {
    window.clearTimeout(rebuildTimer);
    rebuildTimer = window.setTimeout(rebuild, 180);
  };

  // ---------- light ----------
  const light = { x: -1000, y: -1000 };
  const target = { x: -1000, y: -1000 };
  let intensity = 0;
  let lastInput = Number.NEGATIVE_INFINITY;
  let pointerSeen = false;
  let dwell = 0;
  let found = false;
  let sweep: { start: number } | null = null;

  const onPointer = (x: number, y: number) => {
    target.x = x;
    target.y = y;
    if (!pointerSeen) {
      // First input: the light appears under the pointer instead of flying in.
      light.x = x;
      light.y = y;
      pointerSeen = true;
      sweep = null;
    }
    lastInput = performance.now();
    request();
  };
  const onPointerMove = (event: PointerEvent) =>
    onPointer(event.clientX, event.clientY);
  const onTouchMove = (event: TouchEvent) => {
    const touch = event.touches[0];
    if (touch) onPointer(touch.clientX, touch.clientY);
  };
  const onLeave = () => {
    lastInput = Number.NEGATIVE_INFINITY;
    request();
  };

  // ---------- frame loop: runs only while something moves ----------
  let frame = 0;
  let fadeTimer = 0;
  let last = 0;
  function request() {
    if (frame) return;
    frame = requestAnimationFrame(tick);
  }

  function tick(now: number) {
    frame = 0;
    const dt = last ? Math.min((now - last) / 1000, 1 / 20) : 1 / 60;
    last = now;
    let moving = false;

    if (sweep) {
      // One slow pass of light on arrival, so the relief is discovered, not explained.
      const t = (now - sweep.start) / 2600;
      if (t < 0) {
        intensity = 0;
        moving = true;
      } else if (t >= 1) {
        sweep = null;
        intensity = 0;
      } else {
        const width = window.innerWidth;
        const height = window.innerHeight;
        light.x = -0.15 * width + t * 1.3 * width;
        light.y = height * (0.3 + 0.25 * t);
        intensity = Math.sin(Math.PI * t) * 0.85;
        moving = true;
      }
    } else {
      const active = now - lastInput < 2500;
      const goal = active ? 1 : 0;
      const follow = 1 - Math.exp(-18 * dt);
      light.x += (target.x - light.x) * follow;
      light.y += (target.y - light.y) * follow;
      intensity +=
        (goal - intensity) * (1 - Math.exp(-(active ? 6 : 2.5) * dt));
      if (Math.abs(goal - intensity) < 0.002) intensity = goal;
      moving =
        intensity !== goal ||
        Math.abs(target.x - light.x) > 0.3 ||
        Math.abs(target.y - light.y) > 0.3;
      if (active) {
        // Wake again when the light should start fading out.
        window.clearTimeout(fadeTimer);
        fadeTimer = window.setTimeout(request, 2600 - (now - lastInput));
      }
    }

    // The egg: a real pointer resting its light on the secret comment.
    if (secret && !found && !sweep && intensity > 0.5) {
      const x = light.x + window.scrollX;
      const y = light.y + window.scrollY;
      const inside =
        x > secret.x - 40 &&
        x < secret.x + secret.width + 40 &&
        y > secret.y - 30 &&
        y < secret.y + secret.height + 30;
      dwell = inside ? dwell + dt : Math.max(0, dwell - dt);
      if (dwell > SECRET_DWELL) {
        found = true;
        onSecretFound();
      }
    }

    // The light lives in the viewport; the canvas lives in the page.
    uniforms.uLight.value.set(
      light.x + window.scrollX,
      light.y + window.scrollY - band.top,
      LIGHT_HEIGHT,
    );
    uniforms.uIntensity.value = intensity;
    renderer.render(quad, camera);

    if (moving) request();
    else last = 0;
  }

  // ---------- placement ----------
  // The canvas is not fixed to the screen: it sits in the page and scrolls
  // with it natively, so the relief stays locked to the content (a fixed
  // canvas redrawn on scroll always trails the compositor on phones). It
  // covers a band a few screens tall around the viewport and only moves when
  // the viewport nears its edge.
  const container = canvas.parentElement ?? canvas;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const band = { top: 0, height: 0, width: 0 };
  const maxPixels = Math.min(
    renderer.capabilities.maxTextureSize,
    renderer
      .getContext()
      .getParameter(renderer.getContext().MAX_RENDERBUFFER_SIZE) as number,
    4096,
  );

  function layoutCanvas() {
    const pageHeight = container.clientHeight;
    const width = container.clientWidth;
    const screen = Math.max(window.screen.height, window.innerHeight);
    const height = Math.max(
      1,
      Math.min(
        pageHeight,
        Math.ceil(screen * (coarse ? 3 : 2)),
        Math.floor(maxPixels / renderer.getPixelRatio()),
      ),
    );
    if (width !== band.width || height !== band.height) {
      band.width = width;
      band.height = height;
      renderer.setSize(width, height, false);
      canvas.style.height = `${height}px`;
      uniforms.uViewport.value.set(width, height);
      uniforms.uDpr.value = renderer.getPixelRatio();
    }
    place(true);
    request();
  }

  /** Moves the band when the viewport gets within a quarter screen of its edge. */
  function place(force = false) {
    const pageHeight = container.clientHeight;
    const view = window.innerHeight;
    const y = window.scrollY;
    const margin = view * 0.25;
    const bottom = band.top + band.height;
    const nearTop = band.top > 0 && y < band.top + margin;
    const nearBottom = bottom < pageHeight && y + view > bottom - margin;
    if (!force && !nearTop && !nearBottom) return false;
    const top = Math.round(
      Math.min(
        Math.max(0, y + view / 2 - band.height / 2),
        Math.max(0, pageHeight - band.height),
      ),
    );
    if (top === band.top && !force) return false;
    band.top = top;
    canvas.style.transform = `translate3d(0, ${top}px, 0)`;
    uniforms.uOffset.value.set(0, top);
    return true;
  }

  const onScroll = () => {
    // Without light the relief needs no redraw: it scrolls with the page.
    if (place() || intensity > 0 || sweep) request();
  };

  // Content grows and shrinks (collapsibles, lazy sections, fonts): re-press the relief.
  const pageObserver = new ResizeObserver(scheduleRebuild);
  pageObserver.observe(document.body);
  window.addEventListener("resize", layoutCanvas);
  const themeObserver = new MutationObserver(() => {
    applyLook();
    request();
  });
  themeObserver.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });

  const hasFinePointer = window.matchMedia("(pointer: fine)").matches;
  window.addEventListener("pointermove", onPointerMove, { passive: true });
  window.addEventListener("pointerdown", onPointerMove, { passive: true });
  window.addEventListener("touchmove", onTouchMove, { passive: true });
  window.addEventListener("scroll", onScroll, { passive: true });
  document.documentElement.addEventListener("pointerleave", onLeave);

  rebuild();
  document.fonts?.ready.then(scheduleRebuild).catch(() => {});
  if (!reducedMotion() && window.scrollY < 200 && hasFinePointer) {
    sweep = { start: performance.now() + 400 };
    request();
  }

  return () => {
    cancelAnimationFrame(frame);
    window.clearTimeout(rebuildTimer);
    window.clearTimeout(fadeTimer);
    pageObserver.disconnect();
    themeObserver.disconnect();
    window.removeEventListener("pointermove", onPointerMove);
    window.removeEventListener("pointerdown", onPointerMove);
    window.removeEventListener("touchmove", onTouchMove);
    window.removeEventListener("scroll", onScroll);
    window.removeEventListener("resize", layoutCanvas);
    document.documentElement.removeEventListener("pointerleave", onLeave);
    texture.dispose();
    geometry.dispose();
    material.dispose();
    renderer.dispose();
  };
}
