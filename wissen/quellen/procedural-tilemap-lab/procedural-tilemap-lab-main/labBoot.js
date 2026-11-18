import { labVersionedUrl } from "./labBuild.js";
import { installLabI18n, translateLabText } from "./labI18n.js";

const bootStartedAt = performance.now();
globalThis.__labBootPerformance = {
  startedAt: bootStartedAt,
  liveReloadImportMs: 0,
  entryImportMs: 0,
  totalMs: 0,
};

bootstrapLabPage().catch((error) => {
  console.error("[lab] boot failed", error);
  const message = document.createElement("pre");
  message.style.whiteSpace = "pre-wrap";
  message.textContent = translateLabText(`Lab boot failed: ${error.message}`);
  document.body.prepend(message);
});

async function bootstrapLabPage() {
  installLabI18n();
  const bootScript = document.querySelector("script[data-lab-entry]");
  const entry = bootScript?.dataset.labEntry;
  if (!entry) throw new Error("missing data-lab-entry");
  const liveReloadEnabled = new URLSearchParams(location.search).get("liveReload") !== "0";
  if (location.protocol !== "file:" && liveReloadEnabled) {
    const liveReloadStartedAt = performance.now();
    await import(labVersionedUrl("./labLiveReload.js"));
    globalThis.__labBootPerformance.liveReloadImportMs = roundBootMs(performance.now() - liveReloadStartedAt);
  }
  const entryStartedAt = performance.now();
  await import(labVersionedUrl(entry));
  globalThis.__labBootPerformance.entryImportMs = roundBootMs(performance.now() - entryStartedAt);
  globalThis.__labBootPerformance.totalMs = roundBootMs(performance.now() - bootStartedAt);
}

function roundBootMs(value) {
  return Math.round(value * 100) / 100;
}
