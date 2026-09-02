export const COMMANDS = [
  { type: "subjectRobot", label: "ロボットが", category: "subject", group: "対象" },
  { type: "valueForwardOne", label: "前に1マス", category: "value", group: "方向・値・もの" },
  { type: "valueLeft", label: "左を", category: "value", group: "方向・値・もの" },
  { type: "valueRight", label: "右を", category: "value", group: "方向・値・もの" },
  { type: "valueHello", label: "「こんにちは！」と", category: "value", group: "方向・値・もの" },
  { type: "valueGamingPc", label: "最新ゲーミングPCを", category: "value", group: "方向・値・もの" },
  { type: "valueNonaka", label: "「野中」を", category: "value", group: "方向・値・もの" },
  { type: "valueYoroshiku", label: "「です、ヨロシク」を", category: "value", group: "方向・値・もの" },
  { type: "actionMove", label: "進む", category: "action", group: "実行すること" },
  { type: "actionTurn", label: "向く", category: "action", group: "実行すること" },
  { type: "actionSpeak", label: "発言する", category: "action", group: "実行すること" },
  { type: "actionPick", label: "拾う", category: "action", group: "実行すること" },
  { type: "actionPut", label: "入れる", category: "action", group: "実行すること" },
  {
    type: "actionConcatSpeak",
    label: "つなげて発言する",
    category: "action",
    group: "実行すること",
  },
  {
    type: "variableNameTarget",
    label: "「名前」という箱に",
    category: "variable",
    group: "変数",
  },
  {
    type: "variableNameValue",
    label: "「名前」という箱の中身と",
    category: "variable",
    group: "変数",
  },
  { type: "loopNext", label: "次の命令を", category: "loop", group: "繰り返し" },
  { type: "loopThree", label: "3回", category: "loop", group: "繰り返し" },
  {
    type: "loopUntilGoal",
    label: "ゴールに到着するまで",
    category: "loop",
    group: "繰り返し",
  },
  { type: "loopRepeat", label: "繰り返す", category: "loop", group: "繰り返し" },
  { type: "conditionIf", label: "もし", category: "condition", group: "条件分岐" },
  {
    type: "conditionFrontCell",
    label: "ロボットの前のマスに",
    category: "condition",
    group: "条件分岐",
  },
  {
    type: "conditionWallExists",
    label: "壁がある",
    category: "condition",
    group: "条件分岐",
  },
  { type: "conditionThen", label: "なら", category: "condition", group: "条件分岐" },
  {
    type: "conditionElse",
    label: "そうでなければ",
    category: "condition",
    group: "条件分岐",
  },
];

export const COMMAND_BY_TYPE = Object.fromEntries(
  COMMANDS.map((command) => [command.type, command]),
);

