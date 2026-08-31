const webpush = require("web-push");
const { getState } = require("./_gist");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  try {
    const state = await getState();
    if (!state.subscription) return res.status(400).json({ error: "no subscription yet" });

    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:ziv@example.com",
      process.env.VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY
    );

    const payload = JSON.stringify({
      title: "🌸 בדיקה מוצלחת!",
      body: "ההתראות מחוברות ועובדות. יאללה לריצה 🏃‍♀️",
      date: null
    });

    await webpush.sendNotification(state.subscription, payload);
    res.status(200).json({ ok: true });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
