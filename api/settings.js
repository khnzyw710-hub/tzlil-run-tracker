const { getState, saveState } = require("./_gist");

const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const state = await getState();
      return res.status(200).json({ settings: state.settings });
    }

    if (req.method === "POST") {
      const body = req.body || {};
      const days = Array.isArray(body.days) ? body.days.filter((d) => Number.isInteger(d) && d >= 0 && d <= 6) : null;
      const startTime = TIME_RE.test(body.startTime) ? body.startTime : null;
      const endTime = TIME_RE.test(body.endTime) ? body.endTime : null;
      const intervalMin = Number.isFinite(body.intervalMin) ? Math.max(5, Math.min(180, Math.round(body.intervalMin))) : null;
      const enabled = typeof body.enabled === "boolean" ? body.enabled : null;

      if (!days || !days.length || !startTime || !endTime || !intervalMin || enabled === null) {
        return res.status(400).json({ error: "invalid settings payload" });
      }

      const state = await getState();
      state.settings = { days, startTime, endTime, intervalMin, enabled };
      await saveState(state);

      return res.status(200).json({ ok: true, settings: state.settings });
    }

    res.status(405).json({ error: "method not allowed" });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