export const MISSIONS = [
  {
    id: 1,
    title: "スタートからゴールまでロボットを動かそう",
    summary: "まずは命令を順番に並べてみよう。",
    goal: "GOALマスにたどり着く",
    point: "命令の順番をよく見よう",
    size: 4,
  },
  {
    id: 2,
    title: "途中で「こんにちは！」と言ってからゴールしよう",
    summary: "発言するタイミングもプログラムに入れよう。",
    goal: "指定されたマスで「こんにちは！」と発言してからGOALする",
    point: "発言するタイミングに注意しよう",
    size: 4,
    event: { row: 2, col: 0, label: "ここで\nこんにちは！", kind: "speech" },
  },
  {
    id: 3,
    title: "最新ゲーミングPCを拾ってからゴールしよう",
    summary: "PCのあるマスまで移動し、拾ってから進もう。",
    goal: "最新ゲーミングPCを拾い、GOALマスにたどり着く",
    point: "PCのマスで「拾う」を忘れずに",
    size: 4,
    event: { row: 1, col: 2, label: "最新\nゲーミングPC", kind: "item" },
  },
  {
    id: 4,
    title: "名前の箱を使って自己紹介してからゴールしよう",
    summary: "箱に入れた名前を使って自己紹介しよう。",
    goal: "名前の箱の中身を使い、指定されたマスで自己紹介してからGOALする",
    point: "箱に名前を入れてから、中身を使って発言しよう",
    size: 4,
    event: { row: 3, col: 1, label: "ここで\n自己紹介", kind: "variable" },
  },
  {
    id: 5,
    title: "繰り返しを使ってゴールしよう",
    summary: "同じ命令をひとまとまりにしよう。",
    goal: "「繰り返し」を使ってGOALする",
    point: "繰り返す命令を右にずらして、インデントしよう",
    size: 4,
  },
  {
    id: 6,
    title: "壁があってもなくてもゴールしよう",
    summary: "A地点・B地点のどちらに壁があっても動くプログラムを作ろう。",
    goal: "A地点・B地点のどちらに壁が置かれても、同じプログラムでGOALする",
    point: "条件ごとの命令を右にずらして、インデントしよう",
    size: 4,
  },
  {
    id: 7,
    title: "同じプログラムで3つのフィールドをクリアしよう",
    summary: "マスの数が変わっても同じ命令で動くようにしよう。",
    goal: "3×3・4×4・5×5のすべてを、同じプログラムでGOALする",
    point: "繰り返しと条件分岐を、インデントで組み合わせよう",
    size: 3,
  },
];

const STATEMENT_PATTERNS = [
  {
    kind: "simple",
    action: "sayIntro",
    sequence: ["subjectRobot", "variableNameValue", "valueYoroshiku", "actionConcatSpeak"],
  },
  {
    kind: "ifWall",
    sequence: ["conditionIf", "conditionFrontCell", "conditionWallExists", "conditionThen"],
  },
  {
    kind: "simple",
    action: "move",
    sequence: ["subjectRobot", "valueForwardOne", "actionMove"],
  },
  {
    kind: "simple",
    action: "turnLeft",
    sequence: ["subjectRobot", "valueLeft", "actionTurn"],
  },
  {
    kind: "simple",
    action: "turnRight",
    sequence: ["subjectRobot", "valueRight", "actionTurn"],
  },
  {
    kind: "simple",
    action: "sayHello",
    sequence: ["subjectRobot", "valueHello", "actionSpeak"],
  },
  {
    kind: "simple",
    action: "pickPc",
    sequence: ["subjectRobot", "valueGamingPc", "actionPick"],
  },
  {
    kind: "simple",
    action: "setName",
    sequence: ["variableNameTarget", "valueNonaka", "actionPut"],
  },
  {
    kind: "repeat3",
    sequence: ["loopNext", "loopThree", "loopRepeat"],
  },
  {
    kind: "repeatUntilGoal",
    sequence: ["loopNext", "loopUntilGoal", "loopRepeat"],
  },
  {
    kind: "repeatUntilGoal",
    sequence: ["loopUntilGoal", "loopNext", "loopRepeat"],
  },
  {
    kind: "else",
    sequence: ["conditionElse"],
  },
];

const DIRECTIONS = [
  { row: -1, col: 0, label: "上" },
  { row: 0, col: 1, label: "右" },
  { row: 1, col: 0, label: "下" },
  { row: 0, col: -1, label: "左" },
];

function compileError(message, sourceIndex) {
  return { ok: false, error: message, sourceIndex };
}

function normalizeProgram(program) {
  return program.map((entry, index) => ({
    type: typeof entry === "string" ? entry : entry.type,
    indent:
      typeof entry === "string"
        ? 0
        : Number.isInteger(entry.indent)
          ? Math.max(0, entry.indent)
          : 0,
    sourceIndex: index,
  }));
}

