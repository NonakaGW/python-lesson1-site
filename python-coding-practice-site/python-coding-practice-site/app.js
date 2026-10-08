"use strict";

// The questions themselves stay in HTML so they remain readable without JavaScript.
function questionIndexFromHash(hash) {
  const match = /^#q([1-8])$/.exec(hash || "");
  return match ? Number(match[1]) - 1 : null;
}

function questionNavigation(index, total) {
  if (!Number.isInteger(index) || index < 0 || index >= total) {
    throw new RangeError("Question index is outside the available questions.");
  }
  return {
    previous: index > 0 ? `#q${index}` : null,
    next: index < total - 1 ? `#q${index + 2}` : null,
    position: `問${index + 1} / ${total}`,
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { questionIndexFromHash, questionNavigation };
}

if (typeof document !== "undefined" && typeof window !== "undefined") {
  (() => {
    const questions = Array.from(document.querySelectorAll("article.question"));
    const questionLinks = Array.from(document.querySelectorAll(".question-nav a"));
    const main = document.getElementById("main");
    const controls = document.getElementById("question-controls");
    const previous = document.getElementById("previous-question");
    const next = document.getElementById("next-question");
    const position = document.getElementById("question-position");
    const status = document.getElementById("question-status");
    let activeIndex = questionIndexFromHash(window.location.hash) ?? 0;

    // Leave every question visible if the optional interface cannot initialize.
    if (questions.length !== 8 || questionLinks.length !== 8 || !main || !controls || !previous || !next || !position || !status) return;

    function renderQuestion(moveToQuestion) {
      const requestedIndex = questionIndexFromHash(window.location.hash);
      if (requestedIndex !== null) activeIndex = requestedIndex;
      const navigation = questionNavigation(activeIndex, questions.length);

      questions.forEach((question, index) => { question.hidden = index !== activeIndex; });
      questionLinks.forEach((link, index) => {
        if (index === activeIndex) link.setAttribute("aria-current", "page");
        else link.removeAttribute("aria-current");
      });

      controls.hidden = false;
      previous.hidden = navigation.previous === null;
      next.hidden = navigation.next === null;
      if (navigation.previous) previous.setAttribute("href", navigation.previous);
      if (navigation.next) next.setAttribute("href", navigation.next);
      position.textContent = navigation.position;

      const heading = questions[activeIndex].querySelector("h2");
      status.textContent = `問${activeIndex + 1}：${heading.textContent}`;

      if (moveToQuestion) {
        heading.focus({ preventScroll: true });
        const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        main.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }
    }

    // Standard fragment links still work if JavaScript is disabled.
    document.querySelectorAll('a[href^="#q"]').forEach((link) => {
      link.addEventListener("click", (event) => {
        if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        const hash = link.getAttribute("href");
        if (questionIndexFromHash(hash) === null) return;
        event.preventDefault();
        if (window.location.hash === hash) renderQuestion(true);
        else window.location.hash = hash;
      });
    });

    window.addEventListener("hashchange", () => {
      // Do not interfere with the skip link or other non-question anchors.
      if (window.location.hash === "") {
        activeIndex = 0;
        renderQuestion(true);
      } else if (questionIndexFromHash(window.location.hash) !== null) {
        renderQuestion(true);
      }
    });

    renderQuestion(false);
    if (questionIndexFromHash(window.location.hash) !== null) {
      window.requestAnimationFrame(() => {
        main.scrollIntoView({ behavior: "auto", block: "start" });
      });
    }
  })();
}
