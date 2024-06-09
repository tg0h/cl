import { formatDate } from "./time.js";
import chalk from "chalk";

function format(result, { prefixSgTime }) {
  // row.eventId
  // row.ingestionTime
  // row.logStreamName
  // row.timestamp

  result.forEach((row) => {
    // console.log(formatDate(row.timestamp), row.message);
    let t = formatDate(row.timestamp);
    // console.log('t',chalk.green(t))
    if (prefixSgTime) {
      console.log(chalk.green(t), row.message);
    } else {
      console.log(row.message);
    }
  });
}

export { format };