function matchingPattern(entries, cursor) {
  const firstType = entries[cursor]?.type;
  const candidates = STATEMENT_PATTERNS.filter(
    (pattern) => pattern.sequence[0] === firstType,
  );

  for (const pattern of candidates) {
    const slice = entries.slice(cursor, cursor + pattern.sequence.length);
    if (slice.length !== pattern.sequence.length) continue;
    if (!pattern.sequence.every((type, index) => slice[index].type === type)) continue;

    const indent = slice[0].indent;
    if (!slice.every((entry) => entry.indent === indent)) {
      return compileError(
        "1つの命令を作るカードは、同じインデントにそろえよう。",
        slice.find((entry) => entry.indent !== indent)?.sourceIndex ?? cursor,
      );
    }

    return { ok: true, pattern, slice, indent };
  }

  return null;
}

const STATEMENT_START_TYPES = new Set(
  STATEMENT_PATTERNS.map((pattern) => pattern.sequence[0]),
);

/**
 * 表示用に、細分化されたカードを「1つの命令行」へまとめる。
 *
 * 実行時の構文解析とは分けておくことで、まだ作成途中の
 * 「ロボットが｜前に1マス」のような並びも1行で表示できる。
 */
export function groupProgramLines(program) {
  const entries = normalizeProgram(program);
  const lines = [];
  let cursor = 0;

  while (cursor < entries.length) {
    const entry = entries[cursor];
    const candidates = STATEMENT_PATTERNS.filter(
      (pattern) => pattern.sequence[0] === entry.type,
    );

    const completePattern = candidates.find((pattern) => {
      const slice = entries.slice(cursor, cursor + pattern.sequence.length);
      return (
        slice.length === pattern.sequence.length &&
        pattern.sequence.every((type, index) => slice[index].type === type) &&
        slice.every((token) => token.indent === entry.indent)
      );
    });

    if (completePattern) {
      const endIndex = cursor + completePattern.sequence.length - 1;
      lines.push({
        startIndex: cursor,
        endIndex,
        indent: entry.indent,
        complete: true,
        kind: completePattern.kind,
        action: completePattern.action ?? null,
        entries: entries.slice(cursor, endIndex + 1),
      });
      cursor = endIndex + 1;
      continue;
    }

    let endIndex = cursor;
    let prefix = [entry.type];

    if (candidates.length > 0) {
      while (endIndex + 1 < entries.length) {
        const next = entries[endIndex + 1];
        if (next.indent !== entry.indent) break;

        const nextPrefix = [...prefix, next.type];
        const remainsPossible = candidates.some((pattern) =>
          nextPrefix.every((type, index) => pattern.sequence[index] === type),
        );
        if (!remainsPossible) break;

        prefix = nextPrefix;
        endIndex += 1;
      }
    } else if (
      entries[cursor + 1] &&
      entries[cursor + 1].indent === entry.indent &&
      !STATEMENT_START_TYPES.has(entries[cursor + 1].type)
    ) {
      // 誤った順番でも、開始カードが来るまでは短い作成中の行としてまとめる。
      endIndex += 1;
    }

    lines.push({
      startIndex: cursor,
      endIndex,
      indent: entry.indent,
      complete: false,
      kind: null,
      action: null,
      entries: entries.slice(cursor, endIndex + 1),
    });
    cursor = endIndex + 1;
  }

  return lines;
}

export function tokenizeProgram(program) {
  const entries = normalizeProgram(program);
  const statements = [];
  let cursor = 0;

  while (cursor < entries.length) {
    const entry = entries[cursor];
    if (!COMMAND_BY_TYPE[entry.type]) {
      return compileError("読み取れない命令カードがあります。", cursor);
    }

    const match = matchingPattern(entries, cursor);
    if (match?.ok === false) return match;

    if (!match) {
      const label = COMMAND_BY_TYPE[entry.type].label;
      return compileError(
        `「${label}」から始まる命令が完成していません。カードの順番を確認しよう。`,
        cursor,
      );
    }

    statements.push({
      kind: match.pattern.kind,
      action: match.pattern.action ?? null,
      indent: match.indent,
      sourceIndex: cursor,
      endIndex: cursor + match.pattern.sequence.length - 1,
    });
    cursor += match.pattern.sequence.length;
  }

  return { ok: true, statements };
}

