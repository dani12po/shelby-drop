/* ===============================
   SIMPLE MARKDOWN RENDERER
   WITH TOC + LINK + IMAGE
   + RELATIVE PATH AWARE
================================ */

export type MdInline =
  | { type: "text"; text: string }
  | {
      type: "link";
      text: string;
      href: string;
      relative: boolean;
    }
  | {
      type: "image";
      alt: string;
      src: string;
      relative: boolean;
    };

export type MdBlock =
  | {
      type: "h";
      level: number;
      content: MdInline[];
      id: string;
    }
  | { type: "p"; content: MdInline[] }
  | {
      type: "code";
      lang?: string;
      code: string;
    }
  | { type: "ul"; items: MdInline[][] }
  | { type: "hr" };

export type TocItem = {
  id: string;
  level: number;
  text: string;
};

/* ===============================
   HELPERS
================================ */

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-");
}

function isRelative(url: string): boolean {
  return (
    !url.startsWith("http://") &&
    !url.startsWith("https://") &&
    !url.startsWith("/")
  );
}

/* ===============================
   INLINE PARSER
================================ */

function parseInline(src: string): MdInline[] {
  const result: MdInline[] = [];
  let i = 0;

  while (i < src.length) {
    /* ===== IMAGE ===== */
    if (src[i] === "!" && src[i + 1] === "[") {
      const endAlt = src.indexOf("]", i + 2);
      const startSrc = src.indexOf("(", endAlt);
      const endSrc = src.indexOf(")", startSrc);

      if (
        endAlt !== -1 &&
        startSrc !== -1 &&
        endSrc !== -1
      ) {
        const rawSrc = src.slice(
          startSrc + 1,
          endSrc
        );

        result.push({
          type: "image",
          alt: src.slice(i + 2, endAlt),
          src: rawSrc,
          relative: isRelative(rawSrc),
        });

        i = endSrc + 1;
        continue;
      }
    }

    /* ===== LINK ===== */
    if (src[i] === "[") {
      const endText = src.indexOf("]", i + 1);
      const startHref = src.indexOf("(", endText);
      const endHref = src.indexOf(")", startHref);

      if (
        endText !== -1 &&
        startHref !== -1 &&
        endHref !== -1
      ) {
        const rawHref = src.slice(
          startHref + 1,
          endHref
        );

        result.push({
          type: "link",
          text: src.slice(i + 1, endText),
          href: rawHref,
          relative: isRelative(rawHref),
        });

        i = endHref + 1;
        continue;
      }
    }

    /* ===== TEXT ===== */
    result.push({
      type: "text",
      text: src[i],
    });
    i++;
  }

  return result;
}

/* ===============================
   BLOCK PARSER
================================ */

export function parseMarkdown(src: string): {
  blocks: MdBlock[];
  toc: TocItem[];
} {
  const lines = src.split("\n");
  const blocks: MdBlock[] = [];
  const toc: TocItem[] = [];

  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    /* ===== CODE BLOCK ===== */
    if (line.startsWith("```")) {
      const lang = line.slice(3).trim();
      const code: string[] = [];
      i++;

      while (
        i < lines.length &&
        !lines[i].startsWith("```")
      ) {
        code.push(lines[i]);
        i++;
      }

      blocks.push({
        type: "code",
        lang: lang || undefined,
        code: code.join("\n"),
      });

      i++;
      continue;
    }

    /* ===== HEADING ===== */
    const h = line.match(/^(#{1,6})\s+(.*)$/);
    if (h) {
      const level = h[1].length;
      const text = h[2];
      const id = slugify(text);

      blocks.push({
        type: "h",
        level,
        id,
        content: parseInline(text),
      });

      toc.push({ id, level, text });
      i++;
      continue;
    }

    /* ===== HORIZONTAL RULE ===== */
    if (/^---+$/.test(line)) {
      blocks.push({ type: "hr" });
      i++;
      continue;
    }

    /* ===== UNORDERED LIST ===== */
    if (line.startsWith("- ")) {
      const items: MdInline[][] = [];

      while (
        i < lines.length &&
        lines[i].startsWith("- ")
      ) {
        items.push(
          parseInline(lines[i].slice(2))
        );
        i++;
      }

      blocks.push({ type: "ul", items });
      continue;
    }

    /* ===== PARAGRAPH ===== */
    if (line.trim() !== "") {
      blocks.push({
        type: "p",
        content: parseInline(line),
      });
    }

    i++;
  }

  return { blocks, toc };
}
