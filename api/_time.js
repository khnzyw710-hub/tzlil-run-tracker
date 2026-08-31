const TZ = "Asia/Jerusalem";
const WEEKDAY_INDEX = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };

function israelNow(date = new Date()) {
  const dateFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit"
  });
  const timeFmt = new Intl.DateTimeFormat("en-US", {
    timeZone: TZ, weekday: "short", hour: "2-digit", minute: "2-digit", hour12: false
  });

  const dateKey = dateFmt.format(date); // YYYY-MM-DD
  const parts = timeFmt.formatToParts(date);
  const get = (t) => parts.find((p) => p.type === t)?.value;
  const weekdayShort = get("weekday");
  let hour = get("hour");
  const minute = get("minute");
  if (hour === "24") hour = "00";

  return {
    dateKey,
    weekday: WEEKDAY_INDEX[weekdayShort],
    hhmm: hour + ":" + minute
  };
}

function hhmmToMinutes(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
}

module.exports = { israelNow, hhmmToMinutes, TZ };
