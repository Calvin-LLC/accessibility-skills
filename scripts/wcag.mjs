#!/usr/bin/env node
import { mkdirSync, writeFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { openBrowser } from "./lib/browser.mjs";
import { CRITERIA, STATUS, summarize } from "./lib/criteria.mjs";
import axe from "./checks/axe.mjs";
import axTree from "./checks/ax-tree.mjs";
import contrast from "./checks/contrast.mjs";
import forms from "./checks/forms.mjs";
import dom from "./checks/dom.mjs";
import inputModel from "./checks/input-model.mjs";
import keyboard from "./checks/keyboard.mjs";
import reflow from "./checks/reflow.mjs";
import targets from "./checks/targets.mjs";

const MODULES = [dom, axTree, axe, contrast, targets, inputModel, keyboard, reflow, forms];
const USAGE = `usage: wcag.mjs <url|file.html> [options]
  --viewport WxH      starting viewport, default 1280x800
  --only a,b          run only these checks: ${MODULES.map((m) => m.id).join(", ")}
  --skip a,b          skip these checks
  --out FILE          write the full JSON report to FILE (default: stdout)
  --media LIST        emulate media features, e.g. prefers-color-scheme=dark,prefers-reduced-motion=reduce
  --interact          also submit empty forms (all non-GET requests blocked) to test error handling (3.3.1, 4.1.3)
  --probe-keys        press single keys with nothing focused to detect shortcuts (2.1.4); can trigger page actions
  --quiet             no human summary on stderr
  --chrome PATH       Chromium-based browser binary (or CHROME_BIN)
  --cdp PORT|URL      attach to a running browser instead of launching one
  --list-criteria     print the 55 Level A and AA criteria and exit
exit codes: 0 no failures, 2 failures found, 1 the run itself failed`;

function parse(argv) {
	const o = { viewport: [1280, 800], only: null, skip: new Set(), out: null, quiet: false, chrome: null, cdp: null, target: null, probeKeys: false, interact: false, media: [] };
	for (let i = 0; i < argv.length; i++) {
		const a = argv[i];
		const next = () => {
			if (i + 1 >= argv.length) throw new Error(`${a} needs a value`);
			return argv[++i];
		};
		if (a === "--viewport") o.viewport = next().split("x").map(Number);
		else if (a === "--only") o.only = new Set(next().split(","));
		else if (a === "--skip") next().split(",").forEach((s) => o.skip.add(s));
		else if (a === "--out") o.out = next();
		else if (a === "--quiet") o.quiet = true;
		else if (a === "--probe-keys") o.probeKeys = true;
		else if (a === "--interact") o.interact = true;
		else if (a === "--media") o.media = next().split(",").map((p) => p.split("=")).map(([name, value]) => ({ name, value }));
		else if (a === "--chrome") o.chrome = next();
		else if (a === "--cdp") o.cdp = next();
		else if (a === "--list-criteria") o.list = true;
		else if (a === "--help" || a === "-h") o.help = true;
		else if (a.startsWith("--")) throw new Error(`unknown option ${a}`);
		else o.target = a;
	}
	const MEDIA = { "prefers-color-scheme": ["light", "dark"], "prefers-reduced-motion": ["reduce", "no-preference"], "forced-colors": ["active", "none"], "prefers-contrast": ["more", "less", "no-preference"] };
	for (const m of o.media) if (!MEDIA[m.name]?.includes(m.value)) throw new Error(`--media: unsupported ${m.name}=${m.value}`);
	if (o.viewport.length !== 2 || o.viewport.some((n) => !(n >= 200))) throw new Error("--viewport must look like 1280x800");
	for (const id of [...(o.only ?? []), ...o.skip]) if (!MODULES.some((m) => m.id === id)) throw new Error(`unknown check "${id}"`);
	return o;
}

function toUrl(target) {
	if (/^(https?|file|data):/i.test(target)) return target;
	const abs = resolve(target);
	if (!existsSync(abs)) throw new Error(`no such file: ${target}`);
	return pathToFileURL(abs).href;
}

const TOPICS = {
	"html-lang": ["dom:html-lang", "axe:html-has-lang", "axe:html-lang-valid", "axe:html-xml-lang-mismatch"],
	"viewport-zoom": ["dom:viewport-zoom-lock", "axe:meta-viewport", "axe:meta-viewport-large"],
	"accessible-name": ["ax-tree:nameless-control", "axe:button-name", "axe:link-name", "axe:input-button-name", "axe:input-image-alt", "axe:label", "axe:select-name", "axe:aria-command-name", "axe:aria-input-field-name", "axe:aria-toggle-field-name", "axe:aria-dialog-name", "axe:aria-meter-name", "axe:aria-progressbar-name", "axe:aria-tooltip-name", "axe:aria-treeitem-name", "axe:summary-name"],
	"image-alt": ["ax-tree:filename-alt", "axe:image-alt", "axe:role-img-alt", "axe:svg-img-alt", "axe:object-alt", "axe:area-alt"],
	"label-in-name": ["input:label-in-name", "axe:label-content-name-mismatch"],
	"page-title": ["dom:title", "axe:document-title"],
	"autoplay": ["dom:autoplay-audio", "dom:autoplay-no-controls", "axe:no-autoplay-audio"],
	"captions": ["dom:video-captions", "axe:video-caption"],
	"bypass": ["dom:bypass-blocks", "ax-tree:no-main", "axe:bypass", "axe:region", "axe:landmark-one-main"],
	"heading-order": ["ax-tree:heading-skip", "axe:heading-order", "axe:empty-heading", "ax-tree:empty-heading"],
	"autocomplete": ["dom:autocomplete-missing", "dom:autocomplete-invalid", "axe:autocomplete-valid"],
	"meta-refresh": ["dom:meta-refresh", "axe:meta-refresh", "axe:meta-refresh-no-exceptions"],
	"vague-link": ["ax-tree:vague-link", "axe:identical-links-same-purpose"],
};
const topicOf = new Map(Object.entries(TOPICS).flatMap(([topic, ids]) => ids.map((id) => [id, topic])));
const PREFER = ["axe", "ax-tree", "dom", "input"];

function dedupe(findings) {
	const groups = new Map();
	for (const f of findings) {
		const topic = topicOf.get(f.check) ?? f.check;
		const key = [f.sc, f.kind, topic, f.selector, topicOf.has(f.check) ? "" : f.message].join("\u0000");
		const group = groups.get(key) ?? [];
		group.push(f);
		groups.set(key, group);
	}
	const out = [];
	for (const group of groups.values()) {
		group.sort((a, b) => PREFER.indexOf(a.check.split(":")[0]) - PREFER.indexOf(b.check.split(":")[0]));
		const [head, ...rest] = group;
		const also = [...new Set(rest.map((r) => r.check).filter((c) => c !== head.check))];
		out.push(also.length ? { ...head, alsoFlaggedBy: also } : head);
	}
	return out;
}

function human(report) {
	const err = (s = "") => process.stderr.write(s + "\n");
	err(`wcag ${report.url}`);
	err(`browser ${report.browser}, viewport ${report.viewport.join("x")}${report.media.length ? ", media " + report.media.map((m) => `${m.name}=${m.value}`).join(" ") : ""}`);
	err();
	for (const m of report.checks) err(`  ${m.error ? "ERROR" : "ok   "}  ${m.id.padEnd(12)} ${m.error ?? m.note ?? ""}`);
	err();
	const t = report.criteria.totals;
	err(`${t.fail} criteria with failures, ${t.review} to review by a person, ${t.clear} measured with no failures, ${t.partial} partly automated with no failures, ${t.manual} not testable by a script`);
	const order = { fail: 0, review: 1 };
	const list = [...report.findings].sort((a, b) => order[a.kind] - order[b.kind] || a.sc?.localeCompare(b.sc ?? "") || 0);
	const shown = list.slice(0, 40);
	for (const f of shown) {
		err();
		err(`${f.kind === "fail" ? "FAIL  " : "REVIEW"} ${f.sc ?? "-"}  ${f.check}`);
		err(`   ${f.message}`);
		err(`   ${f.selector}`);
		if (f.snippet) err(`   ${f.snippet}`);
	}
	if (list.length > shown.length) err(`\n... ${list.length - shown.length} more in the JSON report`);
}

async function main() {
	const opts = parse(process.argv.slice(2));
	if (opts.help) return void console.log(USAGE);
	if (opts.list) {
		for (const c of CRITERIA) console.log(`${c.num}\t${c.level}\t${c.since}\t${c.title}`);
		return;
	}
	if (!opts.target) throw new Error(USAGE);
	const url = toUrl(opts.target);

	const browser = await openBrowser({ chrome: opts.chrome, cdp: opts.cdp });
	const page = await browser.newPage();
	try {
		await page.setViewport(opts.viewport[0], opts.viewport[1]);
		if (opts.media.length) await page.emulateMedia(opts.media);
		const nav = await page.goto(url);
		await page.settle();
		const ctx = { viewport: { width: opts.viewport[0], height: opts.viewport[1] }, url, probeKeys: opts.probeKeys, media: opts.media };
		const active = MODULES.filter((m) => (!opts.only || opts.only.has(m.id)) && !opts.skip.has(m.id) && (!m.interactive || opts.interact || opts.only?.has(m.id)));
		const findings = [];
		const checks = [];
		const ran = [];
		for (const [index, mod] of active.entries()) {
			if (index > 0) {
				await page.send("Emulation.setDeviceMetricsOverride", { width: opts.viewport[0], height: opts.viewport[1], deviceScaleFactor: 1, mobile: false });
				await page.goto(url);
				await page.settle();
			}
			try {
				const res = await mod.run(page, ctx);
				for (const f of res.findings) findings.push(f);
				checks.push({ id: mod.id, note: res.note, findings: res.findings.length });
				ran.push({ id: mod.id, covers: { ...(mod.covers ?? {}), ...(res.covers ?? {}) } });
			} catch (e) {
				checks.push({ id: mod.id, error: e.message });
			}
		}
		const merged = dedupe(findings);
		const criteria = summarize(merged, ran);
		const report = {
			url,
			browser: browser.product,
			viewport: opts.viewport,
			media: opts.media,
			networkIdle: nav.networkIdle,
			startedAt: new Date().toISOString(),
			checks,
			criteria,
			findings: merged,
			pageErrors: page.consoleErrors.slice(0, 10),
			limits: "A script cannot judge meaning. Rows marked manual need a person; rows marked review are candidates. Screen reader output, captions accuracy, alt-text quality, and cognitive load are never settled here.",
		};
		const json = JSON.stringify(report, null, "\t");
		if (opts.out) {
			mkdirSync(dirname(resolve(opts.out)), { recursive: true });
			writeFileSync(opts.out, json + "\n");
		} else process.stdout.write(json + "\n");
		if (!opts.quiet) human(report);
		const broken = checks.filter((c) => c.error).length;
		process.exitCode = broken ? 1 : criteria.totals.fail > 0 ? 2 : 0;
	} finally {
		await page.close();
		await browser.close();
	}
}

main().catch((e) => {
	process.stderr.write(`${e.message}\n`);
	process.exit(1);
});
