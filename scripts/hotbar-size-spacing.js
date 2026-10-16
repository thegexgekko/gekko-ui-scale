const MODULE_ID = "gekko-ui-scale";

const hotbarSizeState = new WeakMap();
const hotbarSlotSpacingState = new WeakMap();
let hotbarVisualObserver;
let hotbarVisualFrame;

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

function resolveHotbarElement() {
  const uiElement = globalThis.ui?.hotbar?.element;
  if (uiElement instanceof HTMLElement) return uiElement;
  if (uiElement?.[0] instanceof HTMLElement) return uiElement[0];

  return document.querySelector("#hotbar") ||
    document.querySelector("#ui-bottom .hotbar") ||
    document.querySelector(".hotbar");
}

function getActionSlots(hotbar) {
  if (!hotbar) return [];
  return [...hotbar.querySelectorAll("#action-bar > li.slot")];
}

function getHotbarSizeState(hotbar) {
  if (hotbarSizeState.has(hotbar)) return hotbarSizeState.get(hotbar);

  const originalInline = hotbar.style.getPropertyValue("--hotbar-size");
  const computedValue = getComputedStyle(hotbar)
    .getPropertyValue("--hotbar-size")
    .trim();

  let baseSize = Number.parseFloat(computedValue);

  if (!Number.isFinite(baseSize) || baseSize <= 0) {
    const firstSlot = getActionSlots(hotbar)[0];
    const width = firstSlot?.getBoundingClientRect().width;
    baseSize = Number.isFinite(width) && width > 0 ? width : 52;
  }

  const state = { originalInline, baseSize };
  hotbarSizeState.set(hotbar, state);
  return state;
}

function restoreHotbarSize(hotbar, state) {
  if (state.originalInline) {
    hotbar.style.setProperty("--hotbar-size", state.originalInline);
  } else {
    hotbar.style.removeProperty("--hotbar-size");
  }
}

function applyHotbarButtonScale() {
  const hotbar = resolveHotbarElement();
  if (!hotbar) return;

  const state = getHotbarSizeState(hotbar);
  const percent = clampPercent(game.settings.get(MODULE_ID, "hotbarButtonScale"));

  if (percent === 100) {
    restoreHotbarSize(hotbar, state);
    return;
  }

  const size = state.baseSize * (percent / 100);
  hotbar.style.setProperty("--hotbar-size", `${size}px`);
}

function getSlotSpacingState(slot) {
  if (hotbarSlotSpacingState.has(slot)) {
    return hotbarSlotSpacingState.get(slot);
  }

  const originalInline = slot.style.marginInlineStart || "";
  const computed = Number.parseFloat(getComputedStyle(slot).marginInlineStart);
  const baseMargin = Number.isFinite(computed) ? computed : 0;

  const state = { originalInline, baseMargin };
  hotbarSlotSpacingState.set(slot, state);
  return state;
}

function restoreSlotSpacing(slot, state) {
  if (state.originalInline) {
    slot.style.marginInlineStart = state.originalInline;
  } else {
    slot.style.removeProperty("margin-inline-start");
  }
}

function applyHotbarButtonSpacing() {
  const hotbar = resolveHotbarElement();
  if (!hotbar) return;

  const slots = getActionSlots(hotbar);
  if (!slots.length) return;

  const spacing = clampSpacing(game.settings.get(MODULE_ID, "hotbarButtonSpacing"));

  slots.forEach((slot, index) => {
    const state = getSlotSpacingState(slot);

    if (spacing === 0 || index === 0) {
      restoreSlotSpacing(slot, state);
      return;
    }

    slot.style.marginInlineStart = `${state.baseMargin + spacing}px`;
  });
}

function applyHotbarVisualSettings() {
  applyHotbarButtonScale();
  applyHotbarButtonSpacing();
}

function scheduleHotbarVisualRefresh() {
  if (hotbarVisualFrame) cancelAnimationFrame(hotbarVisualFrame);

  hotbarVisualFrame = requestAnimationFrame(() => {
    hotbarVisualFrame = undefined;
    applyHotbarVisualSettings();
  });
}

Hooks.once("init", () => {
  game.settings.register(MODULE_ID, "hotbarButtonScale", {
    name: "GEKKO_UI_SCALE.Settings.HotbarButtonScale.Name",
    hint: "GEKKO_UI_SCALE.Settings.HotbarButtonScale.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: 50, max: 200, step: 5 },
    default: 100,
    onChange: scheduleHotbarVisualRefresh
  });

  game.settings.register(MODULE_ID, "hotbarButtonSpacing", {
    name: "GEKKO_UI_SCALE.Settings.HotbarButtonSpacing.Name",
    hint: "GEKKO_UI_SCALE.Settings.HotbarButtonSpacing.Hint",
    scope: "client",
    config: true,
    type: Number,
    range: { min: -10, max: 20, step: 1 },
    default: 0,
    onChange: scheduleHotbarVisualRefresh
  });
});

Hooks.once("ready", () => {
  scheduleHotbarVisualRefresh();

  hotbarVisualObserver = new MutationObserver(scheduleHotbarVisualRefresh);
  hotbarVisualObserver.observe(document.body, { childList: true, subtree: true });

  window.addEventListener("resize", scheduleHotbarVisualRefresh);
});
