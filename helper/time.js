import moment from "moment";
import { parse } from "parsetime";

function formatDate(date) {
  if (date && Number.isInteger(date)) {
    //only accept unix timestamp
    //accepts date string
    // return moment(date).format('ddd DD-MMM HH:mm:ss');
    // console.log('date',date)
    // return moment(date, "x").format('DD-MMM HH:mm:ss.SSS');
    return moment(date, "x").format("YYYY-MM-DD HH:mm:ss.SSS");
  } else {
    return date; //if undefined return nothing
  }
}

export { formatDate };
