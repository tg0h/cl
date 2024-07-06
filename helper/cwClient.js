import { formatDate } from "./time.js";
import { parse } from "parsetime";

import {
  CloudWatchLogsClient,
  GetLogEventsCommand,
  FilterLogEventsCommand,
  paginateFilterLogEvents,
} from "@aws-sdk/client-cloudwatch-logs"; // ES Modules import

function splitKvFilterOption(filterOption) {
  let [key, _value] = filterOption.split("=");
  // console.log("timg 🚀 key", key);
  // console.log("timg 🚀 _value", _value);

  let value;
  let operator = "=";
  let numberValue = Number.parseInt(_value);
  if (numberValue) {
    // number
    value = numberValue;
  } else if (_value === "true" || _value === "false") {
    // boolean
    value = _value;
    operator = "is";
  } else {
    // string
    value = `"${_value}"`;
  }

  return `( $.${key} ${operator} ${value} )`;
}

function buildFilter({ pattern, filters, messageFilter, showBugs }) {
  let filterPatterns;

  let positionalFilter, argFilter, _argFilter;
  if (pattern) {
    // positional argument
    let numberValue = Number.parseInt(pattern);
    if (numberValue) {
      positionalFilter = `${numberValue}`;
    } else {
      positionalFilter = `"${pattern}"`;
    }
  } else if (filters || messageFilter || showBugs) {
    // cannot mix regex and json filter patterns, so use else if
    // -f option
    // json filters are surrounded by { }, eg { $.eventType =}
    if (filters && typeof filters === "string") {
      _argFilter = [filters].map((filter) => {
        return splitKvFilterOption(filter);
      });
    } else if (filters && Array.isArray(filters)) {
      _argFilter = filters.map((filter) => {
        return splitKvFilterOption(filter);
      });
    }

    // argFilter are the previous dynamic -f filters eg -f level=30 -f ... etc
    if (messageFilter) {
      const messageFilterArgs = []
        .concat(messageFilter)
        .map((f) => {
          return `( $.msg="*${f}*" )`;
        })
        .join(" || ");

      // console.log("messageFilterArgs", `( ${messageFilterArgs} )`);
      _argFilter = (_argFilter ?? []).concat(`( ${messageFilterArgs} )`);
    }

    if (showBugs) {
      _argFilter = (_argFilter ?? []).concat(`( $.level = "error" )`);
    }

    argFilter = `{ ${_argFilter.join(" && ")} }`;
  }
  return positionalFilter ?? argFilter;
}

function buildRunOptions(argv) {
  const filterPattern = buildFilter({
    pattern: argv.pattern,
    filters: argv.filters,
    messageFilter: argv.messageFilter,
    showBugs: argv.showBugs, // filter logs with $.level = "error"
  });

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

  let _start = start ? parse(start) : defaultStart;
  let _end = end ? parse(end) : Date.now();
  console.log("filter pattern is", filterPattern);
  console.log("start", formatDate(_start));
  console.log("end", formatDate(_end));
  let input = {
    logGroupName: logName,
    startTime: _start,
    endTime: _end,
  };

  if (filterPattern) {
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
