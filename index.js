#!/usr/bin/env node

import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import { run } from "./helper/cwClient.js";
import { convertDate } from "./helper/time.js";
import { decorate } from "./helper/decorate.js";
import { format } from "./helper/format.js";

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
          describe:
            "cloudwatch log name to get aoeu aoenuho\n aoeuaoeu aoeuthhusnthaoeu \n",
          type: "string",
        })
        .positional("pattern", {
          describe: "regex pattern to filter logs by",
        });
    },
    async (argv) => {
      // console.log('is this argv',argv)
      // console.log('argv log name',argv.logName)
      let result = await run(argv);

      let options = { prefixSgTime: argv.prefixSgTime };
      result = decorate(result);
      format(result, options);
    },
  )
  .option("s", {
    alias: "start",
    describe: "start parameter",
  })
  .option("e", {
    alias: "end",
  })
  .option("r", {
    alias: "range",
  })
  .option("prefixSgTime", {
    alias: "p",
    type: "boolean",
    default: false,
  }).argv;

// run()
