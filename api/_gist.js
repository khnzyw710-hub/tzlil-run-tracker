const GIST_API = "https://api.github.com/gists";
const FILE_NAME = "state.json";

const DEFAULT_STATE = {
  subscription: null,
  settings: {
    days: [1, 4],
    startTime: "17:30",
    endTime: "19:00",
    intervalMin: 30,
    enabled: false
  },
  completions: {},
  lastNotified: {}
};

function authHeaders() {
  const token = process.env.GITHUB_TOKEN;
  if (!token) throw new Error("GITHUB_TOKEN missing");
  return {
    Authorization: "Bearer " + token,
    Accept: "application/vnd.github+json",
    "Content-Type": "application/json",
    "User-Agent": "tzlil-run-tracker"
  };
}

async function getState() {
  const gistId = process.env.GIST_ID;
  if (!gistId) throw new Error("GIST_ID missing");
  const res = await fetch(GIST_API + "/" + gistId, { headers: authHeaders() });
  if (!res.ok) throw new Error("gist read failed: " + res.status);
  const json = await res.json();
  const file = json.files && json.files[FILE_NAME];
  if (!file) return { ...DEFAULT_STATE };
  try {
    const parsed = JSON.parse(file.content);
    return { ...DEFAULT_STATE, ...parsed, settings: { ...DEFAULT_STATE.settings, ...(parsed.settings || {}) } };
  } catch (e) {
    return { ...DEFAULT_STATE };
  }
}

async function saveState(state) {
  const gistId = process.env.GIST_ID;
  if (!gistId) throw new Error("GIST_ID missing");
  const body = { files: { [FILE_NAME]: { content: JSON.stringify(state, null, 2) } } };
  const res = await fetch(GIST_API + "/" + gistId, {
    method: "PATCH",
    headers: authHeaders(),
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error("gist write failed: " + res.status);
  return true;
}

module.exports = { getState, saveState, DEFAULT_STATE };
