"use strict";

(function () {
  const script = document.currentScript;
  if (!script) return;

  const heading = document.querySelector("h1");
  const lessonTitle = (script.dataset.lessonTitle || heading?.textContent || document.title || "未命名课堂").trim();
  const configuredUrl = script.dataset.whiteboardUrl || "../../tools/whiteboard/index.html";
  const whiteboardUrl = new URL(configuredUrl, window.location.href);
  const lessonKey = "classroom-whiteboard-session:" + window.location.href.split("#")[0];
  let sessionId = sessionStorage.getItem(lessonKey);

  if (!sessionId) {
    sessionId = "lesson-" + Date.now() + "-" + Math.random().toString(36).slice(2, 9);
    sessionStorage.setItem(lessonKey, sessionId);
  }

  const lessonWindowName = "lesson-" + sessionId;
  if (!window.name) window.name = lessonWindowName;

  const button = document.createElement("button");
  button.type = "button";
  button.className = "classroom-whiteboard-launcher";
  button.setAttribute("aria-label", "打开课堂白板");
  button.title = "打开课堂白板";
  button.innerHTML = '<span class="classroom-whiteboard-launcher__icon" aria-hidden="true">✎</span><span class="classroom-whiteboard-launcher__label">白板</span>';

  function buildWhiteboardUrl() {
    const url = new URL(whiteboardUrl.href);
    url.searchParams.set("lessonTitle", lessonTitle);
    url.searchParams.set("lessonUrl", window.location.href);
    url.searchParams.set("lessonWindow", window.name || lessonWindowName);
    url.searchParams.set("session", sessionId);
    url.searchParams.set("new", "1");
    return url.href;
  }

  button.addEventListener("click", function () {
    const boardWindow = window.open(buildWhiteboardUrl(), "classroom-whiteboard");
    if (boardWindow) {
      boardWindow.focus();
      return;
    }
    window.open(buildWhiteboardUrl(), "_blank", "noopener");
  });

  document.body.appendChild(button);
})();