export function compileProgram(program) {
  const tokenized = tokenizeProgram(program);
  if (!tokenized.ok) return tokenized;
  const { statements } = tokenized;

  if (statements.length === 0) {
    return { ok: true, nodes: [], usedKinds: new Set() };
  }

  if (statements[0].indent !== 0) {
    return compileError("最初の命令はインデントせず、左端に置こう。", statements[0].sourceIndex);
  }

  let cursor = 0;

  function parseBlock(expectedIndent) {
    const nodes = [];

    while (cursor < statements.length) {
      const statement = statements[cursor];
      if (statement.indent < expectedIndent) break;
      if (statement.indent > expectedIndent) {
        throw compileError(
          "インデントが深すぎます。右にずらすのは1段ずつにしよう。",
          statement.sourceIndex,
        );
      }

      if (statement.kind === "simple") {
        nodes.push({
          kind: "simple",
          action: statement.action,
          sourceIndex: statement.sourceIndex,
        });
        cursor += 1;
        continue;
      }

      if (statement.kind === "else") {
        throw compileError(
          "「そうでなければ」の前に、同じインデントの「もし」が必要です。",
          statement.sourceIndex,
        );
      }

      if (statement.kind === "repeat3" || statement.kind === "repeatUntilGoal") {
        cursor += 1;
        const next = statements[cursor];
        if (!next || next.indent <= expectedIndent) {
          throw compileError(
            "繰り返す命令を、1段右へインデントして置こう。",
            statement.sourceIndex,
          );
        }
        if (next.indent !== expectedIndent + 1) {
          throw compileError(
            "繰り返す命令のインデントは1段にしよう。",
            next.sourceIndex,
          );
        }
        const body = parseBlock(expectedIndent + 1);
        nodes.push({
          kind: "repeat",
          mode: statement.kind === "repeat3" ? "count" : "untilGoal",
          count: statement.kind === "repeat3" ? 3 : null,
          body,
          sourceIndex: statement.sourceIndex,
        });
        continue;
      }

      if (statement.kind === "ifWall") {
        cursor += 1;
        const next = statements[cursor];
        if (!next || next.indent <= expectedIndent) {
          throw compileError(
            "「壁があるなら」行う命令を、1段右へインデントして置こう。",
            statement.sourceIndex,
          );
        }
        if (next.indent !== expectedIndent + 1) {
          throw compileError(
            "条件の中で行う命令のインデントは1段にしよう。",
            next.sourceIndex,
          );
        }

        const thenBody = parseBlock(expectedIndent + 1);
        let elseBody = [];
        let elseIndex = null;

        if (
          cursor < statements.length &&
          statements[cursor].kind === "else" &&
          statements[cursor].indent === expectedIndent
        ) {
          elseIndex = statements[cursor].sourceIndex;
          cursor += 1;
          const elseNext = statements[cursor];
          if (!elseNext || elseNext.indent <= expectedIndent) {
            throw compileError(
              "「そうでなければ」行う命令を、1段右へインデントして置こう。",
              elseIndex,
            );
          }
          if (elseNext.indent !== expectedIndent + 1) {
            throw compileError(
              "「そうでなければ」の命令も1段インデントしよう。",
              elseNext.sourceIndex,
            );
          }
          elseBody = parseBlock(expectedIndent + 1);
        }

        nodes.push({
          kind: "ifWall",
          thenBody,
          elseBody,
          sourceIndex: statement.sourceIndex,
          elseIndex,
        });
      }
    }

    return nodes;
  }

  try {
    const nodes = parseBlock(0);
    if (cursor !== statements.length) {
      return compileError("インデントをもう一度確認しよう。", statements[cursor]?.sourceIndex ?? 0);
    }
    const usedKinds = new Set(
      statements.map((statement) => statement.action ?? statement.kind),
    );
    return { ok: true, nodes, usedKinds, statements };
  } catch (error) {
    if (error?.ok === false) return error;
    return compileError("プログラムを読み取れませんでした。", 0);
  }
}

