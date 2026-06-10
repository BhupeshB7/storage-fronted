import moment from "moment-timezone";

const TZ = "Asia/Kolkata";

/* ---------- Force numeric relative time ---------- */
moment.updateLocale("en", {
  relativeTime: {
    future: "in %s",
    past: "%s ago",
    s: "%d sec",
    ss: "%d sec",
    m: "1 min",
    mm: "%d min",
    h: "1 hour",
    hh: "%d hours",
    d: "1 day",
    dd: "%d days",
    M: "1 month",
    MM: "%d months",
    y: "1 year",
    yy: "%d years",
  },
});

/* ---------- Main formatter ---------- */
export const formatDateTime = (date, type) => {
  const m = moment(date).tz(TZ);

  if (!m.isValid()) return "";

  switch (type) {
    case "ago":
      return m.fromNow();

    case "datetime":
      return m.format("DD MMM YYYY, hh:mm A");

    case "date":
      return m.format("DD MMM YYYY");

    case "time":
      return m.format("hh:mm A");

    default:
      return "";
  }
};

/* ---------- Optional smart format ---------- */
export const smartDateFormat = (date) => {
  const m = moment(date).tz(TZ);
  const now = moment().tz(TZ);

  if (!m.isValid()) return "";

  if (now.diff(m, "hours") < 24) {
    return m.fromNow();
  }

  if (now.diff(m, "days") < 7) {
    return m.format("ddd, hh:mm A");
  }

  return m.format("DD MMM YYYY");
};
