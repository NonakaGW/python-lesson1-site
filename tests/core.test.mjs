import test from "node:test";
import assert from "node:assert/strict";

import {
  COMMANDS,
  SAMPLE_SOLUTIONS,
  compileProgram,
  getMissionScenarios,
  groupProgramLines,
  runMission,
} from "../game-core.mjs";
import { gradeQuiz, normalizeAnswer } from "../quiz-core.mjs";

test("all seven sample solutions clear their missions", () => {
  for (let missionId = 1; missionId <= 7; missionId += 1) {
    const result = runMission(SAMPLE_SOLUTIONS[missionId], missionId);
    assert.equal(result.success, true, `mission ${missionId} should succeed`);
  }
});

test("mission 6 tests both A and B wall positions", () => {
  const scenarios = getMissionScenarios(6);
  assert.equal(scenarios.length, 2);
  assert.deepEqual(
    scenarios.map((scenario) => scenario.wallAt),
    ["A", "B"],
  );

  const result = runMission(SAMPLE_SOLUTIONS[6], 6);
  assert.equal(result.results.length, 2);
  assert.equal(result.results.every((scenarioResult) => scenarioResult.success), true);
});

test("mission 7 tests 3x3, 4x4 and 5x5 with the same program", () => {
  const result = runMission(SAMPLE_SOLUTIONS[7], 7);
  assert.deepEqual(
    result.results.map((scenarioResult) => scenarioResult.scenario.size),
    [3, 4, 5],
  );
  assert.equal(result.success, true);
});

test("mission 5 does not clear without a repeat card", () => {
  const result = runMission(SAMPLE_SOLUTIONS[1], 5);
  assert.equal(result.success, false);
  assert.match(result.results[0].checks[0], /繰り返し/);
});

test("mission 6 does not clear with a one-route-only program", () => {
  const result = runMission(SAMPLE_SOLUTIONS[1], 6);
  assert.equal(result.success, false);
});

test("repeat blocks end by outdenting and need no end card", () => {
  assert.equal(COMMANDS.some((command) => command.label.includes("ここまで")), false);
  const compiled = compileProgram(SAMPLE_SOLUTIONS[5]);
  assert.equal(compiled.ok, true);
});

test("a repeat body must be indented", () => {
  const compiled = compileProgram([
    { type: "loopNext", indent: 0 },
    { type: "loopThree", indent: 0 },
    { type: "loopRepeat", indent: 0 },
    { type: "subjectRobot", indent: 0 },
    { type: "valueForwardOne", indent: 0 },
    { type: "actionMove", indent: 0 },
  ]);
  assert.equal(compiled.ok, false);
  assert.match(compiled.error, /インデント/);
});

test("split cards must form a complete command", () => {
  const compiled = compileProgram([
    { type: "subjectRobot", indent: 0 },
    { type: "valueForwardOne", indent: 0 },
  ]);
  assert.equal(compiled.ok, false);
  assert.match(compiled.error, /完成していません/);
});

test("cards that form one command must share an indent", () => {
  const compiled = compileProgram([
    { type: "subjectRobot", indent: 0 },
    { type: "valueForwardOne", indent: 1 },
    { type: "actionMove", indent: 0 },
  ]);
  assert.equal(compiled.ok, false);
  assert.match(compiled.error, /同じインデント/);
});

test("split cards are grouped into one visual command line", () => {
  const lines = groupProgramLines(SAMPLE_SOLUTIONS[1]);
  assert.equal(lines.length, 7);
  assert.equal(lines[0].complete, true);
  assert.deepEqual(
    lines[0].entries.map((entry) => entry.type),
    ["subjectRobot", "valueForwardOne", "actionMove"],
  );
});

test("unfinished split cards stay together on one visual line", () => {
  const lines = groupProgramLines([
    { type: "subjectRobot", indent: 0 },
    { type: "valueForwardOne", indent: 0 },
  ]);
  assert.equal(lines.length, 1);
  assert.equal(lines[0].complete, false);
  assert.equal(lines[0].entries.length, 2);
});

test("quiz normalization ignores width, case and whitespace", () => {
  assert.equal(normalizeAnswer(" Ｐｙ ＴＨＯＮ "), "python");
  assert.equal(normalizeAnswer("　条 件 分 岐　"), "条件分岐");
});

test("quiz grading accepts forgiving formatting", () => {
  const grade = gradeQuiz([
    " プ ロ グ ラ ム ",
    "プログラミング",
    "PYTHON",
    "順 次 処 理",
    "変数",
    "繰り返し",
    "条 件 分 岐",
    "アルゴリズム",
    "デバッグ",
  ]);
  assert.equal(grade.score, 9);
});

test("blank answers are not accepted", () => {
  const grade = gradeQuiz(Array(9).fill("　 "));
  assert.equal(grade.score, 0);
  assert.equal(grade.results.every((result) => result.unanswered), true);
});