export function getMission(id) {
  return MISSIONS.find((mission) => mission.id === Number(id)) ?? MISSIONS[0];
}

export function getMissionScenarios(id) {
  const mission = getMission(id);

  if (mission.id === 6) {
    return [
      {
        key: "wall-a",
        label: "1回目：A地点に壁",
        size: 4,
        walls: [{ row: 1, col: 0 }],
        wallAt: "A",
      },
      {
        key: "wall-b",
        label: "2回目：B地点に壁",
        size: 4,
        walls: [{ row: 0, col: 1 }],
        wallAt: "B",
      },
    ];
  }

  if (mission.id === 7) {
    return [3, 4, 5].map((size) => ({
      key: `size-${size}`,
      label: `${size}×${size}フィールド`,
      size,
      walls: [],
    }));
  }

  return [
    {
      key: `mission-${mission.id}`,
      label: `${mission.size}×${mission.size}`,
      size: mission.size,
      walls: [],
    },
  ];
}

function snapshot(robotState) {
  return {
    row: robotState.row,
    col: robotState.col,
    dir: robotState.dir,
    hasPc: robotState.hasPc,
    variables: { ...robotState.variables },
    lastSpeech: robotState.lastSpeech,
  };
}

function cellKey(row, col) {
  return `${row},${col}`;
}

function isGoal(robotState, scenario) {
  return robotState.row === scenario.size - 1 && robotState.col === scenario.size - 1;
}

function isWallAhead(robotState, scenario) {
  const direction = DIRECTIONS[robotState.dir];
  const nextRow = robotState.row + direction.row;
  const nextCol = robotState.col + direction.col;

  if (
    nextRow < 0 ||
    nextCol < 0 ||
    nextRow >= scenario.size ||
    nextCol >= scenario.size
  ) {
    return true;
  }

  const walls = new Set(scenario.walls.map((wall) => cellKey(wall.row, wall.col)));
  return walls.has(cellKey(nextRow, nextCol));
}

function stateSignature(robotState) {
  return `${robotState.row}:${robotState.col}:${robotState.dir}:${robotState.hasPc}:${robotState.variables.name ?? ""}`;
}

export function directionLabel(dir) {
  return DIRECTIONS[dir]?.label ?? "下";
}

