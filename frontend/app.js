const API_BASE = window.location.hostname === 'localhost'
  ? 'http://localhost:8080/api'
  : '/api';

function switchTab(tab) {
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));

  document.querySelector(`[onclick="switchTab('${tab}')"]`).classList.add('active');
  document.getElementById(tab).classList.remove('hidden');
}

async function greet(role) {
  const endpoint = role === 'admin' ? `${API_BASE}/admin/hello` : `${API_BASE}/hello`;
  const responseEl = document.getElementById(`${role}-response`);

  responseEl.className = 'response hidden';

  try {
    const res = await fetch(endpoint);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    responseEl.textContent = data.message;
    responseEl.className = 'response';
  } catch (err) {
    responseEl.textContent = `Error: ${err.message}`;
    responseEl.className = 'response error';
  }
}
