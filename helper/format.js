import { formatDate } from "./time.js";
import { prettyFactory } from "pino-pretty";
import chalk from "chalk";

function buildFormatOptions(argv) {
  let minimumLevel;
  if (argv.logLevel) {
    switch (argv.logLevel) {
      case "f":
        minimumLevel = "fatal";
        break;
      case "e":
        minimumLevel = "error";
        break;
      case "w":
        minimumLevel = "warn";
        break;
      case "i":
        minimumLevel = "info";
        break;
      case "d":
        minimumLevel = "debug";
        break;
      case "t":
        minimumLevel = "trace";
        break;
      default:
        minimumLevel = "debug";
        break;
    }
  }

  return {
    prefixSgTime: argv.prefixSgTime,
    prettify: argv.prettify,
    singleLine: argv.singleLine,
    minimumLevel,
    hideObject: argv.hideObject,
  };
}

function format(
  logEvents,
  { prefixSgTime, prettify, minimumLevel, singleLine, hideObject },
) {
  // logEvent.eventId
  // logEvent.ingestionTime
  // logEvent.logStreamName
  // logEvent.timestamp

  // provide cli options to prettyFactory if needed
  // const opts = buildPinoPrettyOpts();
  const pretty = prettyFactory({
    // useOnlyCustomProps: false,
    minimumLevel,
    // hideObject: true,
    // levelFirst: false,
    // levelKey: "level",
    singleLine,
    hideObject,
    customPrettifiers: {
      // see https://github.com/jorgebucaran/colorette?tab=readme-ov-file#supported-colors
      // for colors
      clientId: (id) => `${chalk.bgGreen.black(id)}`,
      campaignId: (id) => `${chalk.bgYellow.black(id)}`,
      contactId: (id) => `${chalk.hex("#ffa500")(id)}`,
      invoiceId: (id) => `${chalk.magenta(id)}`,
    },
    // include: "level,time",
  });

  logEvents.forEach((logEvent) => {
    if (prettify) {
      const prettyRow = pretty(logEvent.message);
      if (prettyRow) {
        console.log(prettyRow);
      }
    } else if (prefixSgTime) {
      let sgDateTime = formatDate(logEvent.timestamp);
      console.log(chalk.green(sgDateTime), logEvent.message);
    } else {
      // plain
      console.log(logEvent.message);
    }
  });
}

export { format, buildFormatOptions };
