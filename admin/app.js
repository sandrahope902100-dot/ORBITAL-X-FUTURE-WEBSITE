// Public project configuration. Database access is protected by Supabase Auth and RLS.
const SUPABASE_URL = "https://xhjtvtnhimqjgdmrxbzf.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_aNNnBlHcl-GMv3Mh5_UncA_hZ7jUkxw";

const loginView = document.getElementById("loginView");
const dashboardView = document.getElementById("dashboardView");
const loginForm = document.getElementById("loginForm");
const loginMessage = document.getElementById("loginMessage");
const noteMessage = document.getElementById("noteMessage");
const loginButton = document.getElementById("loginButton");
const saveNoteButton = document.getElementById("saveNoteButton");
const notesList = document.getElementById("notesList");

let supabaseClient = null;
let configurationReady = false;

function showMessage(target, message) {
  if (target) target.textContent = message || "";
}

function showDashboard(isSignedIn) {
  loginView.hidden = isSignedIn;
  dashboardView.hidden = !isSignedIn;
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;"
  })[char]);
}

async function loadNotes() {
  notesList.innerHTML = '<p class="muted">Loading notes…</p>';
  const { data, error } = await supabaseClient
    .from("founder_notes")
    .select("id,title,body,created_at")
    .order("created_at", { ascending: false });
  if (error) {
    notesList.innerHTML = '<p class="message">Could not load notes. Check that the database setup SQL has been run.</p>';
    return;
  }
  if (!data || data.length === 0) {
    notesList.innerHTML = '<p class="muted">No private notes yet. Add your first note above.</p>';
    return;
  }
  notesList.innerHTML = data.map(note => {
    const date = new Date(note.created_at).toLocaleString();
    return '<article class="note"><strong>' + escapeHtml(note.title) +
      '</strong><p>' + escapeHtml(note.body) + '</p><time>' +
      escapeHtml(date) + '</time></article>';
  }).join("");
}

async function initialize() {
  if (!window.supabase || !window.supabase.createClient) {
    showMessage(loginMessage, "The secure sign-in library did not load. Check your internet connection and refresh.");
    return;
  }
  if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
    showMessage(loginMessage, "Dashboard configuration is incomplete.");
    return;
  }
  supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
  });
  configurationReady = true;
  const { data: { session } } = await supabaseClient.auth.getSession();
  showDashboard(Boolean(session));
  if (session) await loadNotes();
}

loginForm.addEventListener("submit", async event => {
  event.preventDefault();
  if (!configurationReady) {
    showMessage(loginMessage, "Secure sign-in is still initializing. Refresh and try again.");
    return;
  }
  loginButton.disabled = true;
  showMessage(loginMessage, "Signing in securely…");
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const { error } = await supabaseClient.auth.signInWithPassword({ email, password });
  loginButton.disabled = false;
  if (error) {
    showMessage(loginMessage, "Sign-in failed: " + error.message);
    return;
  }
  showMessage(loginMessage, "");
  showDashboard(true);
  await loadNotes();
});

document.getElementById("signOutButton").addEventListener("click", async () => {
  await supabaseClient.auth.signOut();
  showDashboard(false);
  loginForm.reset();
});

document.getElementById("noteForm").addEventListener("submit", async event => {
  event.preventDefault();
  saveNoteButton.disabled = true;
  showMessage(noteMessage, "Saving your note…");
  const title = document.getElementById("noteTitle").value.trim();
  const body = document.getElementById("noteBody").value.trim();
  const { error } = await supabaseClient.from("founder_notes").insert({ title, body });
  saveNoteButton.disabled = false;
  if (error) {
    showMessage(noteMessage, "Could not save note: " + error.message);
    return;
  }
  document.getElementById("noteForm").reset();
  showMessage(noteMessage, "Private note saved.");
  await loadNotes();
});

initialize();