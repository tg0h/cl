import moment from "moment";

function getStartEnd(start, end) {
  //adds a default start date of today 0000H to the dyanamodb param if no --start param is given

  let startTs = convertDate(start);

  if (argv.end) {
    let endTs = convertDate(end);
  }
  return { startTs, endTs };
}

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

let convertDate = function convertDate(dateParam, returnMoment) {
  //receives a time string and converts to epoch ts

  //if receive 5m, convert to epoch time 5 minutes ago
  //if receive 5d, convert to epoch time 5 days ago
  //if receive 5h, convert to epoch time 5 hours ago
  //if receive 0cw, return this week's monday
  //if receive 1cw, return last week's monday
  const Mwdhm = /(^\d+)(cm|cw|[wdhm]$)/; //only matches h(ours) d(ays) m(inutes) or cw (calendar week)

  //if receive w2, return this year's week 2's monday
  //if receive 21w2, return year 2021 week 2's monday
  const yearWeekN = /(\d{2})?w(\d{1,2})$/; // matches w1, w23, 21w1, 19w23 (year 2019, week 23)
  const today = /^today$/;
  const d2 = /(^\d{1,2})$/; //specify day only
  const d4 = /(^\d{1,2})(\d{2})$/; //specify day and month
  const d6 = /(^\d{1,2})(\d{2})(\d{2})$/; //specify day, month and year eg 140183 - 14 Jan 1983
  const d8 = /^(\d{1,2})(\d{2})?T(\d{1,2})(\d{2})?$/; //specify day, month, hour and min (optional) TODO: combine d2, d4 regex into d8 - problem: lazy match daypart
  const d10 = /^(\d{1,2})(\d{2})?T(\d{1,2})(\d{2})(\d{2})?$/;
  // eg 19T12 - 19th of this month, 12pm
  // eg 19T23 - 19th of this month, 11pm
  // eg 19T1 - 19th of this month, 11pm
  const t4 = /^T?(\d{1,2})(\d{2})?H?$/; //specify hour

  let t;
  // let groups = date.match(regex)
  let date = String(dateParam);
  let groups;
  if ((groups = date.match(Mwdhm))) {
    let amount = groups[1];
    let unit = groups[2]; //hacky way to get environment
    switch (unit) {
      case "m":
        t = moment().subtract(amount, "minutes");
        break;
      case "h":
        t = moment().subtract(amount, "hours");
        break;
      case "d":
        t = moment().subtract(amount, "days");
        break;
      case "w":
        t = moment().subtract(amount, "weeks");
        break;
      case "cw":
        t = moment().startOf("isoWeek").subtract(amount, "weeks"); //amount can be 0
        break;
      case "cm":
        t = moment().startOf("month").subtract(amount, "month"); //amount can be 0
        break;
      case "M":
        t = moment().subtract(amount, "months");
        break;
      default:
        break;
    }
  } else if ((groups = date.match(today))) {
    //date is true when d
    t = moment().startOf("day");
  } else if ((groups = date.match(d2))) {
    let day = groups[1];
    t = moment(day, "DD"); //default to this month and year, default time to midnight 0000H
  } else if ((groups = date.match(d4))) {
    let day = groups[1];
    let month = Number(groups[2]) - 1; // months are zero indexed in moment.js zzz
    t = moment({ day: day, month: month });
  } else if ((groups = date.match(d6))) {
    let day = groups[1];
    let month = Number(groups[2]) - 1; // months are zero indexed in moment.js zzz
    let year = 2000 + Number(groups[3]);
    t = moment({ day: day, month: month, year: year });
  } else if ((groups = date.match(d8))) {
    let day = groups[1];
    let month = Number(groups[2]) - 1; // months are zero indexed in moment.js zzz
    let hour = groups[3];
    let min = groups[4];
    let dateConfig = { day: day };
    if (month >= 0 && month < 11) dateConfig.month = month;
    if (hour) dateConfig.hour = hour;
    if (min) dateConfig.minute = min;
    // verboseLog('moment dateConfig',dateConfig)
    t = moment(dateConfig);
  } else if ((groups = date.match(d10))) {
    let day = groups[1];
    let month = Number(groups[2]) - 1; // months are zero indexed in moment.js zzz
    let hour = groups[3];
    let min = groups[4];
    let sec = groups[5];
    let dateConfig = { day: day };
    if (month >= 0 && month < 11) dateConfig.month = month;
    if (hour) dateConfig.hour = hour;
    if (min) dateConfig.minute = min;
    if (sec) dateConfig.second = sec;
    // verboseLog('moment dateConfig',dateConfig)
    t = moment(dateConfig);
  } else if ((groups = date.match(t4))) {
    let hour = groups[1];
    let min = groups[2];
    let dateConfig = { hour: hour };
    if (min) {
      dateConfig.minute = min;
    }
    t = moment(dateConfig);
  } else if ((groups = date.match(yearWeekN))) {
    //if year is not defined, default to current year
    let year = groups[1]
      ? +"2000" + parseInt(groups[1])
      : new Date().getFullYear(); //?
    let week = groups[2];
    //note that the 1st iso week of a year is defined as the week that has the first thursday of the year
    t = moment().isoWeekYear(year).isoWeek(week).startOf("isoWeek"); //?
  }

  return parseInt(t.format("x"));
};

