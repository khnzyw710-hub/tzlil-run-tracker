const { getState } = require("./_gist");

module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).json({ error: "method not allowed" });

  try {
    const state = await getState();
    res.status(200).json({
      subscribed: !!state.subscription,
      settings: state.settings,
      completions: state.completions
    });
  } catch (e) {
    res.status(500).json({ error: String(e.message || e) });
  }
};
