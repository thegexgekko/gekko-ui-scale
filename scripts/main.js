const MODULE_ID = "gekko-ui-scale";

const originalTranslate = new WeakMap();
let spacingObserver;
let spacingFrame;
let hotbarFrame;
let hotbarHideTimer;
let hotbarAutoHideState = false;

const HOTBAR_POSITION_CLASSES = [
  "gekko-ui-hotbar-bottom-left",
  "gekko-ui-hotbar-bottom-center",
  "gekko-ui-hotbar-bottom-right"
];

function clampPercent(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 100;
  return Math.min(200, Math.max(50, n));
}

function clampSpacing(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 0;
  return Math.min(20, Math.max(-10, n));
}

function clampRevealHeight(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 12;
  return Math.min(100, Math.max(1, n));
}

function clampHideDelay(value) {
  const n = Number(value);
  if (!Number.isFinite(n)) return 2000;
  return Math.min(5000, Math.max(0, n));
}

function setScaleVariable(variableName, value) {
  document.documentElement.style.setProperty(
    variableName,
    String(clampPercent(value) / 100)
  );
}

function rememberTranslate(element) {
  if (!originalTranslate.has(element)) {
    originalTranslate.set(element, element.style.translate || "");
  }
}

function restoreTranslatedElements(root) {
  if (!root) return;
  for (const element of root.querySelectorAll("[data-gekko-ui-spacing]")) {
    element.style.translate = originalTranslate.get(element) ?? "";
    delete element.dataset.gekkoUiSpacing;
  }
}

function getSpacingCandidates(root) {
  if (!root) return [];

  const selector = [
    "button",
    ".ui-control",
    ".control-tool",
    "[data-tab]",
    "[data-action]",
    "[data-control]",
    "[data-tool]",
    "[role='button']"
  ].join(",");

  const candidates = [...root.querySelectorAll(selector)].filter(element => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return style.display !== "none" &&
      style.visibility !== "hidden" &&
      rect.width >= 8 &&
      rect.height >= 8;
  });

  const candidateSet = new Set(candidates);

  return candidates.filter(element => {
    let parent = element.parentElement;
    while (parent && parent !== root) {
      if (candidateSet.has(parent)) return false;
      parent = parent.parentElement;
    }
    return true;
  });
}

function groupByAxis(items, axis) {
  const groups = [];

  for (const item of items) {
    const rect = item.rect;
    const center = axis === "x"
      ? rect.left + rect.width / 2
      : rect.top + rect.height / 2;
    const size = axis === "x" ? rect.width : rect.height;
    const tolerance = Math.max(12, size * 0.45);

    let group = groups.find(candidate => Math.abs(candidate.center - center) <= tolerance);
    if (!group) {
      group = { center, items: [] };
      groups.push(group);
    }

    group.items.push(item);
    group.center = group.items.reduce((sum, entry) => {
      const r = entry.rect;
      return sum + (axis === "x" ? r.left + r.width / 2 : r.top + r.height / 2);
    }, 0) / group.items.length;
  }

  return groups;
}

function applyLeftSpacingLayout() {
  const root = document.querySelector("#scene-controls");
  if (!root) return;

  restoreTranslatedElements(root);

  const spacing = clampSpacing(game.settings.get(MODULE_ID, "leftSpacing"));
  if (spacing === 0) return;

  const scale = clampPercent(game.settings.get(MODULE_ID, "leftScale")) / 100;
  const delta = spacing / scale;
  const items = getSpacingCandidates(root).map(element => ({
    element,
    rect: element.getBoundingClientRect()
  }));

  for (const column of groupByAxis(items, "x")) {
    column.items.sort((a, b) => a.rect.top - b.rect.top);

    column.items.forEach((item, index) => {
      rememberTranslate(item.element);
      item.element.style.translate = `0 ${index * delta}px`;
      item.element.dataset.gekkoUiSpacing = "left";
    });
  }
}

function applyRightSpacingLayout() {
  const root = document.querySelector("#sidebar-tabs");
  if (!root) return;

  restoreTranslatedElements(root);

  const spacing = clampSpacing(game.settings.get(MODULE_ID, "rightTabsSpacing"));
  if (spacing === 0) return;

  const scale = clampPercent(game.settings.get(MODULE_ID, "rightScale")) / 100;
  const delta = spacing / scale;
  const items = getSpacingCandidates(root).map(element => ({
    element,
    rect: element.getBoundingClientRect()
  }));

  for (const row of groupByAxis(items, "y")) {
    row.items.sort((a, b) => a.rect.left - b.rect.left);
    const lastIndex = row.items.length - 1;

    row.items.forEach((item, index) => {
      rememberTranslate(item.element);
      const offset = -(lastIndex - index) * delta;
      item.element.style.translate = `${offset}px 0`;
      item.element.dataset.gekkoUiSpacing = "right";
    });
  }
}

