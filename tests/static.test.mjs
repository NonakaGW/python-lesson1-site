import test from "node:test";
import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const siteRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");

test("all local files referenced by index.html exist", async () => {
  const html = await readFile(resolve(siteRoot, "index.html"), "utf8");
  const relativeReferences = [
    ...html.matchAll(/(?:href|src)="(\.\/[^"#]+)(?:#[^"]*)?"/g),
  ].map((match) => match[1]);

  assert.ok(relativeReferences.length >= 4);
  for (const reference of relativeReferences) {
    await access(resolve(siteRoot, reference));
  }
});

test("page contains all three learning sections", async () => {
  const html = await readFile(resolve(siteRoot, "index.html"), "utf8");
  assert.match(html, /data-view-panel="materials"/);
  assert.match(html, /data-view-panel="game"/);
  assert.match(html, /data-view-panel="quiz"/);
});

test("wrong quiz feedback does not reveal the correct answer", async () => {
  const appSource = await readFile(resolve(siteRoot, "app.mjs"), "utf8");
  assert.doesNotMatch(appSource, /正解は「/);
  assert.match(appSource, /不正解です。授業資料を確認して/);
});

test("workspace groups split cards into command lines", async () => {
  const appSource = await readFile(resolve(siteRoot, "app.mjs"), "utf8");
  assert.match(appSource, /groupProgramLines/);
  assert.match(appSource, /program-line__tokens/);
  assert.match(appSource, /dataset\.lineAction/);
});
