import careerSource from "@/features/career/components/career-section.tsx?raw";
import contactSource from "@/features/contact/components/contact-section.tsx?raw";
import nameSource from "@/features/hero/components/hero-name.tsx?raw";
import ossSource from "@/features/open-source/components/oss-section.tsx?raw";
import { SECTION_IDS } from "@/features/site/flow";

export type Rect = { x: number; y: number; width: number; height: number };

type Source = {
  path: string;
  text: string;
  /** The listing starts at the first line containing this. */
  from: string;
};

/**
 * The paper is printed over the site's own source: each empty band before a
 * section carries the real code of that section, imported at build time, so
 * it can never drift from what you are reading.
 */
const BEFORE_SECTION: Partial<Record<string, Source>> = {
  career: {
    path: "features/career/components/career-section.tsx",
    text: careerSource,
    from: "export function CareerSection",
  },
  "open-source": {
    path: "features/open-source/components/oss-section.tsx",
    text: ossSource,
    from: "export function OssSection",
  },
  contact: {
    path: "features/contact/components/contact-section.tsx",
    text: contactSource,
    from: "export function ContactSection",
  },
};

/** Next to the name: the physics that makes its letters elastic. */
const BESIDE_NAME: Source = {
  path: "features/hero/components/hero-name.tsx",
  text: nameSource,
  from: "<motion.span",
};

/** The line the egg looks for. It lives, for real, in contact-section.tsx. */
const SECRET = "psst:";

type Line = { number: number; text: string; secret: boolean };

type Listing = Rect & {
  path: string;
  lines: Line[];
  columns: number;
  fontSize: number;
  lineHeight: number;
  /** Top of each row. */
  rows: number[];
};

/** A DOM element pressed into the paper exactly where it sits. */
type Stamp = {
  text: string;
  x: number;
  /** Vertical centre of the text's line box. */
  y: number;
  font: string;
  letterSpacing: string;
};

export type ReliefLayout = {
  width: number;
  height: number;
  listings: Listing[];
  stamps: Stamp[];
};

// Sections are spaced by margins, so the band between them is empty paper.
// Keep clear of blueprint mode's outline below (8px) and its label above (~34px).
const BAND_TOP = 20;
const BAND_BOTTOM = 44;
const COLUMN_GAP = 48;

function pageRect(element: Element): Rect {
  const box = element.getBoundingClientRect();
  return {
    x: box.left + window.scrollX,
    y: box.top + window.scrollY,
    width: box.width,
    height: box.height,
  };
}

/** The box a section's content occupies, without its vertical padding. */
function contentRect(section: HTMLElement): Rect {
  const outer = pageRect(section);
  const first = section.firstElementChild;
  const last = section.lastElementChild;
  if (!first || !last) return outer;
  const top = pageRect(first).y;
  const lastRect = pageRect(last);
  return {
    x: outer.x,
    y: top,
    width: outer.width,
    height: lastRect.y + lastRect.height - top,
  };
}

/** Lays out as much of a file as fits in `rect`, starting at `source.from`. */
function listing(rect: Rect, source: Source): Listing | null {
  const fontSize = rect.width < 480 ? 11 : 13;
  const lineHeight = Math.round(fontSize * 1.6);
  const columns = rect.width >= 860 ? 2 : 1;
  const rowTops: number[] = [];
  for (
    let y = rect.y;
    y + lineHeight <= rect.y + rect.height;
    y += lineHeight
  ) {
    rowTops.push(y);
  }
  const rows = rowTops.length;
  if (rows < 4) return null;

  const all = source.text.split("\n");
  const start = Math.max(
    0,
    all.findIndex((line) => line.includes(source.from)),
  );
  const capacity = rows * columns - 1; // the first row is the file path
  const slice = all.slice(start, start + capacity);
  // Strip the indentation the slice shares, so the code sits flush left.
  const indent = Math.min(
    ...slice
      .filter((line) => line.trim())
      .map((line) => line.length - line.trimStart().length),
  );
  return {
    ...rect,
    path: source.path,
    columns,
    fontSize,
    lineHeight,
    rows: rowTops,
    lines: slice.map((text, index) => ({
      number: start + index + 1,
      text: text.slice(indent),
      secret:
        text.includes(SECRET) || Boolean(slice[index - 1]?.includes(SECRET)),
    })),
  };
}