function applySpacingLayouts() {
  applyLeftSpacingLayout();
  applyRightSpacingLayout();
}

function scheduleSpacingRefresh() {
  if (spacingFrame) cancelAnimationFrame(spacingFrame);
  spacingFrame = requestAnimationFrame(() => {
    spacingFrame = undefined;
    applySpacingLayouts();
  });
}

function resolveHotbarElement() {
  const uiElement = globalThis.ui?.hotbar?.element;
  if (uiElement instanceof HTMLElement) return uiElement;
  if (uiElement?.[0] instanceof HTMLElement) return uiElement[0];

  return document.querySelector("#hotbar") ||
    document.querySelector("#ui-bottom .hotbar") ||
    document.querySelector(".hotbar");
}

function isHotbarAutoHideEnabled() {
  return Boolean(game.settings.get(MODULE_ID, "hotbarAutoHide"));
}

function clearHotbarHideTimer() {
  if (!hotbarHideTimer) return;
  clearTimeout(hotbarHideTimer);
  hotbarHideTimer = undefined;
}

function showHotbar() {
  clearHotbarHideTimer();
  document.body?.classList.remove("gekko-ui-hotbar-hidden");
}

function hideHotbar() {
  clearHotbarHideTimer();
  if (!isHotbarAutoHideEnabled()) return;
  document.body?.classList.add("gekko-ui-hotbar-hidden");
}

function scheduleHotbarHide() {
  if (!isHotbarAutoHideEnabled()) return;
  if (hotbarHideTimer) return;

  const delay = clampHideDelay(game.settings.get(MODULE_ID, "hotbarHideDelay"));
  if (delay === 0) {
    hideHotbar();
    return;
  }

  hotbarHideTimer = setTimeout(() => {
    hotbarHideTimer = undefined;
    hideHotbar();
  }, delay);
}

function pointerIsInsideHotbar(event) {
  const hotbar = resolveHotbarElement();
  if (!hotbar) return false;

  if (event.target instanceof Element && hotbar.contains(event.target)) {
    return true;
  }

  const rect = hotbar.getBoundingClientRect();
  return event.clientX >= rect.left &&
    event.clientX <= rect.right &&
    event.clientY >= rect.top &&
    event.clientY <= rect.bottom;
}

function handleHotbarPointerMove(event) {
  if (!isHotbarAutoHideEnabled()) return;

  const revealHeight = clampRevealHeight(
    game.settings.get(MODULE_ID, "hotbarRevealHeight")
  );

  const inRevealZone = event.clientY >= window.innerHeight - revealHeight;

  if (inRevealZone || pointerIsInsideHotbar(event)) {
    showHotbar();
    return;
  }

  scheduleHotbarHide();
}

function applyHotbarSettings({ resetHideTimer = false } = {}) {
  const body = document.body;
  if (!body) return;

  for (const className of HOTBAR_POSITION_CLASSES) {
    body.classList.remove(className);
  }

  const position = game.settings.get(MODULE_ID, "hotbarPosition");
  if (position === "bottom-left") {
    body.classList.add("gekko-ui-hotbar-bottom-left");
  } else if (position === "bottom-center") {
    body.classList.add("gekko-ui-hotbar-bottom-center");
  } else if (position === "bottom-right") {
    body.classList.add("gekko-ui-hotbar-bottom-right");
  }

  const enabled = isHotbarAutoHideEnabled();
  body.classList.toggle("gekko-ui-hotbar-autohide", enabled);

  if (!enabled) {
    clearHotbarHideTimer();
    body.classList.remove("gekko-ui-hotbar-hidden");
  } else if (!hotbarAutoHideState || resetHideTimer) {
    showHotbar();
    scheduleHotbarHide();
  }

  hotbarAutoHideState = enabled;
}

function scheduleHotbarRefresh() {
  if (hotbarFrame) cancelAnimationFrame(hotbarFrame);
  hotbarFrame = requestAnimationFrame(() => {
    hotbarFrame = undefined;
    applyHotbarSettings();
  });
}

function applyLeftScale(value) {
  setScaleVariable("--gekko-ui-left-scale", value);
  scheduleSpacingRefresh();
}

function applyLeftSpacing() {
  scheduleSpacingRefresh();
}

function applyRightTabsScale(value) {
  setScaleVariable("--gekko-ui-right-tabs-scale", value);
  scheduleSpacingRefresh();
}

function applyRightTabsSpacing() {
  scheduleSpacingRefresh();
}

function applyRightContentScale(value) {
  setScaleVariable("--gekko-ui-right-content-scale", value);
}

function applyHotbarAutoHide() {
  applyHotbarSettings({ resetHideTimer: true });
}

