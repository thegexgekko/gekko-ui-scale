const MODULE_ID = "gekko-ui-scale";

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

function setPixelVariable(variableName, value) {
  document.documentElement.style.setProperty(
    variableName,
    `${clampSpacing(value)}px`
  );
}

function applyLeftScale(value) {
  setScaleVariable("--gekko-ui-left-scale", value);
}

function applyLeftSpacing(value) {
  setPixelVariable("--gekko-ui-left-spacing", value);
}

function applyRightTabsScale(value) {
  setScaleVariable("--gekko-ui-right-tabs-scale", value);
}

function applyRightTabsSpacing(value) {
  setPixelVariable("--gekko-ui-right-tabs-spacing", value);
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
  applyLeftSpacing(game.settings.get(MODULE_ID, "leftSpacing"));
  applyRightTabsScale(game.settings.get(MODULE_ID, "rightScale"));
  applyRightTabsSpacing(game.settings.get(MODULE_ID, "rightTabsSpacing"));
  applyRightContentScale(game.settings.get(MODULE_ID, "rightContentScale"));

  console.log("GEKKO — UI Scale | Prêt");
});
