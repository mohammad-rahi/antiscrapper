/**
 * ==============================
 * Constants and Initial State
 * ==============================
 */

/**
 * Represents the state of user interactions on the page.
 * @typedef {Object} State
 * @property {boolean} mouseMoved - Flag indicating if the mouse has moved since page load.
 * @property {number} lastMoveTime - Timestamp of the last mouse movement.
 * @property {Object} lastPosition - The last recorded mouse coordinates.
 * @property {number} linearMovements - Tracks continuous linear mouse movements.
 * @property {Object} interactions - Logs of different interaction types.
 * @property {number} lastButtonClickTime - Timestamp of the last button click.
 * @property {Array} clickSequence - Sequence of clicked element IDs.
 * @property {number} lastFormInteractionTime - Timestamp of the last form element interaction.
 * @property {number} lastScrollTime - Timestamp of the last page scroll.
 * @property {number} lastKeyDownTime - Timestamp of the last keydown action.
 * @property {string} lastKeyPressed - Last key that was pressed.
 * @property {number} repetitiveKeyPressCount - Counts consecutive same key presses.
 * @property {number} sessionStartTime - Timestamp marking the beginning of the user's session.
 */

const STATE = {
  mouseMoved: false,
  lastMoveTime: 0,
  lastPosition: { x: 0, y: 0 },
  linearMovements: 0,
  lastHoverTime: 0,
  lastButtonClickTime: 0,
  clickSequence: [],
  lastFormInteractionTime: 0,
  lastScrollTime: 0,
  lastKeyDownTime: 0,
  lastKeyPressed: "",
  repetitiveKeyPressCount: 0,
  sessionStartTime: Date.now(),
  botScore: 0,
};

const CONFIG = {
  rapidMovementThreshold: 50,
  linearMovementThreshold: 20,
  rapidInteractionThreshold: 500,
  botScoreThreshold: 10,
  sessionLengthCheckInterval: 5000,
  decreaseBotScoreInterval: 60000,
  rapidHoverThreshold: 500,
  repetitiveKeyPressThreshold: 5,
};

const SUSPICIOUS_USER_AGENTS = [
  // Add suspicious or default user agents here.
];

/**
 * ==============================
 * Bot Detection Utility
 * ==============================
 */

class BotUtility {
  static logPossibleBot(reason, scoreIncrement = 1) {
    STATE.botScore += scoreIncrement;
    if (STATE.botScore >= CONFIG.botScoreThreshold) {
      console.log(`Possible bot detected: ${reason}`);
      this.triggerBotAction();
    }
  }

  static triggerBotAction() {
    /* ... */
  }
}

/**
 * ==============================
 * Mouse-related Bot Detection
 * ==============================
 */

class MouseBotDetectors {
  static detectRapidMovement(e) {
    const timeSinceLastMove = Date.now() - STATE.lastMoveTime;
    if (timeSinceLastMove < CONFIG.rapidMovementThreshold) {
      BotUtility.logPossibleBot("Very rapid mouse movement.", 2);
    }
    STATE.lastMoveTime = Date.now();
  }

  static detectLinearPaths(e) {
    const isLinearMovement =
      Math.abs(e.clientX - STATE.lastPosition.x) < 2 ||
      Math.abs(e.clientY - STATE.lastPosition.y) < 2;

    STATE.linearMovements = isLinearMovement ? STATE.linearMovements + 1 : 0;

    if (STATE.linearMovements > CONFIG.linearMovementThreshold) {
      BotUtility.logPossibleBot("Extended linear mouse movement.");
    }
    STATE.lastPosition = { x: e.clientX, y: e.clientY };
  }

  static detectRapidHover(e) {
    if (e.target.classList.contains("clickable")) {
      const timeSinceLastHover =
        Date.now() - (STATE.interactions.lastHover || 0);
      if (timeSinceLastHover < CONFIG.rapidInteractionThreshold) {
        BotUtility.logPossibleBot("Rapid hovering over clickable elements.", 3);
      }
      STATE.interactions.lastHover = Date.now();
    }
  }
}

/**
 * ==============================
 * Other Bot Detection Methods
 * ==============================
 */

class GeneralBotDetectors {
  static detectRepetitiveKeyPress(e) {
    const lastKey = STATE.interactions.lastKeyPressed || "";
    STATE.interactions.lastKeyPressed = e.key;

    if (lastKey === e.key) {
      const keyPressCount =
        (STATE.interactions.repetitiveKeyPressCount || 0) + 1;
      STATE.interactions.repetitiveKeyPressCount = keyPressCount;

      if (keyPressCount > CONFIG.repetitiveKeyPressThreshold) {
        BotUtility.logPossibleBot("Repetitive key presses detected.");
      }
    } else {
      STATE.interactions.repetitiveKeyPressCount = 0;
    }
  }

  static detectHiddenElementInteraction(e) {
    if (
      e.target.classList.contains("hidden-element") ||
      e.target.classList.contains("hidden-input")
    ) {
      BotUtility.logPossibleBot("Interaction with a hidden element.");
    }
  }

  static detectSuspiciousUserAgent() {
    if (SUSPICIOUS_USER_AGENTS.includes(navigator.userAgent)) {
      BotUtility.logPossibleBot("Suspicious user agent detected.");
    }
  }

