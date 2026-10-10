import { spawn } from "node:child_process";
import { createRequire } from "node:module";
import net from "node:net";

const port = Number(process.env.PORT || 3000);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error(`Invalid development server port: ${process.env.PORT}`);
  process.exit(1);
}

const probe = net.createServer();

probe.once("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the existing Next.js server before starting another one.`);
    process.exit(1);
  }

  console.error(`Could not check whether port ${port} is available:`, error.message);
  process.exit(1);
});

probe.listen(port, () => {
  probe.close(() => {
    const require = createRequire(import.meta.url);
    const nextBin = require.resolve("next/dist/bin/next");
    const next = spawn(process.execPath, [nextBin, "dev", "--port", String(port)], {
      env: process.env,
      stdio: "inherit"
    });

    next.once("error", (error) => {
      console.error("Could not start the Next.js development server:", error.message);
      process.exitCode = 1;
    });

    next.once("exit", (code, signal) => {
      process.exitCode = code ?? (signal ? 1 : 0);
    });

    for (const signal of ["SIGINT", "SIGTERM"]) {
      process.once(signal, () => next.kill(signal));
    }
  });
});
