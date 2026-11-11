const ERROR_START =
  /^(fatal|error|usage|command not found|syntax error|git:|git \w+:|cat:|touch:|ls:|merge:|CONFLICT|>)/;

const SUCCESS_START = [
  /^Initialized empty Git repository/,
  /^\[[^\]]+ [0-9a-f]{7}\] /,
  /^Switched to branch /,
  /^Merge made by /,
  /^Updating [0-9a-f]{7}\.\.[0-9a-f]{7}/,
];

export type Tone = "plain" | "success" | "hint" | "warn";

export function looksLikeError(output: string): boolean {
  return ERROR_START.test(output);
}

export function blockTone(output: string): Tone {
  if (looksLikeError(output) || /not supported/i.test(output)) {
    return "warn";
  }
  if (SUCCESS_START.some((pattern) => pattern.test(output))) {
    return "success";
  }
  return "plain";
}

export function toneLines(output: string): { text: string; tone: Tone }[] {
  const base = blockTone(output);
  return output.split("\n").map((text) => ({ text, tone: text.startsWith("hint:") ? "hint" : base }));
}
