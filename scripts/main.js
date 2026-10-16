const MODULE_ID = "gekko-ui-scale";

const originalTranslate = new WeakMap();
let spacingObserver;
let spacingFrame;

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

  // Si un bouton correspond à plusieurs structures imbriquées, on garde
  // seulement l'élément interactif le plus extérieur pour ne pas le déplacer deux fois.
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

  // La barre gauche peut comporter plusieurs colonnes et plusieurs structures
  // HTML selon Foundry ou les modules installés. On se base donc sur leur
  // position visuelle plutôt que sur une classe CSS particulière.
  for (const column of groupByAxis(items, "x")) {
    column.items.sort((a, b) => a.rect.top - b.rect.top);

    column.items.forEach((item, index) => {
      rememberTranslate(item.element);
      const base = originalTranslate.get(item.element) || "";
      const offset = index * delta;
      item.element.style.translate = base
        ? `${base} 0 ${offset}px`
        : `0 ${offset}px`;
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

  // Les onglets peuvent passer sur plusieurs lignes. Chaque ligne est traitée
  // séparément et son bouton le plus à droite reste ancré au bord du sidebar.
  for (const row of groupByAxis(items, "y")) {
    row.items.sort((a, b) => a.rect.left - b.rect.left);
    const lastIndex = row.items.length - 1;

    row.items.forEach((item, index) => {
      rememberTranslate(item.element);
      const base = originalTranslate.get(item.element) || "";
      const offset = -(lastIndex - index) * delta;
      item.element.style.translate = base
        ? `${base} ${offset}px 0`
        : `${offset}px 0`;
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
});

Hooks.once("ready", () => {
  applyLeftScale(game.settings.get(MODULE_ID, "leftScale"));
  applyRightTabsScale(game.settings.get(MODULE_ID, "rightScale"));
  applyRightContentScale(game.settings.get(MODULE_ID, "rightContentScale"));
  scheduleSpacingRefresh();

  // Les barres peuvent être rerendues lorsqu'un module ajoute ou retire un bouton.
  // On réapplique alors automatiquement l'écartement sans demander de rechargement.
  spacingObserver = new MutationObserver(scheduleSpacingRefresh);
  spacingObserver.observe(document.body, { childList: true, subtree: true });
  window.addEventListener("resize", scheduleSpacingRefresh);

  console.log("GEKKO — UI Scale | Prêt");
});
