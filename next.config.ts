import type { NextConfig } from "next";

const isDev = process.argv.includes("dev");
const isBuild = process.argv.includes("build");

export default async function config(): Promise<NextConfig> {
  if (!process.env.VELITE_STARTED && (isDev || isBuild)) {
    process.env.VELITE_STARTED = "1";
    const { build } = await import("velite");
    await build({ watch: isDev, clean: !isDev });
  }

  return {
    output: "standalone",
    allowedDevOrigins: ["192.168.1.138", "192.168.1.*"],
  };
}
