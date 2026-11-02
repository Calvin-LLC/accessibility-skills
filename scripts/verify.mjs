#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const runner = join(root, "scripts", "wcag.mjs");

const CASES = [
	{
		fixture: "good.html",
		args: [],
		clean: true,
	},
	{
		fixture: "bad.html",
		args: [],
		expect: [
			["1.1.1", "image-alt"],
			["1.1.1", "filename-alt"],
			["1.3.5", "autocomplete-missing"],
			["1.4.2", "autoplay-audio"],
			["1.4.3", "contrast:text"],
			["1.4.3", "text-over-image"],
			["1.4.4", "viewport-zoom-lock"],
			["1.4.10", "horizontal-scroll-320"],
			["1.4.11", "control-boundary"],
			["2.1.1", "click-without-keyboard"],
			["2.1.1", "role-without-tabindex"],
			["2.4.1", "bypass-blocks"],
			["2.4.4", "link-name"],
			["2.4.7", "no-focus-indicator"],
			["2.4.11", "focus-obscured"],
			["2.5.8", "too-small"],
			["3.1.1", "html-lang"],
			["3.3.8", "paste-blocked"],
			["4.1.2", "nameless-control"],
		],
	},
	{
		fixture: "edge.html",
		args: ["--probe-keys"],
		expect: [
			["1.4.3", "contrast:placeholder"],
			["1.4.3", "contrast:text"],
			["1.4.12", "clipped-text-spacing"],
			["1.4.13", "hover:not-dismissible"],
			["2.1.2", "keyboard:trap"],
			["2.4.1", "skip-link-target-missing"],
			["2.4.3", "positive-tabindex"],
			["2.5.2", "down-event-only"],
			["3.2.2", "onchange-navigation"],
		],
		absent: [["1.4.3", "#767676 on #ffffff"], ["1.4.3", "#949494 on #ffffff"]],
	},
	{
		fixture: "orientation.html",
		args: [],
		expect: [["1.3.4", "orientation-locked"], ["2.2.1", "meta-refresh"]],
	},
	{
		fixture: "themes.html",
		args: ["--media", "prefers-color-scheme=dark,prefers-reduced-motion=reduce"],
		expect: [["1.4.3", "contrast:text"], ["2.2.2", "reduced-motion-ignored"]],
		absentChecks: [],
	},
	{
		fixture: "forms.html",
		args: ["--interact", "--only", "forms"],
		expect: [["3.3.1", "error-not-identified"], ["3.3.1", "error-not-linked"], ["4.1.3", "error-not-announced"]],
		exactly: { "forms:error-not-identified": 1, "forms:error-not-linked": 1, "forms:error-not-announced": 1 },
	},
];

const dir = mkdtempSync(join(process.env.TMPDIR ?? tmpdir(), "wcag-verify-"));
let failures = 0;
const say = (ok, label, detail = "") => {
	if (!ok) failures++;
	process.stdout.write(`${ok ? "ok  " : "FAIL"} ${label}${detail ? "  " + detail : ""}\n`);
};

try {
	for (const c of CASES) {
		const out = join(dir, c.fixture + ".json");
		const run = spawnSync(process.execPath, [runner, join(root, "fixtures", c.fixture), "--quiet", "--out", out, ...c.args], { encoding: "utf8" });
		const label = `${c.fixture} ${c.args.join(" ")}`.trim();
		if (run.status !== 0 && run.status !== 2) {
			say(false, label, `runner exited ${run.status}: ${(run.stderr || "").trim().slice(0, 200)}`);
			continue;
		}
		const report = JSON.parse(readFileSync(out, "utf8"));
		const broken = report.checks.filter((k) => k.error);
		say(broken.length === 0, `${label}: every check ran`, broken.map((k) => `${k.id}: ${k.error}`).join("; "));
		const has = (sc, needle) => report.findings.some((f) => f.sc === sc && [f.check, f.message, ...(f.alsoFlaggedBy ?? [])].some((t) => t.includes(needle)));
		if (c.clean) say(report.findings.length === 0 && run.status === 0, `${label}: no findings and exit 0`, `${report.findings.length} findings`);
		for (const [sc, needle] of c.expect ?? []) say(has(sc, needle), `${label}: ${sc} ${needle}`);
		for (const [sc, needle] of c.absent ?? []) say(!has(sc, needle), `${label}: no ${sc} finding for ${needle}`);
		for (const [check, n] of Object.entries(c.exactly ?? {})) {
			const got = report.findings.filter((f) => f.check === check).length;
			say(got === n, `${label}: exactly ${n} of ${check}`, `got ${got}`);
		}
		if (c.expect) say(run.status === 2, `${label}: exit code 2 on failures`);
	}
} finally {
	rmSync(dir, { recursive: true, force: true });
}

process.stdout.write(failures ? `\n${failures} check(s) failed\n` : "\nall checks passed\n");
process.exit(failures ? 1 : 0);
