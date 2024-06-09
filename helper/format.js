import { formatDate } from "./time.js";
import { prettyFactory } from "pino-pretty";
import chalk from "chalk";

function format(logEvents, { prefixSgTime, prettify }) {
  // logEvent.eventId
  // logEvent.ingestionTime
  // logEvent.logStreamName
  // logEvent.timestamp

  // provide cli options to prettyFactory if needed
  const pretty = prettyFactory();

  logEvents.forEach((logEvent) => {
    if (prettify) {
      const prettyRow = pretty(logEvent.message);
      console.log(prettyRow);
    } else if (prefixSgTime) {
      let sgDateTime = formatDate(logEvent.timestamp);
      console.log(chalk.green(sgDateTime), logEvent.message);
    } else {
      // plain
      console.log(logEvent.message);
    }
  });
}

export { format };
