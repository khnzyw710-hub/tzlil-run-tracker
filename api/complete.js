const { getState, saveState } = require("./_gist");
const { israelNow } = require("./_time");

module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ error: "method not allowed" });

  try {
    const body = req.body || {};
    const { dateKey } = israelNow();
    const date = body.date && /^\d{4}-\d{2}-\d{2}$/.test(body.date) ? body.date : dateKey;

    const state = await getState();
    const wasSet = !!state.completions[date];
    if (wasSet) {
      delete state.completions[date]; // toggle off
    } else {
      state.completions[date] = new Date().toISOString();
    }
    await saveState(state);

    res.status(200).json({ ok: true, date, completed: !wasSet });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
