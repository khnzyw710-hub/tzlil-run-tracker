const webpush = require("web-push");
const { getState, saveState } = require("./_gist");
const { israelNow, hhmmToMinutes } = require("./_time");

const MESSAGES = [
  { title: "🏃‍♀️ זמן לרוץ, צליל!", body: "יאללה, יציאה לריצה 🌸 גם 15 דקות זה ניצחון." },
  { title: "🌷 תזכורת קטנה", body: "עדיין לא יצאת לריצה היום? עכשיו זה זמן מעולה." },
  { title: "💗 בואי נזוז", body: "הנעליים מחכות. יציאה קצרה לריצה?" },
  { title: "🌸 היום יום ריצה", body: "סימנת שרצת? אם לא — עוד לא מאוחר 💪" },
  { title: "🏃‍♀️ תזכורת ריצה", body: "כמה דקות של ריצה יעשו לך טוב עכשיו 🌼" }
];

module.exports = async (req, res) => {
  const key = req.query?.key || (req.body && req.body.key);
  if (!process.env.CRON_SECRET || key !== process.env.CRON_SECRET) {
    return res.status(401).json({ error: "unauthorized" });
  }

  try {
    const state = await getState();
    const { settings, subscription, completions, lastNotified } = state;

    if (!subscription) return res.status(200).json({ sent: false, reason: "no subscription" });
    if (!settings.enabled) return res.status(200).json({ sent: false, reason: "disabled" });

    const { dateKey, weekday, hhmm } = israelNow();

    if (!settings.days.includes(weekday)) {
      return res.status(200).json({ sent: false, reason: "not a run day" });
    }
    if (completions[dateKey]) {
      return res.status(200).json({ sent: false, reason: "already completed today" });
    }

    const nowMin = hhmmToMinutes(hhmm);
    const startMin = hhmmToMinutes(settings.startTime);
    const endMin = hhmmToMinutes(settings.endTime);
    if (nowMin < startMin || nowMin > endMin) {
      return res.status(200).json({ sent: false, reason: "outside window" });
    }

    const last = lastNotified[dateKey];
    if (last) {
      const elapsedMin = (Date.now() - new Date(last).getTime()) / 60000;
      if (elapsedMin < settings.intervalMin) {
        return res.status(200).json({ sent: false, reason: "too soon", elapsedMin: Math.round(elapsedMin) });
      }
    }

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:ziv@example.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const isFirst = !last;
    const msg = isFirst ? MESSAGES[0] : MESSAGES[1 + Math.floor(Math.random() * (MESSAGES.length - 1))];

    const payload = JSON.stringify({ title: msg.title, body: msg.body, date: dateKey });

    try {
      await webpush.sendNotification(subscription, payload);
    } catch (pushErr) {
      if (pushErr.statusCode === 404 || pushErr.statusCode === 410) {
        state.subscription = null;
        await saveState(state);
        return res.status(200).json({ sent: false, reason: "subscription expired, cleared" });
      }
      throw pushErr;
    }

    state.lastNotified[dateKey] = new Date().toISOString();
    await saveState(state);

    res.status(200).json({ sent: true, dateKey, hhmm });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
