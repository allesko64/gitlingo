export interface ParsedCommand {
  name: string;
  args: string[];
  redirect: string | null;
}

export type ParseResult =
  | { ok: true; command: ParsedCommand }
  | { ok: false; error: string };

export function tokenize(input: string): string[] {
  const tokens: string[] = [];
  let current = "";
  let quote: string | null = null;

  for (const char of input) {
    if (quote !== null) {
      if (char === quote) {
        quote = null;
      } else {
        current += char;
      }
    } else if (char === '"' || char === "'") {
      quote = char;
    } else if (char === " " || char === ">") {
      if (current !== "") {
        tokens.push(current);
        current = "";
      }
      if (char === ">") {
        tokens.push(">");
      }
    } else {
      current += char;
    }
  }

  if (current !== "") {
    tokens.push(current);
  }

  return tokens;
}

export function parse(input: string): ParseResult {
  const tokens = tokenize(input);
  const words: string[] = [];
  let redirect: string | null = null;

  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i] !== ">") {
      words.push(tokens[i]);
      continue;
    }

    if (i + 1 >= tokens.length || tokens[i + 1] === ">") {
      return { ok: false, error: "syntax error: expected a file name after >" };
    }
    if (redirect !== null) {
      return { ok: false, error: "syntax error: only one > is supported" };
    }

    redirect = tokens[i + 1];
    i++;
  }

  if (words.length === 0) {
    return {
      ok: false,
      error: tokens.length === 0 ? "empty command" : "syntax error: missing command before >",
    };
  }

  const [name, ...args] = words;
  return { ok: true, command: { name, args, redirect } };
}