export function runScenario(compiled, missionId, scenario) {
  const mission = getMission(missionId);
  const robotState = {
    row: 0,
    col: 0,
    dir: 2,
    hasPc: false,
    variables: {},
    lastSpeech: "",
    events: [],
  };
  const trace = [];
  let error = null;
  let steps = 0;

  function record(sourceIndex, message, kind = "action") {
    trace.push({
      sourceIndex,
      message,
      kind,
      state: snapshot(robotState),
    });
  }

  function fail(message, sourceIndex) {
    error = message;
    record(sourceIndex, message, "error");
  }

  function executeSimple(node) {
    if (error) return;
    steps += 1;
    if (steps > 240) {
      fail("命令が多すぎるようです。繰り返し方を見直そう。", node.sourceIndex);
      return;
    }

    if (node.action === "move") {
      if (isWallAhead(robotState, scenario)) {
        fail("ロボットが壁にぶつかりました。", node.sourceIndex);
        return;
      }
      const direction = DIRECTIONS[robotState.dir];
      robotState.row += direction.row;
      robotState.col += direction.col;
      record(node.sourceIndex, "前に1マス進みました");
      return;
    }

    if (node.action === "turnLeft") {
      robotState.dir = (robotState.dir + 3) % 4;
      record(node.sourceIndex, "左を向きました");
      return;
    }

    if (node.action === "turnRight") {
      robotState.dir = (robotState.dir + 1) % 4;
      record(node.sourceIndex, "右を向きました");
      return;
    }

    if (node.action === "sayHello") {
      robotState.lastSpeech = "こんにちは！";
      robotState.events.push({ type: "sayHello", row: robotState.row, col: robotState.col });
      record(node.sourceIndex, "「こんにちは！」と発言しました");
      return;
    }

    if (node.action === "pickPc") {
      const item = mission.event;
      if (
        !item ||
        item.kind !== "item" ||
        robotState.row !== item.row ||
        robotState.col !== item.col
      ) {
        fail("このマスには最新ゲーミングPCがありません。", node.sourceIndex);
        return;
      }
      robotState.hasPc = true;
      robotState.events.push({ type: "pickPc", row: robotState.row, col: robotState.col });
      record(node.sourceIndex, "最新ゲーミングPCを拾いました");
      return;
    }

    if (node.action === "setName") {
      robotState.variables.name = "野中";
      robotState.events.push({ type: "setName", row: robotState.row, col: robotState.col });
      record(node.sourceIndex, "「名前」という箱に「野中」を入れました");
      return;
    }

    if (node.action === "sayIntro") {
      if (!robotState.variables.name) {
        fail("先に「名前」という箱へ名前を入れよう。", node.sourceIndex);
        return;
      }
      robotState.lastSpeech = `${robotState.variables.name}です、ヨロシク`;
      robotState.events.push({
        type: "sayIntro",
        row: robotState.row,
        col: robotState.col,
        text: robotState.lastSpeech,
      });
      record(node.sourceIndex, `「${robotState.lastSpeech}」と発言しました`);
    }
  }

  function executeNodes(nodes) {
    for (const node of nodes) {
      if (error) return;

      if (node.kind === "simple") {
        executeSimple(node);
        continue;
      }

      if (node.kind === "ifWall") {
        steps += 1;
        if (steps > 240) {
          fail("命令が多すぎるようです。条件分岐を見直そう。", node.sourceIndex);
          return;
        }
        const wallAhead = isWallAhead(robotState, scenario);
        record(
          node.sourceIndex,
          wallAhead ? "目の前に壁がある →「なら」へ" : "目の前に壁がない →「そうでなければ」へ",
          "condition",
        );
        executeNodes(wallAhead ? node.thenBody : node.elseBody);
        continue;
      }

      if (node.kind === "repeat" && node.mode === "count") {
        for (let count = 0; count < node.count; count += 1) {
          if (error) return;
          executeNodes(node.body);
        }
        continue;
      }

      if (node.kind === "repeat" && node.mode === "untilGoal") {
        let loops = 0;
        while (!isGoal(robotState, scenario) && !error) {
          const before = stateSignature(robotState);
          executeNodes(node.body);
          loops += 1;

          if (!error && stateSignature(robotState) === before) {
            fail("同じ場所から動けていません。繰り返す命令を見直そう。", node.sourceIndex);
            return;
          }

          if (loops > 80) {
            fail("ゴールに着かないまま繰り返しています。", node.sourceIndex);
            return;
          }
        }
      }
    }
  }

  executeNodes(compiled.nodes);

  const checks = [];
  if (!error && !isGoal(robotState, scenario)) {
    checks.push("最後にGOALマスへたどり着こう。");
  }

  if (!error && mission.id === 2) {
    const event = mission.event;
    const spokeAtTarget = robotState.events.some(
      (entry) => entry.type === "sayHello" && entry.row === event.row && entry.col === event.col,
    );
    if (!spokeAtTarget) checks.push("指定されたマスで「こんにちは！」と発言しよう。");
  }

  if (!error && mission.id === 3 && !robotState.hasPc) {
    checks.push("最新ゲーミングPCを拾ってからゴールしよう。");
  }

  if (!error && mission.id === 4) {
    const event = mission.event;
    const introducedAtTarget = robotState.events.some(
      (entry) =>
        entry.type === "sayIntro" &&
        entry.row === event.row &&
        entry.col === event.col &&
        entry.text === "野中です、ヨロシク",
    );
    if (!introducedAtTarget) {
      checks.push("指定されたマスで、名前の箱を使って自己紹介しよう。");
    }
  }

  if (
    !error &&
    mission.id === 5 &&
    !compiled.usedKinds.has("repeat3") &&
    !compiled.usedKinds.has("repeatUntilGoal")
  ) {
    checks.push("繰り返しカードを使ってみよう。");
  }

  if (!error && mission.id === 6 && !compiled.usedKinds.has("ifWall")) {
    checks.push("「もし」カードを使って、壁がある場合とない場合を分けよう。");
  }

  if (!error && mission.id === 7) {
    if (!compiled.usedKinds.has("ifWall")) {
      checks.push("条件分岐を使って、目の前の壁を調べよう。");
    }
    if (!compiled.usedKinds.has("repeatUntilGoal")) {
      checks.push("「ゴールに到着するまで」の繰り返しを使おう。");
    }
  }

  const success = !error && checks.length === 0;
  return {
    success,
    error,
    checks,
    trace,
    state: snapshot(robotState),
    scenario,
  };
}

