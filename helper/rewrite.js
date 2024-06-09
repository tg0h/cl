import { formatDate } from "./time.js";
import chalk from "chalk";

const LEVEL_NAMES = {
  fatal: 60,
  error: 50,
  warn: 40,
  info: 30,
  debug: 20,
  trace: 10,
};

function rewrite(logEvents, { rewrite }) {
  // logEvent.eventId
  // logEvent.ingestionTime
  // logEvent.logStreamName
  // logEvent.timestamp

  return logEvents.map((logEvent) => {
    if (rewrite) {
      let messageObject;
      try {
        messageObject = JSON.parse(logEvent.message);
        if (messageObject.level && typeof messageObject.level === "string") {
          messageObject._level = messageObject.level;
          messageObject.level = LEVEL_NAMES[messageObject.level];
        }
        logEvent.message = JSON.stringify(messageObject);
      } catch (e) {
        // not json
      }
    }

    return logEvent;
  });
}

export { rewrite };
