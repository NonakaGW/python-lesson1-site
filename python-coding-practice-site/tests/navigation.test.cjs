"use strict";
const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { questionIndexFromHash, questionNavigation } = require("../app.js");

const root = path.resolve(__dirname, "..");
const source = fs.readFileSync(path.join(root, "app.js"), "utf8");
const html = fs.readFileSync(path.join(root, "index.html"), "utf8");

class Element {
  constructor(text = "", attributes = {}) {
    this.textContent = text;
    this.hidden = false;
    this.attributes = { ...attributes };
    this.listeners = {};
    this.focusCalls = 0;
    this.scrollCalls = [];
  }
  setAttribute(key, value) { this.attributes[key] = value; }
  getAttribute(key) { return this.attributes[key] ?? null; }
  removeAttribute(key) { delete this.attributes[key]; }
  addEventListener(name, listener) { this.listeners[name] = listener; }
  focus() { this.focusCalls += 1; }
  scrollIntoView(options) { this.scrollCalls.push(options); }
  querySelector(selector) { return selector === "h2" ? this.heading : null; }
  click(overrides = {}) {
    let prevented = false;
    const event = { button: 0, metaKey: false, ctrlKey: false, shiftKey: false, altKey: false, preventDefault() { prevented = true; }, ...overrides };
    this.listeners.click?.(event);
    return prevented;
  }
}

function interfaceFixture(hash = "", missing = false) {
  const questions = Array.from({ length: 8 }, (_, index) => {
    const element = new Element();
    element.heading = new Element(`問題${index + 1}`);
    return element;
  });
  const links = questions.map((_, index) => new Element("", { href: `#q${index + 1}` }));
  const previous = new Element("", { href: "#q1" });
  const next = new Element("", { href: "#q2" });
  const guide = new Element("", { href: "#q5" });
  const controls = new Element();
  controls.hidden = true;
  const elements = { main: new Element(), "question-controls": controls, "previous-question": previous, "next-question": next, "question-position": new Element(), "question-status": new Element() };
  let currentHash = hash;
  const listeners = {};
  const window = {
    location: {
      get hash() { return currentHash; },
      set hash(value) { currentHash = value; listeners.hashchange?.(); },
    },
    addEventListener(name, listener) { listeners[name] = listener; },
    matchMedia() { return { matches: true }; },
    requestAnimationFrame(listener) { listener(); },
  };
  const document = {
    querySelectorAll(selector) {
      if (selector === "article.question") return questions;
      if (selector === ".question-nav a") return links;
      if (selector === 'a[href^="#q"]') return [...links, previous, next, guide];
      return [];
    },
    getElementById(id) { return missing && id === "main" ? null : elements[id] ?? null; },
  };
  vm.runInNewContext(source, { document, window });
  return { questions, links, previous, next, guide, controls, elements, window };
}

test("all eight direct links resolve to the correct question", () => {
  for (let index = 0; index < 8; index += 1) assert.equal(questionIndexFromHash(`#q${index + 1}`), index);
  for (const hash of ["", "#q0", "#q9", "#q01", "#q1x", "#main", "#q1/", null]) assert.equal(questionIndexFromHash(hash), null);
});

test("first, middle and last questions have correct navigation", () => {
  assert.deepEqual(questionNavigation(0, 8), { previous: null, next: "#q2", position: "問1 / 8" });
  assert.deepEqual(questionNavigation(4, 8), { previous: "#q4", next: "#q6", position: "問5 / 8" });
  assert.deepEqual(questionNavigation(7, 8), { previous: "#q7", next: null, position: "問8 / 8" });
  for (const index of [-1, 8, .5, NaN]) assert.throws(() => questionNavigation(index, 8), RangeError);
});

test("initial page shows one question without moving keyboard focus", () => {
  const ui = interfaceFixture();
  assert.deepEqual(ui.questions.map(q => q.hidden), [false, true, true, true, true, true, true, true]);
  assert.equal(ui.links[0].getAttribute("aria-current"), "page");
  assert.equal(ui.controls.hidden, false);
  assert.equal(ui.previous.hidden, true);
  assert.equal(ui.next.hidden, false);
  assert.equal(ui.next.getAttribute("href"), "#q2");
  assert.equal(ui.questions[0].heading.focusCalls, 0);
});

