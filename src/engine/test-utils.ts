import { execute } from "./execute";
import { createEmptyRepo } from "./repo";
import type { CommandResult, Repo } from "./types";

export function runAll(inputs: string[], start: Repo = createEmptyRepo()): CommandResult {
  let result: CommandResult = { repo: start, output: "" };

  for (const input of inputs) {
    result = execute(result.repo, input);
  }

  return result;
}
