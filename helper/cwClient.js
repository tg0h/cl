import {convertDate,formatDate} from './time.js'
import {DateTime} from 'luxon'


import {
    CloudWatchLogsClient,
    GetLogEventsCommand,
    FilterLogEventsCommand,
    paginateFilterLogEvents
} from "@aws-sdk/client-cloudwatch-logs"; // ES Modules import

const client = new CloudWatchLogsClient({region: "ap-southeast-1"});

const paginatorConfig = {
    client,
    // pageSize: 25
}

const results = []

let run = async function (argv) {

    // 1 hour ago
    let defaultStart = Date.now() - 10 * 60 * 1000

    let start = argv.start ? convertDate(argv.start) : defaultStart
    let end = argv.end ? convertDate(argv.end) : Date.now()
    console.log('start', formatDate(start))
    console.log('end', formatDate(end))
    let input = {
        logGroupName: argv.logName,
        startTime: start,
        endTime: end
    }

    const paginator = paginateFilterLogEvents(paginatorConfig, input);

    let i = 1
    for await (const page of paginator) {
        i++
        // page contains a single paginated output.
        results.push(...page.events);
        // console.log('this is a ',page)
    }
    return results
}

export {run}