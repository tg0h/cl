import { convertDate, formatDate } from "./time.js";
import { DateTime } from "luxon";

import {
  CloudWatchLogsClient,
  GetLogEventsCommand,
  FilterLogEventsCommand,
  paginateFilterLogEvents,
} from "@aws-sdk/client-cloudwatch-logs"; // ES Modules import

let run = async function (argv) {
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

  let start = argv.start ? convertDate(argv.start) : defaultStart;
  let end = argv.end ? convertDate(argv.end) : Date.now();
  let filterPattern = argv.pattern;
  console.log("filter pattern is", filterPattern);
  console.log("start", formatDate(start));
  console.log("end", formatDate(end));
  let input = {
    logGroupName: argv.logName,
    startTime: start,
    endTime: end,
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

export { run };
