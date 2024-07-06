#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { run, buildRunOptions } from "./helper/cwClient.js";
import { convertDate } from "./helper/time.js";
import { decorate } from "./helper/decorate.js";
import { rewrite } from "./helper/rewrite.js";
import { format, buildFormatOptions } from "./helper/format.js";

let argv = yargs(hideBin(process.argv))
  .usage("$0 <logName> [pattern] [options]")
  // arrow brackets indicate that logname is mandatory, running cl without
  // the logName then runs the help automatically
  .command(
    "$0 <logName> [pattern]",
    "search cloudwatch logs",
    (yargs) => {
      yargs
        .positional("logName", {
          describe: "cloudwatch log name to get",
          type: "string",
        })
        .positional("pattern", {
          describe: "regex pattern to filter logs by",
        });
    },
    async (argv) => {
      if (argv.debug) console.log("timg argv", argv);

      let result = await run(buildRunOptions(argv));

      result = rewrite(result, { rewrite: argv.rewrite }); // rewrite text log level to number log level so that pino pretty can filter zzzz
      result = decorate(result, { decorate: argv.decorate });

      format(result, buildFormatOptions(argv));
    },
  )
  .option("s", {
    alias: "start",
    describe: "start parameter",
  })
  .option("e", {
    alias: "end",
  })
  .option("debug", {
    alias: "d",
    describe: "show debug logs",
  })
  .option("messageFilter", {
    alias: "m",
    type: "string",
    describe: "filter by log msg",
  })
  .option("filters", {
    alias: "f",
    type: "string",
    describe:
      "this filter is case sensitive. cloudwatch json filters to filter logs by specify k=v pairs eg -f req.method=POST -f number=30 -f boolean=true",
  })
  .option("l", {
    alias: "logLevel",
    type: "string",
    choices: ["f", "e", "w", "i", "d", "t"],
    default: "i",
    describe:
      "minimum log level to print (f) fatal, (e) error, (w) warn, (i) info, (d) debug, (t) trace",
  })
  .option("hideObject", {
    alias: "H",
    type: "boolean",
    default: false,
    describe: "do not show log body if not an error",
  })
  .option("S", {
    alias: "singleLine",
    type: "boolean",
    default: false,
    describe: "print log messages in a single line",
  })
  .option("r", {
    alias: "rewrite",
    default: true,
    describe:
      "rewrite text log level of eg '' to number log level of eg 40 so that pino pretty can filter the log level later",
  })
  .option("prettify", {
    alias: "p",
    describe: "prettify log with pino pretty",
  })
  .option("decorate", {
    default: true,
    type: "boolean",
    describe:
      "add sg time to the log body (convert the timestamp of the cloudwatch log event)",
  })
  .option("prefixSgTime", {
    type: "boolean",
    describe: "add sg time as a header to the log",
    default: false,
  }).argv;

// run()