export function measureRelief(): ReliefLayout {
  const listings: Listing[] = [];
  const contents = SECTION_IDS.map((id) => {
    const section = document.getElementById(id);
    return section
      ? { id, rect: contentRect(section), box: pageRect(section) }
      : null;
  });

  // The empty band above each section's content.
  contents.forEach((current, index) => {
    const previous = contents[index - 1];
    const source = current && BEFORE_SECTION[current.id];
    if (!current || !previous || !source) return;
    const top = previous.box.y + previous.box.height + BAND_TOP;
    const bottom = current.box.y - BAND_BOTTOM;
    const placed = listing(
      {
        x: current.rect.x,
        y: top,
        width: current.rect.width,
        height: bottom - top,
      },
      source,
    );
    if (placed) listings.push(placed);
  });

  // Beside the name, in the space its last letter leaves free.
  const name = document.querySelector("#intro h1");
  const intro = contents[0];
  if (name && intro) {
    const box = pageRect(name);
    const right = Math.max(
      ...[...name.children].map((child) => {
        const rect = pageRect(child);
        return rect.x + rect.width;
      }),
    );
    const x = right + COLUMN_GAP;
    const width = intro.rect.x + intro.rect.width - x;
    if (width >= 300) {
      const placed = listing(
        { x, y: box.y + 8, width, height: box.height - 8 },
        BESIDE_NAME,
      );
      if (placed) listings.push(placed);
    }
  }

  return {
    width: document.documentElement.clientWidth,
    height: document.documentElement.scrollHeight,
    listings,
    stamps: measureStamps(),
  };
}

/**
 * Elements marked `data-emboss` (single-line, usually with transparent text)
 * are pressed in with their own computed font, so the relief lands under the
 * real text: it can be selected, read by a screen reader, or clicked.
 */
function measureStamps(): Stamp[] {
  return [...document.querySelectorAll<HTMLElement>("[data-emboss]")].flatMap(
    (element) => {
      const text = element.textContent?.trim();
      if (!text) return [];
      const range = document.createRange();
      range.selectNodeContents(element);
      const box = range.getBoundingClientRect();
      const style = getComputedStyle(element);
      return [
        {
          text,
          x: box.left + window.scrollX,
          y: box.top + window.scrollY + box.height / 2,
          font: `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`,
          letterSpacing: style.letterSpacing,
        },
      ];
    },
  );
}

/**
 * Paints a height map: black is the paper, white is pressed up. Returns where
 * the secret comment landed, so the light can look for it.
 */
export function drawRelief(
  canvas: HTMLCanvasElement,
  layout: ReliefLayout,
  scale: number,
): Rect | null {
  canvas.width = Math.max(1, Math.ceil(layout.width * scale));
  canvas.height = Math.max(1, Math.ceil(layout.height * scale));
  const context = canvas.getContext("2d");
  if (!context) return null;

  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.scale(scale, scale);
  context.fillStyle = "#fff";
  context.textBaseline = "top";

  let secret: Rect | null = null;
  for (const block of layout.listings) {
    secret = drawListing(context, block) ?? secret;
  }

  context.textBaseline = "middle";
  context.textAlign = "left";
  for (const stamp of layout.stamps) {
    context.font = stamp.font;
    if ("letterSpacing" in context) {
      context.letterSpacing =
        stamp.letterSpacing === "normal" ? "0px" : stamp.letterSpacing;
    }
    context.fillText(stamp.text, stamp.x, stamp.y);
  }
  return secret;
}

function drawListing(
  context: CanvasRenderingContext2D,
  block: Listing,
): Rect | null {
  const { fontSize, lineHeight, columns, rows } = block;
  context.font = `600 ${fontSize}px "JetBrains Mono Variable", ui-monospace, monospace`;
  const columnWidth = (block.width - COLUMN_GAP * (columns - 1)) / columns;
  const count = rows.length;
  const gutter = context.measureText("000  ").width;
  const fit = (text: string, width: number) => {
    if (context.measureText(text).width <= width) return text;
    let cut = text;
    while (cut && context.measureText(`${cut}…`).width > width) {
      cut = cut.slice(0, -1);
    }
    return `${cut}…`;
  };

  context.fillText(fit(`// ${block.path}`, columnWidth), block.x, rows[0]);

  let secret: Rect | null = null;
  block.lines.forEach((line, index) => {
    const slot = index + 1;
    const column = Math.floor(slot / count);
    const x = block.x + column * (columnWidth + COLUMN_GAP);
    const y = rows[slot % count];
    context.fillText(String(line.number).padStart(3, " "), x, y);
    const text = fit(line.text, columnWidth - gutter);
    context.fillText(text, x + gutter, y);
    if (line.secret) {
      const width = gutter + context.measureText(text).width;
      secret = secret
        ? { ...secret, height: y + lineHeight - secret.y }
        : { x, y, width, height: lineHeight };
    }
  });
  return secret;
}
