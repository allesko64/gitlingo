import { git } from "./git";
import { parse } from "./parse";
import { type ShellCommand, shellCommands } from "./shell";
import type { CommandResult, Repo } from "./types";

const commands: Record<string, ShellCommand> = { ...shellCommands, git };

export function execute(repo: Repo, input: string): CommandResult {
  if (input.trim() === "") {
    return { repo, output: "" };
  }

  const parsed = parse(input);
  if (!parsed.ok) {
    return { repo, output: parsed.error };
  }

  const { command } = parsed;

  if (!Object.hasOwn(commands, command.name)) {
    return { repo, output: `command not found: ${command.name}` };
  }

  if (command.redirect !== null && command.name !== "echo") {
    return { repo, output: "> is only supported with echo" };
  }

  return commands[command.name](repo, command);
}