let convertRange = function convertRange(rangeParam) {
  //receives a range and returns a start and end moment
  //range comprises 2 parts - start and duration
  //1w1d -- 1 calendar week ago for duration of 1 day
  //1m1w -- 1 calendar month ago for duration of 1 week todo this might not make sense, eg 1 nov (eg wednesday) + 1 week ...
  //1mw -- 1 calendar month ago for duration of 1 week (if no duration number specified, assume 1 )
  //1m -- return 1st to last day of last month

  // w1 - week 1
  // w12123m - week is greedy, it reads up to 2 chars, this means w12 , add 123months
  // w1-21m - add a - delimiter to be explicity
  // w1-1w - add a - delimiter to be explicity

  //todo -
  // 20m1 -- the first month of year 2020
  //m1 -- the first month of the year
  //m12 -- the 12th month of the year

  let t;
  // let groups = date.match(regex)
  let range = String(rangeParam);

  // const rangeRegex = /(^\d+)([mw])(\d*)([mw]?)$/ //only matches h(ours) d(ays) m(inutes) or cw (calendar week)
  const rangeRegex =
    /(((?<start>\d+)(?<startUnit>[mw]))|((?<startIsoYear>\d{2})?(?<startIsoUnit>[wm])(?<startIso>\d{1,2})))-?(?<duration>\d*)(?<durationUnit>[mw]?)$/;
  if ((groups = range.match(rangeRegex)?.groups)) {
    let startLength = groups.start;
    let startUnit = groups.startUnit;
    let durationLength = groups.duration == "" ? 1 : groups.duration;

    let durationUnit = groups.durationUnit;
    if (durationUnit == "") {
      durationUnit = startUnit;
    }

    let currentYear = new Date().getFullYear();
    let startIsoYear = groups.startIsoYear
      ? 2000 + parseInt(groups.startIsoYear)
      : currentYear;
    let startIso = groups.startIso;
    let startIsoUnit = groups.startIsoUnit;
    let start, end;
    if (groups.startIso) {
      switch (startIsoUnit) {
        case "w":
          start = moment()
            .isoWeekYear(startIsoYear)
            .isoWeek(startIso)
            .startOf("isoWeek");
          break;
        case "m":
          //moment uses 0 based months
          start = moment()
            .isoWeekYear(startIsoYear)
            .month(startIso - 1)
            .startOf("month");
          break;
      }
    } else {
      switch (startUnit) {
        case "w":
          start = moment().startOf("isoWeek").subtract(startLength, "weeks");
          break;
        case "m":
          start = moment().subtract(startLength, "months").date(1);
          break;
        default:
          break;
      }
    }
    switch (durationUnit) {
      case "w":
        end = start.clone().add(durationLength, "weeks").subtract(1, "day");
        break;
      case "m":
        end = start.clone().add(durationLength, "months").subtract(1, "day");
        break;
      default:
        break;
    }
    t = {
      start,
      end,
    };
  }

  return t;
};

export { convertDate, convertRange, formatDate };
