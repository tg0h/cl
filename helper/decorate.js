import { formatDate } from "./time.js";
import chalk from "chalk";

function decorate(logEvents) {
  // logEvent.eventId
  // logEvent.ingestionTime
  // logEvent.logStreamName
  // logEvent.timestamp

  return logEvents.map((logEvent) => {
    let messageObject;
    try {
      messageObject = JSON.parse(logEvent.message);
      messageObject.sgTime = formatDate(logEvent.timestamp);
      logEvent.message = JSON.stringify(messageObject);
    } catch (e) {
      // not json
    }

    return logEvent;
  });
}

export { decorate };
