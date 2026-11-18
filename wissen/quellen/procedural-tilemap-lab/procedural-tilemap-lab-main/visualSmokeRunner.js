const SUMMARY_PASS_TEXT = "pass";
const SUMMARY_FAIL_TEXT = "fail";
const FRAME_TIMEOUT_MS = 20000;
const POLL_INTERVAL_MS = 650;

const summaryNode = document.querySelector("#visualSmokeSummary");
const resultsNode = document.querySelector("#visualSmokeResults");
const runButton = document.querySelector("#visualSmokeRunButton");

const checks = [
  {
    id: "map-dungeon",
    label: "Map View dungeon",
    frame: document.querySelector("#visualSmokeMapFrame"),
    setup: null,
    assert(snapshot) {
      return snapshot.page === "map-view"
        && snapshot.controls?.biome === "dungeon"
        && snapshot.controls?.topology === "narrowCorridors"
        && isSettledStatus(snapshot.statusText)
        && snapshot.canvas?.ok === true;
    },
  },
  {
    id: "material-sprite",
    label: "Material Lab sprite",
    frame: document.querySelector("#visualSmokeSpriteFrame"),
    setup(win) {
      setSelectValue(win, "#materialModeSelect", "spriteProps");
      setSelectValue(win, "#materialPropSelect", "spriteLargeRock");
    },
    assert(snapshot) {
      return snapshot.page === "material-lab"
        && snapshot.mode === "spriteProps"
        && snapshot.sprite?.prop === "spriteLargeRock"
        && isSettledStatus(snapshot.statusText)
        && snapshot.canvas?.ok === true;
    },
  },
  {
    id: "material-procedural",
    label: "Material Lab procedural",
    frame: document.querySelector("#visualSmokeProceduralFrame"),
    setup(win) {
      setSelectValue(win, "#materialModeSelect", "proceduralElements");
      setSelectValue(win, "#proceduralElementSelect", "dungeon-floor-wear");
    },
    assert(snapshot) {
      return snapshot.page === "material-lab"
        && snapshot.mode === "proceduralElements"
        && snapshot.procedural?.element === "dungeon-floor-wear"
        && isSettledStatus(snapshot.statusText)
        && snapshot.canvas?.ok === true;
    },
  },
];

runButton?.addEventListener("click", () => {
  runVisualSmoke().catch((error) => {
    publishResults([{
      id: "runner",
      label: "Visual smoke runner",
      ok: false,
      reason: error.message,
    }]);
  });
});

window.addEventListener("load", () => {
  runVisualSmoke();
});

async function runVisualSmoke() {
  setSummary("running");
  resultsNode.replaceChildren();
  const results = [];
  for (const check of checks) {
    const result = await runFrameCheck(check);
    results.push(result);
    publishResults(results);
  }
  publishResults(results);
  globalThis.__LAB_VISUAL_SMOKE_RUN__ = {
    version: "visual-smoke-runner1",
    ok: results.every((result) => result.ok),
    results,
  };
}

async function runFrameCheck(check) {
  const startedAt = Date.now();
  let setupDone = false;
  let lastSnapshot = null;
  let lastReason = "waiting";
  while (Date.now() - startedAt < FRAME_TIMEOUT_MS) {
    const win = check.frame?.contentWindow;
    const probe = win?.__LAB_VISUAL_SMOKE__;
    if (probe?.capture) {
      if (!setupDone && check.setup) {
        check.setup(win);
        setupDone = true;
        await delay(POLL_INTERVAL_MS);
      }
      const snapshot = probe.capture();
      lastSnapshot = snapshot;
      lastReason = snapshot.canvas?.reason ?? snapshot.reason ?? "not-ready";
      if (snapshot.ok && check.assert(snapshot)) {
        return {
          id: check.id,
          label: check.label,
          ok: true,
          elapsedMs: Date.now() - startedAt,
          snapshot,
        };
      }
    }
    await delay(POLL_INTERVAL_MS);
  }
  return {
    id: check.id,
    label: check.label,
    ok: false,
    elapsedMs: Date.now() - startedAt,
    reason: lastReason,
    snapshot: lastSnapshot,
  };
}

function publishResults(results) {
  const ok = results.length === checks.length && results.every((result) => result.ok);
  setSummary(`${ok ? SUMMARY_PASS_TEXT : SUMMARY_FAIL_TEXT} ${results.filter((result) => result.ok).length}/${checks.length}`);
  resultsNode.replaceChildren(...results.map(renderResult));
}

function renderResult(result) {
  const section = document.createElement("section");
  section.className = `smoke-result ${result.ok ? "is-ok" : "is-fail"}`;

  const title = document.createElement("div");
  title.className = "smoke-result-title";
  const label = document.createElement("strong");
  label.textContent = result.label;
  const state = document.createElement("span");
  state.textContent = result.ok ? "PASS" : "FAIL";
  title.append(label, state);

  const meta = document.createElement("div");
  meta.className = "smoke-result-meta";
  const canvas = result.snapshot?.canvas;
  meta.textContent = canvas
    ? `${canvas.width}x${canvas.height} step ${canvas.sampleStep} colors ${canvas.distinctColors} luma ${canvas.lumaRange} checksum ${canvas.checksum} / ${result.elapsedMs}ms`
    : `${result.reason ?? "no snapshot"} / ${result.elapsedMs ?? 0}ms`;

  const status = document.createElement("code");
  status.textContent = result.snapshot?.statusText ?? result.reason ?? "";

  section.append(title, meta, status);
  return section;
}

function setSelectValue(win, selector, value) {
  const select = win.document.querySelector(selector);
  if (!select || select.value === value) return;
  select.value = value;
  select.dispatchEvent(new Event("change", { bubbles: true }));
}

function isSettledStatus(text) {
  return !/(loading|checking|error)/i.test(String(text ?? ""));
}

function setSummary(text) {
  if (summaryNode) summaryNode.textContent = text;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
