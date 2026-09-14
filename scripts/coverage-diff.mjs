#!/usr/bin/env node
/**
 * Compare two vitest json-summary coverage reports and emit a markdown diff
 * highlighting the biggest per-file increases and decreases.
 *
 * Usage: node scripts/coverage-diff.mjs <head-summary.json> <base-summary.json> [out.md]
 */
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import path from "node:path";

const [headPath, basePath, outPath = "coverage-diff.md"] = process.argv.slice(2);

const MARKER = "<!-- coverage-diff -->";

function load(p) {
  if (!p || !existsSync(p)) return null;
  try {
    return JSON.parse(readFileSync(p, "utf8"));
  } catch {
    return null;
  }
}

const head = load(headPath);
const base = load(basePath);

function write(md) {
  writeFileSync(outPath, `${MARKER}\n${md}\n`);
  console.log(md);
}

if (!head) {
  write("### Coverage diff\n\nNo coverage report was produced for this branch.");
  process.exit(0);
}

const pct = (entry) => (entry && entry.pct != null ? Number(entry.pct) : null);
const rel = (key) => path.relative(process.cwd(), key).replace(/\\/g, "/") || key;
const sign = (n) => `${n > 0 ? "+" : ""}${n.toFixed(2)}`;
const arrow = (n) => (n > 0.005 ? "🟢" : n < -0.005 ? "🔴" : "⚪");

const totalHead = pct(head.total?.lines);
const totalBase = base ? pct(base.total?.lines) : null;

const lines = [];
lines.push("### Coverage diff (lines %)");
lines.push("");

if (!base) {
  lines.push(
    `Total: **${totalHead?.toFixed(2) ?? "n/a"}%** — no base-branch coverage available to compare against.`,
  );
  write(lines.join("\n"));
  process.exit(0);
}

const totalDelta = (totalHead ?? 0) - (totalBase ?? 0);
lines.push(
  `Total: **${totalHead?.toFixed(2)}%** vs base **${totalBase?.toFixed(2)}%** → ${arrow(totalDelta)} **${sign(totalDelta)} pp**`,
);
lines.push("");

const files = new Set([
  ...Object.keys(head).filter((k) => k !== "total"),
  ...Object.keys(base).filter((k) => k !== "total"),
]);

const rows = [];
for (const file of files) {
  const h = pct(head[file]?.lines);
  const b = pct(base[file]?.lines);
  if (h == null && b == null) continue;
  const status = h == null ? "removed" : b == null ? "new" : "changed";
  const delta = (h ?? 0) - (b ?? 0);
  if (status === "changed" && Math.abs(delta) < 0.01) continue;
  rows.push({ file: rel(file), h, b, delta, status });
}

if (rows.length === 0) {
  lines.push("No per-file coverage changes.");
  write(lines.join("\n"));
  process.exit(0);
}

const up = rows.filter((r) => r.delta > 0).sort((a, b) => b.delta - a.delta).slice(0, 10);
const down = rows.filter((r) => r.delta < 0).sort((a, b) => a.delta - b.delta).slice(0, 10);

const table = (title, list) => {
  if (list.length === 0) return;
  lines.push(`#### ${title}`);
  lines.push("");
  lines.push("| File | Base | PR | Δ |");
  lines.push("| --- | ---: | ---: | ---: |");
  for (const r of list) {
    lines.push(
      `| \`${r.file}\`${r.status === "new" ? " _(new)_" : r.status === "removed" ? " _(removed)_" : ""} | ${r.b == null ? "—" : `${r.b.toFixed(2)}%`} | ${r.h == null ? "—" : `${r.h.toFixed(2)}%`} | ${arrow(r.delta)} ${sign(r.delta)} |`,
    );
  }
  lines.push("");
};

table("Biggest increases", up);
table("Biggest decreases", down);

lines.push(`<sub>${rows.length} file(s) changed coverage. Showing up to 10 per direction.</sub>`);

write(lines.join("\n"));
