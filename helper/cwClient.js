import { convertDate, formatDate } from "./time.js";
import { DateTime } from "luxon";

import {
  CloudWatchLogsClient,
  GetLogEventsCommand,
  FilterLogEventsCommand,
  paginateFilterLogEvents,
} from "@aws-sdk/client-cloudwatch-logs"; // ES Modules import

function buildFilter({ pattern }) {
  return pattern;
}
function buildRunOptions(argv) {
  const filterPattern = buildFilter({ pattern: argv.pattern });

  return {
    start: argv.start,
    end: argv.end,
    filterPattern,
    logName: argv.logName,
  };
}

let run = async function ({ start, end, filterPattern, logName }) {
  // const client = new CloudWatchLogsClient({region: "ap-southeast-1"});
  // do not specify a region, depend on the AWS_DEFAULT_REGION specified in the environment?
  // const client = new CloudWatchLogsClient({ region: "us-west-2" });
  const client = new CloudWatchLogsClient();

  const paginatorConfig = {
    client,
    // pageSize: 25
  };

  const results = [];

  // 1 hour ago
  let defaultStart = Date.now() - 10 * 60 * 1000;

  let _start = start ? convertDate(start) : defaultStart;
  let _end = end ? convertDate(end) : Date.now();
  console.log("filter pattern is", filterPattern);
  console.log("start", formatDate(_start));
  console.log("end", formatDate(_end));
  let input = {
    logGroupName: logName,
    startTime: _start,
    endTime: _end,
  };

  if (filterPattern) {
    if (typeof filterPattern == "number") {
      filterPattern = filterPattern.toString();
    }
    input.filterPattern = filterPattern;
  }

  const paginator = paginateFilterLogEvents(paginatorConfig, input);

  let i = 1;
  for await (const page of paginator) {
    i++;
    // page contains a single paginated output.
    results.push(...page.events);
    // console.log('this is a ',page)
  }
  return results;
};

export { run, buildRunOptions };
