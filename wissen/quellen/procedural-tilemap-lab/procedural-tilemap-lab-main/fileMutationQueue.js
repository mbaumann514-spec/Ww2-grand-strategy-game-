export function createKeyedMutationQueue() {
  const queues = new Map();

  return {
    async run(key, operation) {
      const normalizedKey = String(key);
      const previous = queues.get(normalizedKey) ?? Promise.resolve();
      const next = previous.catch(() => {}).then(operation);
      const cleanup = next.catch(() => {}).finally(() => {
        if (queues.get(normalizedKey) === cleanup) queues.delete(normalizedKey);
      });
      queues.set(normalizedKey, cleanup);
      return next;
    },
    pendingKeys() {
      return [...queues.keys()];
    },
  };
}
