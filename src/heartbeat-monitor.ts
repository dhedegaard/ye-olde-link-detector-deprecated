/** 10 minutes */
const TIMEOUT = 10 * 60 * 1_000;

/**
 * Called whenever a heartbeat is received.
 *
 * If more than 10 minutes go by without a heartbeat, then the connection is
 * considered lost.
 */
export const heartbeatReceived = () => {
  console.log("heartbeat received");
  // If there's an old countdown to timeout, clear it.
  if (handle != null) {
    clearTimeout(handle);
  }
  // Start a new timer from now.
  handle = setTimeout(() => {
    // If we hit the timeout, then we're disconnected. Crash loudly.
    console.error(
      `No heartbeat received for ${TIMEOUT} milliseconds. Crashing the process.`
    );
    Deno.exit(1);
  }, TIMEOUT);
};

let handle: number | undefined;