export function runMission(program, missionId) {
  if (program.length === 0) {
    return {
      success: false,
      compileError: "命令カードを1枚以上並べよう。",
      sourceIndex: null,
      results: [],
    };
  }

  const compiled = compileProgram(program);
  if (!compiled.ok) {
    return {
      success: false,
      compileError: compiled.error,
      sourceIndex: compiled.sourceIndex,
      results: [],
    };
  }

  const scenarios = getMissionScenarios(missionId);
  const results = scenarios.map((scenario) =>
    runScenario(compiled, Number(missionId), scenario),
  );

  return {
    success: results.every((result) => result.success),
    compileError: null,
    sourceIndex: null,
    results,
  };
}

function line(indent, ...types) {
  return types.map((type) => ({ type, indent }));
}

const move = (indent = 0) => line(indent, "subjectRobot", "valueForwardOne", "actionMove");
const left = (indent = 0) => line(indent, "subjectRobot", "valueLeft", "actionTurn");
const right = (indent = 0) => line(indent, "subjectRobot", "valueRight", "actionTurn");

export const SAMPLE_SOLUTIONS = {
  1: [...move(), ...move(), ...move(), ...left(), ...move(), ...move(), ...move()],
  2: [
    ...move(),
    ...move(),
    ...line(0, "subjectRobot", "valueHello", "actionSpeak"),
    ...move(),
    ...left(),
    ...move(),
    ...move(),
    ...move(),
  ],
  3: [
    ...move(),
    ...left(),
    ...move(),
    ...move(),
    ...line(0, "subjectRobot", "valueGamingPc", "actionPick"),
    ...move(),
    ...right(),
    ...move(),
    ...move(),
  ],
  4: [
    ...move(),
    ...move(),
    ...move(),
    ...left(),
    ...move(),
    ...line(0, "variableNameTarget", "valueNonaka", "actionPut"),
    ...line(0, "subjectRobot", "variableNameValue", "valueYoroshiku", "actionConcatSpeak"),
    ...move(),
    ...move(),
  ],
  5: [
    ...line(0, "loopNext", "loopThree", "loopRepeat"),
    ...move(1),
    ...left(),
    ...line(0, "loopNext", "loopThree", "loopRepeat"),
    ...move(1),
  ],
  6: [
    ...line(0, "conditionIf", "conditionFrontCell", "conditionWallExists", "conditionThen"),
    ...left(1),
    ...move(1),
    ...move(1),
    ...move(1),
    ...right(1),
    ...line(0, "conditionElse"),
    ...move(1),
    ...move(1),
    ...move(1),
    ...left(1),
    ...move(),
    ...move(),
    ...move(),
  ],
  7: [
    ...line(0, "loopNext", "loopUntilGoal", "loopRepeat"),
    ...line(1, "conditionIf", "conditionFrontCell", "conditionWallExists", "conditionThen"),
    ...left(2),
    ...line(1, "conditionElse"),
    ...move(2),
  ],
};
