// Keka Auto Clock - content script
// Triggered by opening a URL like:
//   https://houseofbluebeans.keka.com/?kekaAction=clockin#/me/attendance/logs
//   https://houseofbluebeans.keka.com/?kekaAction=clockout#/me/attendance/logs
// Reads the action from the query string, waits for the real Keka attendance
// button to render (Angular SPA, async), checks its CURRENT text before
// clicking so it never double-punches if already in the desired state.

(function () {
  const params = new URLSearchParams(window.location.search);
  const wantedAction = params.get("kekaAction"); // "clockin" | "clockout" | null

  if (!wantedAction) return; // opened normally, do nothing

  const maxWaitMs = 15000;
  const pollMs = 500;
  let waited = 0;

  function tryClick() {
    const container = document.querySelector("employee-attendance-request-actions");
    const btn = container && container.querySelector("button");

    if (!btn) {
      waited += pollMs;
      if (waited < maxWaitMs) {
        setTimeout(tryClick, pollMs);
      } else {
        console.warn("[keka-auto-clock] button never appeared, giving up");
      }
      return;
    }

    const text = btn.innerText.trim().toLowerCase();

    if (wantedAction === "clockin" && text.includes("clock-in")) {
      btn.click();
      console.log("[keka-auto-clock] clocked in");
    } else if (wantedAction === "clockout" && text.includes("clock-out")) {
      btn.click();
      console.log("[keka-auto-clock] clocked out");
    } else {
      console.log(
        "[keka-auto-clock] no-op — button already shows: " + btn.innerText
      );
    }
  }

  // give the Angular app a moment to mount before first check
  setTimeout(tryClick, 1000);
})();