  static detectSessionLength() {
    const sessionDuration = Date.now() - STATE.sessionStartTime;
    if (sessionDuration < 5000 || sessionDuration > 3600000) {
      BotUtility.logPossibleBot("Suspicious session length detected.");
    }
  }
}

/**
 * ==============================
 * Event Handlers
 * ==============================
 */

const EventHandlers = {
  handleMouseMove(e) {
    STATE.mouseMoved = true;
    MouseBotDetectors.detectRapidMovement(e);
    MouseBotDetectors.detectLinearPaths(e);
  },

  handleClick(e) {
    const currentTime = Date.now();
    if (
      currentTime - STATE.lastButtonClickTime <
      CONFIG.rapidInteractionThreshold
    ) {
      BotDetectors.logPossibleBot("Rapid interaction.");
    }
    STATE.lastButtonClickTime = currentTime;
  },

  handleFormChange(e) {
    const currentTime = Date.now();
    if (
      currentTime - STATE.lastFormInteractionTime <
      CONFIG.rapidInteractionThreshold
    ) {
      BotDetectors.logPossibleBot("Rapid form interaction.");
    }
    STATE.lastFormInteractionTime = currentTime;
  },

  handleScroll() {
    const currentTime = Date.now();
    if (currentTime - STATE.lastScrollTime < CONFIG.rapidInteractionThreshold) {
      BotDetectors.logPossibleBot("Rapid scrolling detected.");
    }
    STATE.lastScrollTime = currentTime;
  },

  handleKeyDown(e) {
    BotDetectors.detectRepetitiveKeyPress(e);
  },

  handleElementInteraction(e) {
    BotDetectors.detectHiddenElementInteraction(e);
  },

  handleHover(e) {
    MouseBotDetectors.detectRapidHover(e);
  },
};

/**
 * ==============================
 * Initialization & Utility Functions
 * ==============================
 */

async function getFingerprint() {
  const fp = await FingerprintJS.load();
  const result = await fp.get();
  return result.visitorId;
}

function sendDataWithFingerprint(fingerprint) {
  const apiEndpoint = "http://localhost:3000/api/antiscrapper";

  fetch(apiEndpoint, {
    mode: "no-cors",
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      fingerprint: fingerprint,
      test: "test",
    }),
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("API request failed");
      }
      return response.json();
    })
    .then((responseData) => {
      console.log("API request successful");
      console.log("Server response:", responseData);
    })
    .catch((error) => {
      console.error("API request error:", error);
    });
}

async function checkBotWithFingerprint() {
  const fingerprint = await getFingerprint();

  // Check the fingerprint against a list of known bot fingerprints (if you maintain such a list)
  const knownBotFingerprints = []; // Add known bot fingerprints here

  if (knownBotFingerprints.includes(fingerprint)) {
    BotUtility.logPossibleBot("Matching known bot fingerprint detected.");
  }

  // You can also send this fingerprint to your server for further analysis or logging
  sendDataWithFingerprint(fingerprint);
}

function registerEvents() {
  document.addEventListener("mousemove", (e) => {
    STATE.mouseMoved = true;
    MouseBotDetectors.detectRapidMovement(e);
    MouseBotDetectors.detectLinearPaths(e);
  });

  document.addEventListener("mouseover", MouseBotDetectors.detectRapidHover);
  document.addEventListener(
    "click",
    GeneralBotDetectors.detectHiddenElementInteraction
  );
  document.addEventListener(
    "keydown",
    GeneralBotDetectors.detectRepetitiveKeyPress
  );

  const forms = document.querySelectorAll("input,textarea,select");
  forms.forEach((formElement) => {
    formElement.addEventListener("change", (e) => {
      const lastInteraction = STATE.interactions.lastFormInteraction || 0;
      const currentTime = Date.now();

      if (currentTime - lastInteraction < CONFIG.rapidInteractionThreshold) {
        BotUtility.logPossibleBot("Rapid form interaction.");
      }
      STATE.interactions.lastFormInteraction = currentTime;
    });
  });
}

function initPeriodicChecks() {
  setInterval(() => {
    if (!STATE.mouseMoved) {
      BotUtility.logPossibleBot("No mouse movement detected after page load.");
    }
  }, CONFIG.sessionLengthCheckInterval);

  setInterval(() => {
    if (STATE.botScore > 0) STATE.botScore--;
  }, CONFIG.decreaseBotScoreInterval);

  setInterval(
    GeneralBotDetectors.detectSessionLength,
    CONFIG.sessionLengthCheckInterval
  );
}

function createHoneypotElement() {
  const input = document.createElement("input");
  input.setAttribute("type", "text");
  input.setAttribute("name", "honeypot");
  input.setAttribute("value", "");
  input.style.visibility = "hidden";
  input.style.position = "absolute";
  input.style.top = "-10000px";
  input.classList.add("hidden-input"); // Class already used in your bot detectors
  document.body.appendChild(input);
}

function loadFingerprintJSScript(callback) {
  const script = document.createElement("script");
  script.onload = callback;
  script.src = "https://cdn.jsdelivr.net/npm/@fingerprintjs/fingerprintjs@3";
  document.body.appendChild(script);
}

function init() {
  registerEvents();
  GeneralBotDetectors.detectSuspiciousUserAgent();
  initPeriodicChecks();
  createHoneypotElement();
  checkBotWithFingerprint();
}

/** Main initialization */
loadFingerprintJSScript(init);
