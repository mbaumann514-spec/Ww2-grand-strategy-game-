(() => {
  if (!("EventSource" in window)) return;
  if (location.protocol === "file:") return;

  let connectedOnce = false;
  let reloadTimer = 0;

  const source = new EventSource("/__lab/events");

  source.addEventListener("hello", () => {
    connectedOnce = true;
  });

  source.addEventListener("reload", (event) => {
    scheduleReload(event.data || "file changed", 180);
  });

  source.onerror = () => {
    if (connectedOnce) scheduleReload("server restarted", 1000);
  };

  function scheduleReload(reason, delay) {
    clearTimeout(reloadTimer);
    reloadTimer = setTimeout(() => {
      waitForServerThenReload(reason);
    }, delay);
  }

  async function waitForServerThenReload(reason) {
    for (let attempt = 0; attempt < 30; attempt += 1) {
      if (await pingServer()) {
        console.info(`[lab] live reload: ${reason}`);
        location.reload();
        return;
      }
      await delay(300);
    }
  }

  async function pingServer() {
    try {
      const response = await fetch(`/__lab/ping?now=${Date.now()}`, { cache: "no-store" });
      return response.ok;
    } catch {
      return false;
    }
  }

  function delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
})();