test("every navigation item, direct link and next/previous control works", () => {
  const ui = interfaceFixture("#q7");
  assert.equal(ui.questions[6].hidden, false);
  assert.equal(ui.previous.getAttribute("href"), "#q6");
  assert.equal(ui.next.getAttribute("href"), "#q8");
  assert.equal(ui.next.click(), true);
  assert.equal(ui.window.location.hash, "#q8");
  assert.equal(ui.next.hidden, true);
  assert.equal(ui.previous.getAttribute("href"), "#q7");
  assert.equal(ui.previous.click(), true);
  assert.equal(ui.window.location.hash, "#q7");
  for (let index = 0; index < 8; index += 1) {
    assert.equal(ui.links[index].click(), true);
    assert.equal(ui.questions[index].hidden, false);
    assert.equal(ui.questions.filter(q => !q.hidden).length, 1);
    assert.equal(ui.links.filter(link => link.getAttribute("aria-current") === "page").length, 1);
    assert.equal(ui.elements["question-position"].textContent, `問${index + 1} / 8`);
  }
});

test("guide links, browser history, skip links and modified clicks are respected", () => {
  const ui = interfaceFixture("#q8");
  ui.guide.click();
  assert.equal(ui.window.location.hash, "#q5");
  assert.equal(ui.questions[4].hidden, false);
  assert.ok(ui.questions[4].heading.focusCalls > 0);
  ui.window.location.hash = "#q7";
  assert.equal(ui.questions[6].hidden, false);
  ui.window.location.hash = "#main";
  assert.equal(ui.questions[6].hidden, false);
  assert.equal(ui.links[2].click({ ctrlKey: true }), false);
  assert.equal(ui.window.location.hash, "#main");
  ui.window.location.hash = "";
  assert.equal(ui.questions[0].hidden, false);
  assert.equal(ui.previous.hidden, true);
});

test("a partially initialized interface leaves all HTML content visible", () => {
  const ui = interfaceFixture("", true);
  assert.equal(ui.questions.every(question => !question.hidden), true);
  assert.equal(ui.controls.hidden, true);
});

test("exactly eight questions and output examples match the approved wording", () => {
  const articles = Array.from(html.matchAll(/<article id="q([1-8])"[\s\S]*?<\/article>/g));
  assert.equal(articles.length, 8);
  const expected = [
    "こんにちは、Python！",
    "冒険を始めます\n宝箱を見つけました\nゲームを終了します",
    "マインクラフト",
    "準備OK！\n準備OK！\n準備OK！",
    "装備は剣です\n装備は弓です",
    "マインクラフト\nまた遊びたいです",
    "名前はノナカです\n装備は弓です\nレベルは5です",
    "冒険を始めます\n名前はノナカです\nレベルは5です\n装備は剣です\n装備を変更しました\n装備は弓です",
  ];
  articles.forEach((article, index) => {
    const output = /<pre class="output"><code>([\s\S]*?)<\/code><\/pre>/.exec(article[0]);
    assert.equal(output?.[1], expected[index]);
    assert.ok(article[0].includes("完成したら"));
  });
  const broken = /<pre class="source-code"><code>([\s\S]*?)<\/code><\/pre>/.exec(articles[5][0]);
  assert.equal(broken[1].replace(/<[^>]*>/g, ""), 'game = "マインクラフト"\nprint("game")\nprint("また遊びたいです"');
  assert.match(articles[4][0], /id="f-string-guide"[^>]* open/);
});

test("IDs, local assets and question fragment links are intact", () => {
  const ids = Array.from(html.matchAll(/\bid="([^"]+)"/g), match => match[1]);
  assert.equal(ids.length, new Set(ids).size);
  for (const match of html.matchAll(/href="#([^"]+)"/g)) assert.ok(ids.includes(match[1]), `Missing anchor ${match[1]}`);
  for (const match of html.matchAll(/(?:src|href)="\.\/([^"]+)"/g)) assert.ok(fs.existsSync(path.join(root, match[1])), `Missing asset ${match[1]}`);
  for (const match of html.matchAll(/target="_blank"[^>]*>/g)) assert.match(match[0], /rel="noopener noreferrer"/);
});

test("student-facing page has no assessment, execution or tracking interface", () => {
  assert.doesNotMatch(html, /テスト|採点|配点|正解|不正解|点数|<iframe|<textarea|<input|<form/);
  assert.doesNotMatch(source, /fetch\(|XMLHttpRequest|localStorage|sessionStorage|document\.cookie/);
  assert.doesNotMatch(html, /<script[^>]+src="https?:/);
  assert.match(html, /https:\/\/tech-nexus\.jp/);
  assert.match(html, /AIレビュー/);
  assert.match(html, /AIサポーター/);
});
