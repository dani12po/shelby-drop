import React from "react";

/* ===============================
   TOKEN TYPES
================================ */

type Token =
  | { type: "key"; value: string }
  | { type: "string"; value: string }
  | { type: "number"; value: string }
  | { type: "boolean"; value: string }
  | { type: "null"; value: string }
  | { type: "punctuation"; value: string }
  | { type: "whitespace"; value: string };

/* ===============================
   TOKENIZER
================================ */

function tokenize(json: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  while (i < json.length) {
    const char = json[i];

    /* ===== WHITESPACE ===== */
    if (/\s/.test(char)) {
      let value = char;
      i++;
      while (i < json.length && /\s/.test(json[i])) {
        value += json[i++];
      }
      tokens.push({ type: "whitespace", value });
      continue;
    }

    /* ===== STRING / KEY ===== */
    if (char === '"') {
      let value = '"';
      i++;

      while (i < json.length) {
        const c = json[i];
        value += c;
        i++;
        if (c === '"' && json[i - 2] !== "\\") break;
      }

      let j = i;
      while (j < json.length && /\s/.test(json[j])) j++;

      const isKey = json[j] === ":";

      tokens.push({
        type: isKey ? "key" : "string",
        value,
      });
      continue;
    }

    /* ===== NUMBER ===== */
    if (/[0-9\-]/.test(char)) {
      let value = char;
      i++;
      while (
        i < json.length &&
        /[0-9eE.+-]/.test(json[i])
      ) {
        value += json[i++];
      }
      tokens.push({ type: "number", value });
      continue;
    }

    /* ===== BOOLEAN / NULL ===== */
    if (json.startsWith("true", i)) {
      tokens.push({ type: "boolean", value: "true" });
      i += 4;
      continue;
    }

    if (json.startsWith("false", i)) {
      tokens.push({ type: "boolean", value: "false" });
      i += 5;
      continue;
    }

    if (json.startsWith("null", i)) {
      tokens.push({ type: "null", value: "null" });
      i += 4;
      continue;
    }

    /* ===== PUNCTUATION ===== */
    tokens.push({
      type: "punctuation",
      value: char,
    });
    i++;
  }

  return tokens;
}

/* ===============================
   HIGHLIGHTER
================================ */

export function highlightJson(
  json: string
): JSX.Element {
  const tokens = tokenize(json);

  return (
    <code>
      {tokens.map((t, i) => {
        switch (t.type) {
          case "key":
            return (
              <span key={i} className="text-blue-400">
                {t.value}
              </span>
            );
          case "string":
            return (
              <span
                key={i}
                className="text-emerald-400"
              >
                {t.value}
              </span>
            );
          case "number":
            return (
              <span
                key={i}
                className="text-amber-400"
              >
                {t.value}
              </span>
            );
          case "boolean":
            return (
              <span
                key={i}
                className="text-purple-400"
              >
                {t.value}
              </span>
            );
          case "null":
            return (
              <span
                key={i}
                className="text-gray-400 italic"
              >
                {t.value}
              </span>
            );
          default:
            return <span key={i}>{t.value}</span>;
        }
      })}
    </code>
  );
}
