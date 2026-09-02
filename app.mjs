import {
  COMMANDS,
  COMMAND_BY_TYPE,
  MISSIONS,
  directionLabel,
  getMission,
  getMissionScenarios,
  groupProgramLines,
  runMission,
  tokenizeProgram,
} from "./game-core.mjs";
import { QUIZ_QUESTIONS, gradeQuiz } from "./quiz-core.mjs";

const VALID_VIEWS = new Set(["materials", "game", "quiz"]);
const GROUP_ORDER = ["対象", "方向・値・もの", "実行すること", "変数", "繰り返し", "条件分岐"];
const MISSION_COMMAND_TYPES = {
  1: ["subjectRobot", "valueForwardOne", "valueLeft", "valueRight", "actionMove", "actionTurn"],
  2: [
    "subjectRobot",
    "valueForwardOne",
    "valueLeft",
    "valueRight",
    "valueHello",
    "actionMove",
    "actionTurn",
    "actionSpeak",
  ],
  3: [
    "subjectRobot",
    "valueForwardOne",
    "valueLeft",
    "valueRight",
    "valueGamingPc",
    "actionMove",
    "actionTurn",
    "actionPick",
  ],
  4: [
    "subjectRobot",
    "valueForwardOne",
    "valueLeft",
    "valueRight",
    "valueNonaka",
    "valueYoroshiku",
    "actionMove",
    "actionTurn",
    "actionPut",
    "actionConcatSpeak",
    "variableNameTarget",
    "variableNameValue",
  ],
  5: [
    "subjectRobot",
    "valueForwardOne",
    "valueLeft",
    "valueRight",
    "actionMove",
    "actionTurn",
    "loopNext",
    "loopThree",
    "loopRepeat",
  ],
  6: [
    "subjectRobot",
    "valueForwardOne",
    "valueLeft",
    "valueRight",
    "actionMove",
    "actionTurn",
    "conditionIf",
    "conditionFrontCell",
    "conditionWallExists",
    "conditionThen",
    "conditionElse",
  ],
  7: [
    "subjectRobot",
    "valueForwardOne",
    "valueLeft",
    "valueRight",
    "actionMove",
    "actionTurn",
    "loopNext",
    "loopUntilGoal",
    "loopRepeat",
    "conditionIf",
    "conditionFrontCell",
    "conditionWallExists",
    "conditionThen",
    "conditionElse",
  ],
};

const state = {
  currentView: "materials",
  currentMissionId: 1,
  programs: new Map(MISSIONS.map((mission) => [mission.id, []])),
  completedMissions: new Set(),
  running: false,
  runToken: 0,
  clearArmed: false,
  clearTimer: null,
  drag: null,
};

const elements = {
  navButtons: [...document.querySelectorAll("[data-view]")],
  viewPanels: [...document.querySelectorAll("[data-view-panel]")],
  goViewButtons: [...document.querySelectorAll("[data-go-view]")],
  missionTabs: document.querySelector("#mission-tabs"),
  missionNumber: document.querySelector("#mission-number"),
  missionTitle: document.querySelector("#mission-title"),
  missionGoal: document.querySelector("#mission-goal"),
  goalCondition: document.querySelector("#goal-condition"),
  missionPoint: document.querySelector("#mission-point"),
  scenarioBadge: document.querySelector("#scenario-badge"),
  board: document.querySelector("#board"),
  robotStatusText: document.querySelector("#robot-status-text"),
  palette: document.querySelector("#palette"),
  workspace: document.querySelector("#workspace"),
  cardCount: document.querySelector("#card-count"),
  clearProgram: document.querySelector("#clear-program"),
  runProgram: document.querySelector("#run-program"),
  runResult: document.querySelector("#run-result"),
  dragGhost: document.querySelector("#drag-ghost"),
  quizForm: document.querySelector("#quiz-form"),
  quizList: document.querySelector("#quiz-list"),
  quizResult: document.querySelector("#quiz-result"),
  quizScore: document.querySelector("#quiz-score"),
  quizResultTitle: document.querySelector("#quiz-result-title"),
  quizResultMessage: document.querySelector("#quiz-result-message"),
};

