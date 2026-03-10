import { spawn } from "node:child_process";
import path from "node:path";

const cliExePath = path.resolve(
  process.cwd(),
  "../cli/src/bin/Debug/net8.0/cli.exe",
);

export interface CliOutputChunk {
  stream: "stdout" | "stderr";
  text: string;
}

export function runCli(
  command: string,
  args: string[] = [],
  onOutput?: (chunk: CliOutputChunk) => void,
) {
  return new Promise((resolve, reject) => {
    const cli = spawn(cliExePath, [command, ...args]);

    let stdout = "";
    let stderr = "";

    cli.stdout.on("data", (data) => {
      const text = data.toString();
      stdout += text;
      onOutput?.({
        stream: "stdout",
        text,
      });
    });

    cli.stderr.on("data", (data) => {
      const text = data.toString();
      stderr += text;
      onOutput?.({
        stream: "stderr",
        text,
      });
    });

    cli.on("error", (error) => {
      reject(error);
    });

    cli.on("close", (code) => {
      const trimmedStdout = stdout.trim();
      const trimmedStderr = stderr.trim();

      if (code !== 0) {
        reject(
          new Error(
            [
              `CLI exited with code ${code}.`,
              trimmedStderr && `stderr:\n${trimmedStderr}`,
              trimmedStdout && `stdout:\n${trimmedStdout}`,
            ]
              .filter(Boolean)
              .join("\n\n"),
          ),
        );
        return;
      }

      try {
        resolve(JSON.parse(trimmedStdout));
      } catch {
        reject(
          new Error(
            [
              "CLI returned invalid JSON.",
              trimmedStderr && `stderr:\n${trimmedStderr}`,
              trimmedStdout && `stdout:\n${trimmedStdout}`,
            ]
              .filter(Boolean)
              .join("\n\n"),
          ),
        );
      }
    });
  });
}