function applyHotbarRevealHeight() {
  applyHotbarSettings({ resetHideTimer: true });
}

function applyHotbarHideDelay() {
  applyHotbarSettings({ resetHideTimer: true });
}

function applyHotbarPosition() {
  applyHotbarSettings();
}

Hooks.once("init", () => {
  console.log("GEKKO — UI Scale | Initialisation");

  game.settings.register(MODULE_ID, "leftScale", {
    name: "GEKKO_UI_SCALE.Settings.LeftScale.Name",
    hint: "GEKKO_UI_SCALE.Settings.LeftScale.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 50, max: 200, step: 5 },
    default: 100,
    onChange: applyLeftScale
  });

  game.settings.register(MODULE_ID, "leftSpacing", {
    name: "GEKKO_UI_SCALE.Settings.LeftSpacing.Name",
    hint: "GEKKO_UI_SCALE.Settings.LeftSpacing.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: -10, max: 20, step: 1 },
    default: 0,
    onChange: applyLeftSpacing
  });

  game.settings.register(MODULE_ID, "rightScale", {
    name: "GEKKO_UI_SCALE.Settings.RightTabsScale.Name",
    hint: "GEKKO_UI_SCALE.Settings.RightTabsScale.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 50, max: 200, step: 5 },
    default: 100,
    onChange: applyRightTabsScale
  });

  game.settings.register(MODULE_ID, "rightTabsSpacing", {
    name: "GEKKO_UI_SCALE.Settings.RightTabsSpacing.Name",
    hint: "GEKKO_UI_SCALE.Settings.RightTabsSpacing.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: -10, max: 20, step: 1 },
    default: 0,
    onChange: applyRightTabsSpacing
  });

  game.settings.register(MODULE_ID, "rightContentScale", {
    name: "GEKKO_UI_SCALE.Settings.RightContentScale.Name",
    hint: "GEKKO_UI_SCALE.Settings.RightContentScale.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 50, max: 200, step: 5 },
    default: 100,
    onChange: applyRightContentScale
  });

  game.settings.register(MODULE_ID, "hotbarAutoHide", {
    name: "GEKKO_UI_SCALE.Settings.HotbarAutoHide.Name",
    hint: "GEKKO_UI_SCALE.Settings.HotbarAutoHide.Hint",
    scope: "client",
    config: true,
    type: Boolean,
    default: false,
    onChange: applyHotbarAutoHide
  });

  game.settings.register(MODULE_ID, "hotbarRevealHeight", {
    name: "GEKKO_UI_SCALE.Settings.HotbarRevealHeight.Name",
    hint: "GEKKO_UI_SCALE.Settings.HotbarRevealHeight.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 1, max: 100, step: 1 },
    default: 12,
    onChange: applyHotbarRevealHeight
  });

  game.settings.register(MODULE_ID, "hotbarHideDelay", {
    name: "GEKKO_UI_SCALE.Settings.HotbarHideDelay.Name",
    hint: "GEKKO_UI_SCALE.Settings.HotbarHideDelay.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 0, max: 5000, step: 100 },
    default: 2000,
    onChange: applyHotbarHideDelay
  });

  game.settings.register(MODULE_ID, "hotbarPosition", {
    name: "GEKKO_UI_SCALE.Settings.HotbarPosition.Name",
    hint: "GEKKO_UI_SCALE.Settings.HotbarPosition.Hint",
    scope: "client",
    config: true,
    type: String,
    choices: {
      standard: "GEKKO_UI_SCALE.Settings.HotbarPosition.Standard",
      "bottom-left": "GEKKO_UI_SCALE.Settings.HotbarPosition.BottomLeft",
      "bottom-center": "GEKKO_UI_SCALE.Settings.HotbarPosition.BottomCenter",
      "bottom-right": "GEKKO_UI_SCALE.Settings.HotbarPosition.BottomRight"
    },
    default: "standard",
    onChange: applyHotbarPosition
  });
});

Hooks.once("ready", () => {
  applyLeftScale(game.settings.get(MODULE_ID, "leftScale"));
  applyRightTabsScale(game.settings.get(MODULE_ID, "rightScale"));
  applyRightContentScale(game.settings.get(MODULE_ID, "rightContentScale"));
  scheduleSpacingRefresh();
  applyHotbarSettings({ resetHideTimer: true });

  spacingObserver = new MutationObserver(() => {
    scheduleSpacingRefresh();
    scheduleHotbarRefresh();
  });
  spacingObserver.observe(document.body, { childList: true, subtree: true });

  document.addEventListener("pointermove", handleHotbarPointerMove, { passive: true });
  window.addEventListener("resize", () => {
    scheduleSpacingRefresh();
    scheduleHotbarRefresh();
  });

  console.log("GEKKO — UI Scale | Prêt");
});