function createId() {
  if (globalThis.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function currentProgram() {
  return state.programs.get(state.currentMissionId) ?? [];
}

function replaceCurrentProgram(program) {
  state.programs.set(state.currentMissionId, program);
}

function showView(view, updateHash = true) {
  const nextView = VALID_VIEWS.has(view) ? view : "materials";
  state.currentView = nextView;

  if (nextView !== "game") cancelRun();

  for (const panel of elements.viewPanels) {
    const active = panel.dataset.viewPanel === nextView;
    panel.hidden = !active;
    panel.classList.toggle("is-active", active);
  }

  for (const button of elements.navButtons) {
    const active = button.dataset.view === nextView;
    button.classList.toggle("is-active", active);
    if (active) button.setAttribute("aria-current", "page");
    else button.removeAttribute("aria-current");
  }

  if (updateHash) {
    history.replaceState(null, "", `#${nextView}`);
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

function viewFromHash() {
  const view = location.hash.replace(/^#/, "");
  return VALID_VIEWS.has(view) ? view : "materials";
}

function renderMissionTabs() {
  elements.missionTabs.replaceChildren();

  for (const mission of MISSIONS) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "mission-tab";
    button.textContent = String(mission.id);
    button.dataset.missionId = String(mission.id);
    button.title = `問${mission.id}：${mission.title}`;
    button.setAttribute("aria-label", `問${mission.id} ${mission.title}`);
    button.classList.toggle("is-active", mission.id === state.currentMissionId);
    button.classList.toggle("is-complete", state.completedMissions.has(mission.id));
    if (mission.id === state.currentMissionId) button.setAttribute("aria-current", "step");
    elements.missionTabs.append(button);
  }
}

function previewScenarioForMission(mission) {
  if (mission.id === 6) {
    return {
      key: "mission-6-preview",
      label: "A・B地点を両方テスト",
      size: 4,
      walls: [],
      wallAt: null,
    };
  }

  if (mission.id === 7) {
    return {
      key: "mission-7-preview",
      label: "3×3・4×4・5×5",
      size: 3,
      walls: [],
    };
  }

  return getMissionScenarios(mission.id)[0];
}

function initialRobotState() {
  return {
    row: 0,
    col: 0,
    dir: 2,
    hasPc: false,
    variables: {},
    lastSpeech: "",
  };
}

function renderMission() {
  const mission = getMission(state.currentMissionId);
  elements.missionNumber.textContent = String(mission.id);
  elements.missionTitle.textContent = mission.title;
  elements.missionGoal.textContent = mission.summary;
  elements.goalCondition.textContent = mission.goal;
  elements.missionPoint.textContent = mission.point;

  renderMissionTabs();
  renderPalette();
  renderWorkspace();
  renderBoard(previewScenarioForMission(mission), initialRobotState());
  setRunResult("info", "カードを並べたら、実行して動きを確かめよう。", "💡");
}

function selectMission(missionId) {
  const nextId = Number(missionId);
  if (!getMission(nextId)) return;
  cancelRun();
  resetClearButton();
  state.currentMissionId = nextId;
  renderMission();
  document.querySelector(".mission-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function renderPalette() {
  const allowedTypes = new Set(MISSION_COMMAND_TYPES[state.currentMissionId]);
  const availableCommands = COMMANDS.filter((command) => allowedTypes.has(command.type));
  elements.palette.replaceChildren();

  for (const groupName of GROUP_ORDER) {
    const commands = availableCommands.filter((command) => command.group === groupName);
    if (commands.length === 0) continue;

    const group = document.createElement("section");
    group.className = "palette-group";

    const heading = document.createElement("h4");
    heading.textContent = groupName;
    group.append(heading);

    const cards = document.createElement("div");
    cards.className = "palette-group__cards";

    for (const command of commands) {
      const card = document.createElement("div");
      card.className = `palette-card category-${command.category}`;
      card.dataset.commandType = command.type;

      const addButton = document.createElement("button");
      addButton.type = "button";
      addButton.className = "palette-card__add";
      addButton.textContent = command.label;
      addButton.dataset.addCommand = command.type;
      addButton.setAttribute("aria-label", `${command.label}をプログラムに追加`);

      const handle = document.createElement("button");
      handle.type = "button";
      handle.className = "drag-handle";
      handle.textContent = "⠿";
      handle.title = "つまんでプログラムへ移動";
      handle.setAttribute("aria-label", `${command.label}をドラッグ`);
      handle.addEventListener("pointerdown", (event) => {
        beginDrag(event, {
          source: "palette",
          type: command.type,
          label: command.label,
          category: command.category,
        });
      });

      card.append(addButton, handle);
      cards.append(card);
    }

    group.append(cards);
    elements.palette.append(group);
  }
}

function createWorkspaceEmpty() {
  const empty = document.createElement("div");
  empty.className = "workspace-empty";

  const icon = document.createElement("span");
  icon.textContent = "+";
  icon.setAttribute("aria-hidden", "true");

  const title = document.createElement("strong");
  title.textContent = "ここに命令カードを並べよう";

  const note = document.createElement("small");
  note.textContent = "カードをタップしても追加できます";

  empty.append(icon, title, note);
  return empty;
}

function renderWorkspace() {
  const program = currentProgram();
  const lines = groupProgramLines(program);
  elements.workspace.replaceChildren();
  elements.cardCount.textContent = `${lines.length}行・${program.length}枚`;

  if (program.length === 0) {
    elements.workspace.append(createWorkspaceEmpty());
    return;
  }

  lines.forEach((line, lineIndex) => {
    const row = document.createElement("div");
    row.className = `program-line${line.complete ? "" : " is-incomplete"}`;
    row.dataset.lineIndex = String(lineIndex);
    row.dataset.startIndex = String(line.startIndex);
    row.dataset.endIndex = String(line.endIndex);
    row.style.setProperty("--indent", String(line.indent));
    row.setAttribute(
      "aria-label",
      `${lineIndex + 1}行目${line.complete ? "" : "、作成中"}`,
    );

    const tokens = document.createElement("div");
    tokens.className = "program-line__tokens";

    for (let index = line.startIndex; index <= line.endIndex; index += 1) {
      const item = program[index];
      const command = COMMAND_BY_TYPE[item.type];
      const token = document.createElement("div");
      token.className = `program-token category-${command.category}`;
      token.dataset.index = String(index);
      token.dataset.uid = item.uid;

      const handle = document.createElement("button");
      handle.type = "button";
      handle.className = "program-token__drag";
      handle.title = "つまんで並べ替え";
      handle.setAttribute("aria-label", `${command.label}を並べ替える`);

      const grip = document.createElement("span");
      grip.className = "program-token__grip";
      grip.textContent = "⠿";
      grip.setAttribute("aria-hidden", "true");

      const label = document.createElement("span");
      label.textContent = command.label;
      handle.append(grip, label);
      handle.addEventListener("pointerdown", (event) => {
        beginDrag(event, {
          source: "workspace",
          index,
          type: item.type,
          label: command.label,
          category: command.category,
        });
      });

      const removeToken = document.createElement("button");
      removeToken.type = "button";
      removeToken.className = "program-token__delete";
      removeToken.textContent = "×";
      removeToken.dataset.tokenDelete = String(index);
      removeToken.setAttribute("aria-label", `${command.label}だけを削除`);

      token.append(handle, removeToken);
      tokens.append(token);
    }

    const actions = document.createElement("div");
    actions.className = "program-line__actions";
    actions.setAttribute("aria-label", `${lineIndex + 1}行目の操作`);

    const outdent = createLineActionButton(
      "←",
      "この行のインデントを1段戻す",
      "outdent",
      lineIndex,
      line.indent === 0,
    );
    const indent = createLineActionButton(
      "→",
      "この行のインデントを1段深くする",
      "indent",
      lineIndex,
      line.indent >= 4,
    );
    const up = createLineActionButton("↑", "この行を上へ移動", "up", lineIndex, lineIndex === 0);
    const down = createLineActionButton(
      "↓",
      "この行を下へ移動",
      "down",
      lineIndex,
      lineIndex === lines.length - 1,
    );
    const remove = createLineActionButton(
      "×",
      "この行をすべて削除",
      "delete",
      lineIndex,
      false,
      true,
    );
    actions.append(outdent, indent, up, down, remove);
    row.append(tokens, actions);
    elements.workspace.append(row);
  });
}

function createLineActionButton(text, label, action, lineIndex, disabled, isDelete = false) {
  const button = document.createElement("button");
  button.type = "button";
  button.className = `icon-button${isDelete ? " icon-button--delete" : ""}`;
  button.textContent = text;
  button.dataset.lineAction = action;
  button.dataset.lineIndex = String(lineIndex);
  button.setAttribute("aria-label", label);
  button.disabled = disabled;
  return button;
}

function suggestedIndent(program, type, insertionIndex) {
  const insertAt =
    insertionIndex === null ? program.length : Math.max(0, Math.min(insertionIndex, program.length));
  const prefix = program.slice(0, insertAt);
  if (prefix.length === 0) return 0;

  const tokenized = tokenizeProgram(prefix);

  if (type === "conditionElse") {
    if (tokenized.ok) {
      for (let index = tokenized.statements.length - 1; index >= 0; index -= 1) {
        if (tokenized.statements[index].kind === "ifWall") {
          return tokenized.statements[index].indent;
        }
      }
    }
    return Math.max(0, prefix.at(-1).indent - 1);
  }

  if (tokenized.ok && tokenized.statements.length > 0) {
    const lastStatement = tokenized.statements.at(-1);
    if (["repeat3", "repeatUntilGoal", "ifWall", "else"].includes(lastStatement.kind)) {
      return Math.min(4, lastStatement.indent + 1);
    }
  }

  return prefix.at(-1).indent;
}

function addCommand(type, insertionIndex = null) {
  if (state.running || !COMMAND_BY_TYPE[type]) return;
  const nextProgram = [...currentProgram()];
  const item = {
    uid: createId(),
    type,
    indent: suggestedIndent(nextProgram, type, insertionIndex),
  };

  if (insertionIndex === null || insertionIndex >= nextProgram.length) {
    nextProgram.push(item);
  } else {
    nextProgram.splice(Math.max(0, insertionIndex), 0, item);
  }

  replaceCurrentProgram(nextProgram);
  resetClearButton();
  renderWorkspace();

  requestAnimationFrame(() => {
    const added = elements.workspace.querySelector(`[data-uid="${item.uid}"]`);
    added?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

function changeLineIndent(lineIndex, difference) {
  if (state.running) return;
  const program = [...currentProgram()];
  const line = groupProgramLines(program)[lineIndex];
  if (!line) return;
  const nextIndent = Math.max(0, Math.min(4, line.indent + difference));
  if (nextIndent === line.indent) return;

  for (let index = line.startIndex; index <= line.endIndex; index += 1) {
    program[index] = { ...program[index], indent: nextIndent };
  }

  replaceCurrentProgram(program);
  renderWorkspace();
}

function moveLine(lineIndex, direction) {
  if (state.running) return;
  const program = currentProgram();
  const lines = groupProgramLines(program);
  const targetLineIndex = lineIndex + direction;
  const line = lines[lineIndex];
  const target = lines[targetLineIndex];
  if (!line || !target) return;

  const first = direction < 0 ? target : line;
  const second = direction < 0 ? line : target;
  const firstBlock = program.slice(first.startIndex, first.endIndex + 1);
  const secondBlock = program.slice(second.startIndex, second.endIndex + 1);
  const nextProgram = [
    ...program.slice(0, first.startIndex),
    ...secondBlock,
    ...firstBlock,
    ...program.slice(second.endIndex + 1),
  ];

  replaceCurrentProgram(nextProgram);
  renderWorkspace();
}

function removeLine(lineIndex) {
  if (state.running) return;
  const program = [...currentProgram()];
  const line = groupProgramLines(program)[lineIndex];
  if (!line) return;
  program.splice(line.startIndex, line.endIndex - line.startIndex + 1);
  replaceCurrentProgram(program);
  renderWorkspace();
}

function removeCommand(index) {
  if (state.running) return;
  const program = [...currentProgram()];
  if (index < 0 || index >= program.length) return;
  program.splice(index, 1);
  replaceCurrentProgram(program);
  renderWorkspace();
}

function resetClearButton() {
  state.clearArmed = false;
  clearTimeout(state.clearTimer);
  elements.clearProgram.textContent = "すべて消す";
}

function clearProgram() {
  if (state.running || currentProgram().length === 0) return;

  if (!state.clearArmed) {
    state.clearArmed = true;
    elements.clearProgram.textContent = "もう一度押すと消えます";
    state.clearTimer = setTimeout(resetClearButton, 2600);
    return;
  }

  replaceCurrentProgram([]);
  resetClearButton();
  renderWorkspace();
  renderBoard(previewScenarioForMission(getMission(state.currentMissionId)), initialRobotState());
  setRunResult("info", "カードをすべて消しました。もう一度組み立てよう。", "↺");
}

function pointInside(rect, x, y) {
  return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
}

function dropIndexAt(x, y, sourceIndex = null) {
  const tokens = [...elements.workspace.querySelectorAll(".program-token")].filter(
    (token) => Number(token.dataset.index) !== sourceIndex,
  );

  for (let index = 0; index < tokens.length; index += 1) {
    const rect = tokens[index].getBoundingClientRect();
    if (y < rect.top) return index;
    if (y <= rect.bottom && x < rect.left + rect.width / 2) return index;
  }
  return tokens.length;
}

function beginDrag(event, dragData) {
  if (state.running || event.button > 0) return;
  event.preventDefault();
  cancelActiveDrag();

  state.drag = {
    ...dragData,
    pointerId: event.pointerId,
    x: event.clientX,
    y: event.clientY,
  };

  elements.dragGhost.textContent = dragData.label;
  elements.dragGhost.className = `drag-ghost is-visible category-${dragData.category}`;
  positionDragGhost(event.clientX, event.clientY);

  if (dragData.source === "workspace") {
    elements.workspace
      .querySelector(`.program-token[data-index="${dragData.index}"]`)
      ?.classList.add("is-drag-source");
  }

  window.addEventListener("pointermove", handleDragMove, { passive: false });
  window.addEventListener("pointerup", handleDragEnd, { once: true });
  window.addEventListener("pointercancel", cancelActiveDrag, { once: true });
}

function positionDragGhost(x, y) {
  elements.dragGhost.style.transform = `translate(${x - 22}px, ${y - 24}px) rotate(1deg)`;
}

function handleDragMove(event) {
  if (!state.drag || event.pointerId !== state.drag.pointerId) return;
  event.preventDefault();
  state.drag.x = event.clientX;
  state.drag.y = event.clientY;
  positionDragGhost(event.clientX, event.clientY);

  const inside = pointInside(
    elements.workspace.getBoundingClientRect(),
    event.clientX,
    event.clientY,
  );
  elements.workspace.classList.toggle("is-drop-target", inside);
}

function handleDragEnd(event) {
  if (!state.drag || event.pointerId !== state.drag.pointerId) {
    cancelActiveDrag();
    return;
  }

  const drag = state.drag;
  const inside = pointInside(
    elements.workspace.getBoundingClientRect(),
    event.clientX,
    event.clientY,
  );

  if (inside) {
    const index = dropIndexAt(
      event.clientX,
      event.clientY,
      drag.source === "workspace" ? drag.index : null,
    );

    if (drag.source === "palette") {
      addCommand(drag.type, index);
    } else {
      const program = [...currentProgram()];
      const [item] = program.splice(drag.index, 1);
      program.splice(Math.min(index, program.length), 0, item);
      replaceCurrentProgram(program);
      renderWorkspace();
    }
  }

  cancelActiveDrag();
}

function cancelActiveDrag() {
  state.drag = null;
  elements.dragGhost.className = "drag-ghost";
  elements.dragGhost.removeAttribute("style");
  elements.workspace.classList.remove("is-drop-target");
  elements.workspace.querySelectorAll(".is-drag-source").forEach((card) => {
    card.classList.remove("is-drag-source");
  });
  window.removeEventListener("pointermove", handleDragMove);
  window.removeEventListener("pointerup", handleDragEnd);
  window.removeEventListener("pointercancel", cancelActiveDrag);
}

function wallKey(row, col) {
  return `${row},${col}`;
}

function cellAriaLabel(mission, scenario, row, col, robotState) {
  const parts = [`${row + 1}行${col + 1}列`];
  if (row === 0 && col === 0) parts.push("スタート");
  if (row === scenario.size - 1 && col === scenario.size - 1) parts.push("ゴール");
  if (mission.event?.row === row && mission.event?.col === col) {
    parts.push(mission.event.label.replace("\n", " "));
  }
  if (mission.id === 6 && row === 1 && col === 0) parts.push("A地点");
  if (mission.id === 6 && row === 0 && col === 1) parts.push("B地点");
  if (robotState.row === row && robotState.col === col) {
    parts.push(`ロボット、${directionLabel(robotState.dir)}向き`);
  }
  return parts.join("、");
}

function renderBoard(scenario, robotState) {
  const mission = getMission(state.currentMissionId);
  const size = scenario.size;
  const wallCells = new Set((scenario.walls ?? []).map((wall) => wallKey(wall.row, wall.col)));
  elements.board.replaceChildren();
  elements.board.style.gridTemplateColumns = `repeat(${size}, minmax(0, 1fr))`;
  elements.board.style.gridTemplateRows = `repeat(${size}, minmax(0, 1fr))`;
  elements.scenarioBadge.textContent = scenario.label;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const cell = document.createElement("div");
      const isStart = row === 0 && col === 0;
      const isGoal = row === size - 1 && col === size - 1;
      const isEvent = mission.event?.row === row && mission.event?.col === col;
      const isWall = wallCells.has(wallKey(row, col));

      cell.className = "board-cell";
      cell.classList.toggle("is-start", isStart);
      cell.classList.toggle("is-goal", isGoal);
      cell.classList.toggle("is-event", Boolean(isEvent));
      cell.classList.toggle("is-wall", isWall);
      cell.classList.toggle("is-last-column", col === size - 1);
      cell.classList.toggle("is-last-row", row === size - 1);
      cell.setAttribute("role", "gridcell");
      cell.setAttribute("aria-label", cellAriaLabel(mission, scenario, row, col, robotState));

      if (mission.id === 6 && ((row === 1 && col === 0) || (row === 0 && col === 1))) {
        const corner = document.createElement("span");
        corner.className = "cell-corner-label";
        corner.textContent = row === 1 ? "A地点" : "B地点";
        cell.append(corner);
      }

      const label = document.createElement("span");
      label.className = "cell-label";
      if (isWall) label.textContent = "かべ";
      else if (isStart) label.textContent = "START";
      else if (isGoal) label.textContent = "GOAL";
      else if (isEvent) label.textContent = mission.event.label;
      if (label.textContent) cell.append(label);

      if (robotState.row === row && robotState.col === col && !isWall) {
        const robot = document.createElement("span");
        robot.className = "robot-piece";
        robot.textContent = "🤖";
        robot.setAttribute("aria-hidden", "true");
        robot.style.setProperty("--robot-angle", `${robotState.dir * 90}deg`);
        cell.append(robot);
      }

      elements.board.append(cell);
    }
  }

  const statusParts = [
    `${robotState.row + 1}行${robotState.col + 1}列`,
    `${directionLabel(robotState.dir)}向き`,
  ];
  if (robotState.hasPc) statusParts.push("PCを持っている");
  if (robotState.lastSpeech) statusParts.push(`「${robotState.lastSpeech}」`);
  elements.robotStatusText.textContent = statusParts.join("・");
}

function setRunResult(kind, message, icon) {
  elements.runResult.classList.remove("is-success", "is-error");
  if (kind === "success") elements.runResult.classList.add("is-success");
  if (kind === "error") elements.runResult.classList.add("is-error");
  elements.runResult.querySelector(".run-result__icon").textContent = icon;
  elements.runResult.querySelector("p").textContent = message;
}

function highlightProgram(sourceIndex) {
  elements.workspace.querySelectorAll(".program-line").forEach((line) => {
    const startIndex = Number(line.dataset.startIndex);
    const endIndex = Number(line.dataset.endIndex);
    line.classList.toggle(
      "is-running",
      sourceIndex !== null && sourceIndex >= startIndex && sourceIndex <= endIndex,
    );
  });
}

function setRunning(running) {
  state.running = running;
  elements.runProgram.disabled = running;
  elements.clearProgram.disabled = running;
  elements.runProgram.innerHTML = running
    ? '<span aria-hidden="true">●</span> 実行中…'
    : '<span aria-hidden="true">▶</span> 実行する！';
}

function cancelRun() {
  state.runToken += 1;
  if (state.running) setRunning(false);
  highlightProgram(null);
}

function wait(milliseconds) {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function missionSuccessMessage(missionId) {
  if (missionId === 6) return "クリア！ A地点・B地点の両方でゴールできました。";
  if (missionId === 7) return "クリア！ 3×3・4×4・5×5を同じプログラムでゴールできました。";
  return `問${missionId}クリア！ 命令どおりにロボットを動かせました。`;
}

async function runCurrentProgram() {
  if (state.running) return;
  resetClearButton();

  const missionId = state.currentMissionId;
  const program = currentProgram().map((item) => ({ type: item.type, indent: item.indent }));
  const outcome = runMission(program, missionId);

  if (outcome.compileError) {
    highlightProgram(outcome.sourceIndex);
    setRunResult("error", outcome.compileError, "⚠️");
    return;
  }

  const token = state.runToken + 1;
  state.runToken = token;
  setRunning(true);
  setRunResult("info", "ロボットが命令を読み取っています…", "🤖");

  try {
    for (let scenarioIndex = 0; scenarioIndex < outcome.results.length; scenarioIndex += 1) {
      if (token !== state.runToken) return;
      const result = outcome.results[scenarioIndex];
      renderBoard(result.scenario, initialRobotState());
      highlightProgram(null);
      setRunResult(
        "info",
        `${result.scenario.label}をテストします。`,
        outcome.results.length > 1 ? `${scenarioIndex + 1}️⃣` : "▶️",
      );
      await wait(300);

      for (const step of result.trace) {
        if (token !== state.runToken) return;
        renderBoard(result.scenario, step.state);
        highlightProgram(step.sourceIndex);
        setRunResult(step.kind === "error" ? "error" : "info", step.message, step.kind === "error" ? "⚠️" : "🤖");
        await wait(step.kind === "condition" ? 360 : 260);
      }

      if (!result.success) {
        const message = result.error ?? result.checks[0] ?? "ゴール条件をもう一度確認しよう。";
        setRunResult("error", message, "🔧");
        return;
      }

      if (scenarioIndex < outcome.results.length - 1) {
        setRunResult("success", `${result.scenario.label}はクリア！ 次のフィールドも試します。`, "✅");
        await wait(500);
      }
    }

    if (token !== state.runToken) return;
    state.completedMissions.add(missionId);
    renderMissionTabs();
    setRunResult("success", missionSuccessMessage(missionId), "🎉");
  } finally {
    if (token === state.runToken) {
      setRunning(false);
      highlightProgram(null);
    }
  }
}

function renderQuiz() {
  elements.quizList.replaceChildren();

  for (const question of QUIZ_QUESTIONS) {
    const item = document.createElement("article");
    item.className = "quiz-item";
    item.dataset.questionId = String(question.id);

    const number = document.createElement("div");
    number.className = "quiz-item__number";
    number.textContent = String(question.id);
    number.setAttribute("aria-hidden", "true");

    const body = document.createElement("div");
    body.className = "quiz-item__body";

    const label = document.createElement("label");
    label.htmlFor = `answer-${question.id}`;
    label.textContent = question.prompt;

    const input = document.createElement("input");
    input.className = "quiz-input";
    input.id = `answer-${question.id}`;
    input.name = `answer-${question.id}`;
    input.type = "text";
    input.autocomplete = "off";
    input.spellcheck = false;
    input.placeholder = "答えを入力";

    const feedback = document.createElement("p");
    feedback.className = "answer-feedback";
    feedback.id = `feedback-${question.id}`;
    input.setAttribute("aria-describedby", feedback.id);

    input.addEventListener("input", () => {
      item.classList.remove("is-correct", "is-wrong");
      feedback.textContent = "";
      elements.quizResult.hidden = true;
    });

    body.append(label, input, feedback);
    item.append(number, body);
    elements.quizList.append(item);
  }
}

function gradeCurrentQuiz(event) {
  event.preventDefault();
  const values = QUIZ_QUESTIONS.map((question) =>
    document.querySelector(`#answer-${question.id}`).value,
  );
  const grade = gradeQuiz(values);

  for (const result of grade.results) {
    const item = elements.quizList.querySelector(`[data-question-id="${result.questionId}"]`);
    const feedback = item.querySelector(".answer-feedback");
    item.classList.remove("is-correct", "is-wrong");
    item.classList.add(result.correct ? "is-correct" : "is-wrong");

    if (result.correct) {
      feedback.textContent = "正解！";
    } else if (result.unanswered) {
      feedback.textContent = "未回答です。答えを入力して、もう一度採点しよう。";
    } else {
      feedback.textContent = "不正解です。授業資料を確認して、もう一度挑戦しよう。";
    }
  }

  elements.quizScore.textContent = String(grade.score);
  if (grade.score === grade.total) {
    elements.quizResultTitle.textContent = "全問正解！";
    elements.quizResultMessage.textContent = "第1回で使ったプログラミングの言葉を説明できています。";
  } else if (grade.score >= 6) {
    elements.quizResultTitle.textContent = "よくできました！";
    elements.quizResultMessage.textContent = "間違えた問題だけ資料で確認して、もう一度挑戦してみよう。";
  } else {
    elements.quizResultTitle.textContent = "ここから覚えればOK！";
    elements.quizResultMessage.textContent = "正解を見ながら資料を確認し、もう一度入力してみよう。";
  }

  elements.quizResult.hidden = false;
  elements.quizResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

elements.navButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.view));
});

elements.goViewButtons.forEach((button) => {
  button.addEventListener("click", () => showView(button.dataset.goView));
});

elements.missionTabs.addEventListener("click", (event) => {
  const button = event.target.closest("[data-mission-id]");
  if (button) selectMission(button.dataset.missionId);
});

elements.palette.addEventListener("click", (event) => {
  const button = event.target.closest("[data-add-command]");
  if (button) addCommand(button.dataset.addCommand);
});

elements.workspace.addEventListener("click", (event) => {
  const tokenDelete = event.target.closest("[data-token-delete]");
  if (tokenDelete) {
    removeCommand(Number(tokenDelete.dataset.tokenDelete));
    return;
  }

  const button = event.target.closest("[data-line-action]");
  if (!button) return;
  const lineIndex = Number(button.dataset.lineIndex);
  if (button.dataset.lineAction === "outdent") changeLineIndent(lineIndex, -1);
  if (button.dataset.lineAction === "indent") changeLineIndent(lineIndex, 1);
  if (button.dataset.lineAction === "up") moveLine(lineIndex, -1);
  if (button.dataset.lineAction === "down") moveLine(lineIndex, 1);
  if (button.dataset.lineAction === "delete") removeLine(lineIndex);
});

elements.clearProgram.addEventListener("click", clearProgram);
elements.runProgram.addEventListener("click", runCurrentProgram);
elements.quizForm.addEventListener("submit", gradeCurrentQuiz);

window.addEventListener("hashchange", () => showView(viewFromHash(), false));

renderQuiz();
renderMission();
showView(viewFromHash(), false);
