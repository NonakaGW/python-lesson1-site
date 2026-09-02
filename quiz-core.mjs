export const QUIZ_QUESTIONS = [
  {
    id: 1,
    prompt: "何を、どんな流れで行うか決めた「命令のまとまり」",
    answers: ["プログラム"],
    displayAnswer: "プログラム",
  },
  {
    id: 2,
    prompt: "その「命令のまとまり」を作ること",
    answers: ["プログラミング"],
    displayAnswer: "プログラミング",
  },
  {
    id: 3,
    prompt: "この授業で使う、コンピュータに命令を伝えるための言語",
    answers: ["Python", "パイソン"],
    displayAnswer: "Python",
  },
  {
    id: 4,
    prompt: "命令を決められた順番に実行すること",
    answers: ["順次処理"],
    displayAnswer: "順次処理",
  },
  {
    id: 5,
    prompt: "データを入れておく箱のようなもの",
    answers: ["変数"],
    displayAnswer: "変数",
  },
  {
    id: 6,
    prompt: "同じ処理を何度も行うこと",
    answers: ["繰り返し"],
    displayAnswer: "繰り返し",
  },
  {
    id: 7,
    prompt: "条件によって行う処理を変えること",
    answers: ["条件分岐"],
    displayAnswer: "条件分岐",
  },
  {
    id: 8,
    prompt: "目的を達成するための手順・方法",
    answers: ["アルゴリズム"],
    displayAnswer: "アルゴリズム",
  },
  {
    id: 9,
    prompt: "間違いを見つけて直すこと",
    answers: ["デバッグ"],
    displayAnswer: "デバッグ",
  },
];

export function normalizeAnswer(value) {
  return String(value ?? "")
    .normalize("NFKC")
    .toLocaleLowerCase("ja-JP")
    .replace(/[\s\u3000]/g, "")
    .replace(/[「」『』【】()（）\[\]［］"'’`]/g, "")
    .trim();
}

export function gradeQuiz(values) {
  const results = QUIZ_QUESTIONS.map((question, index) => {
    const rawValue = values[index] ?? "";
    const normalized = normalizeAnswer(rawValue);
    const accepted = question.answers.map(normalizeAnswer);
    const correct = normalized.length > 0 && accepted.includes(normalized);

    return {
      questionId: question.id,
      rawValue,
      normalized,
      correct,
      unanswered: normalized.length === 0,
      displayAnswer: question.displayAnswer,
    };
  });

  return {
    score: results.filter((result) => result.correct).length,
    total: results.length,
    results,
  };
}
