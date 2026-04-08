// ============================================================
// SMART ATTENDANCE SYSTEM - Frontend JavaScript
// ============================================================
// This file handles all client-side logic:
//   - API calls to our Node.js backend
//   - Page switching (auth <-> dashboard)
//   - JWT token management
//   - UI updates
// ============================================================

// ──────────────────────────────────────────────
// CONFIGURATION
// Change this URL to your AWS EC2 public IP when deployed
// Example: 'http://54.123.456.789:5000'
// ──────────────────────────────────────────────
const API_BASE_URL = '';   // Empty = same server (backend serves frontend)

// ──────────────────────────────────────────────
// APP STATE
// ──────────────────────────────────────────────
let currentUser = null;      // Logged-in user's data
let clockInterval = null;    // Timer for the live clock

// ──────────────────────────────────────────────
// INITIALIZE APP - Runs when page loads
// ──────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Show loading overlay briefly for smooth startup
  setTimeout(() => {
    hideLoadingOverlay();
    checkAuthState();     // Check if user is already logged in
    setupEventListeners();
    startLiveClock();
  }, 800);
});

// ──────────────────────────────────────────────
// AUTH STATE CHECK
// Reads JWT from localStorage to auto-login returning users
// ──────────────────────────────────────────────
function checkAuthState() {
  const token = localStorage.getItem('attendance_token');
  const user  = localStorage.getItem('attendance_user');

  if (token && user) {
    // User was previously logged in - restore session
    try {
      currentUser = JSON.parse(user);
      showDashboard();
    } catch (e) {
      // Corrupted data - clear and show login
      clearAuthData();
      showAuthPage();
    }
  } else {
    // No session found - show login page
    showAuthPage();
  }
}

// ──────────────────────────────────────────────
// EVENT LISTENERS - Form Submissions
// ──────────────────────────────────────────────
function setupEventListeners() {
  // Login form
  document.getElementById('login-form').addEventListener('submit', handleLogin);

  // Register form
  document.getElementById('register-form').addEventListener('submit', handleRegister);

  // Password strength meter
  document.getElementById('reg-password').addEventListener('input', checkPasswordStrength);
}

// ──────────────────────────────────────────────
// HANDLE LOGIN
// ──────────────────────────────────────────────
async function handleLogin(event) {
  event.preventDefault();  // Prevent page reload on form submit

  const email    = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value;
  const btn      = document.getElementById('login-btn');

  // Basic client-side validation
  if (!email || !password) {
    return showToast('Please fill in all fields!', 'error');
  }

  // Show loading state on button
  setButtonLoading(btn, true);

  try {
    // Make API call to backend
    const response = await apiCall('/api/login', 'POST', { email, password });

    if (response.success) {
      // Save JWT token and user to localStorage
      localStorage.setItem('attendance_token', response.token);
      localStorage.setItem('attendance_user', JSON.stringify(response.user));

      currentUser = response.user;

      showToast(`Welcome back, ${response.user.name}! 🎉`, 'success');

      // Brief delay then show dashboard
      setTimeout(() => showDashboard(), 500);

    } else {
      showToast(response.message || 'Login failed!', 'error');
    }

  } catch (error) {
    console.error('Login error:', error);
    showToast(error.message || 'Cannot connect to server. Check your connection.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

// ──────────────────────────────────────────────
// HANDLE REGISTER
// ──────────────────────────────────────────────
async function handleRegister(event) {
  event.preventDefault();

  const name     = document.getElementById('reg-name').value.trim();
  const email    = document.getElementById('reg-email').value.trim();
  const password = document.getElementById('reg-password').value;
  const btn      = document.getElementById('register-btn');

  // Validation
  if (!name || !email || !password) {
    return showToast('Please fill in all fields!', 'error');
  }
  if (password.length < 6) {
    return showToast('Password must be at least 6 characters!', 'error');
  }

  setButtonLoading(btn, true);

  try {
    const response = await apiCall('/api/register', 'POST', { name, email, password });

    if (response.success) {
      showToast('Account created! Please sign in. ✅', 'success');

      // Clear the form
      document.getElementById('register-form').reset();

      // Switch to login after a moment
      setTimeout(() => showLogin(), 1000);

    } else {
      showToast(response.message || 'Registration failed!', 'error');
    }

  } catch (error) {
    showToast(error.message || 'Server error. Please try again.', 'error');
  } finally {
    setButtonLoading(btn, false);
  }
}

// ──────────────────────────────────────────────
// MARK ATTENDANCE
// Called when user clicks the big "Mark Attendance" button
// ──────────────────────────────────────────────
async function markAttendance() {
  const btn = document.getElementById('mark-btn');

  // If already marked, show tooltip instead
  if (btn.disabled) {
    showToast('Attendance already marked for today!', 'warning');
    return;
  }

  // Show loading
  btn.disabled = true;
  btn.querySelector('.btn-mark-text').textContent = 'Marking...';

  try {
    const response = await apiCall('/api/mark', 'POST', {}, true);

    if (response.success) {
      showToast(response.message, 'success');

      // Update the status box
      showAttendanceMarkedState(response.data);

      // Refresh the records table
      await fetchRecords();

    } else {
      showToast(response.message || 'Failed to mark attendance!', 'error');
      btn.disabled = false;
      btn.querySelector('.btn-mark-text').textContent = 'Mark My Attendance';
    }

  } catch (error) {
    showToast(error.message || 'Server error. Please try again.', 'error');
    btn.disabled = false;
    btn.querySelector('.btn-mark-text').textContent = 'Mark My Attendance';
  }
}

// ──────────────────────────────────────────────
// FETCH ATTENDANCE RECORDS
// Loads all attendance records for current user from DB
// ──────────────────────────────────────────────
async function fetchRecords() {
  const loadingEl = document.getElementById('records-loading');
  const emptyEl   = document.getElementById('records-empty');
  const tableEl   = document.getElementById('records-table-wrapper');
  const countEl   = document.getElementById('record-count');

  // Show loading state
  loadingEl.classList.remove('hidden');
  emptyEl.classList.add('hidden');
  tableEl.classList.add('hidden');

  try {
    const response = await apiCall('/api/records', 'GET', null, true);

    if (!response.success) throw new Error(response.message);

    const { records, stats } = response;

    // Update stat cards with animation
    animateNumber('stat-total-num',   stats.totalDays);
    animateNumber('stat-present-num', stats.presentDays);
    animateNumber('stat-late-num',    stats.lateDays);
    document.getElementById('stat-percent-num').textContent = stats.attendancePercentage + '%';

    // Update donut chart
    updateDonut(stats.attendancePercentage);

    // Update record count badge
    countEl.textContent = `${records.length} record${records.length !== 1 ? 's' : ''}`;

    loadingEl.classList.add('hidden');

    if (records.length === 0) {
      emptyEl.classList.remove('hidden');
      return;
    }

    // Render the records table
    renderRecordsTable(records);
    tableEl.classList.remove('hidden');

    // Check if today's attendance already marked
    const today = new Date().toLocaleDateString('en-CA');
    const todayRecord = records.find(r => r.date === today);
    if (todayRecord) {
      markButtonAsAlreadyMarked(todayRecord);
    }

  } catch (error) {
    console.error('Fetch records error:', error);
    loadingEl.classList.add('hidden');
    emptyEl.classList.remove('hidden');
    showToast('Could not load records: ' + error.message, 'error');
  }
}

// ──────────────────────────────────────────────
// RENDER RECORDS TABLE
// Builds HTML table rows from records array
// ──────────────────────────────────────────────
function renderRecordsTable(records) {
  const tbody = document.getElementById('records-tbody');
  tbody.innerHTML = '';  // Clear existing rows

  records.forEach((record, index) => {
    const row = document.createElement('tr');
    // Add animation delay for staggered entrance
    row.style.animationDelay = `${index * 0.05}s`;

    // Format date nicely: "2024-01-15" → "Jan 15, 2024"
    const displayDate = new Date(record.date + 'T00:00:00').toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });

    // Status badge HTML
    const statusIcon = record.status === 'present' ? '✓' : record.status === 'late' ? '⏰' : '✗';
    const statusBadge = `<span class="status-badge ${record.status}">${statusIcon} ${record.status}</span>`;

    row.innerHTML = `
      <td>${records.length - index}</td>
      <td>${displayDate}</td>
      <td>${record.dayOfWeek || '—'}</td>
      <td>${record.time}</td>
      <td>${statusBadge}</td>
    `;

    tbody.appendChild(row);
  });
}

// ──────────────────────────────────────────────
// LOGOUT
// ──────────────────────────────────────────────
function logout() {
  // Clear stored data
  clearAuthData();

  // Stop the clock
  if (clockInterval) {
    clearInterval(clockInterval);
    clockInterval = null;
  }

  // Reset state
  currentUser = null;

  showToast('Logged out successfully!', 'success');
  showAuthPage();
}

// ──────────────────────────────────────────────
// PAGE NAVIGATION
// ──────────────────────────────────────────────
function showAuthPage() {
  document.getElementById('auth-page').classList.remove('hidden');
  document.getElementById('dashboard-page').classList.add('hidden');
  showLogin(); // Always show login first
}

function showDashboard() {
  document.getElementById('auth-page').classList.add('hidden');
  document.getElementById('dashboard-page').classList.remove('hidden');

  // Populate user info in navbar
  if (currentUser) {
    document.getElementById('nav-username').textContent = currentUser.name;
    setWelcomeGreeting();
  }

  // Load attendance records
  fetchRecords();

  // Update today's date display
  const today = new Date();
  document.getElementById('today-display').textContent = today.toLocaleDateString('en-IN', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
}

function showLogin() {
  document.getElementById('login-section').classList.add('active');
  document.getElementById('register-section').classList.remove('active');
}

function showRegister() {
  document.getElementById('login-section').classList.remove('active');
  document.getElementById('register-section').classList.add('active');
}

// ──────────────────────────────────────────────
// HELPER: API CALL
// Centralized function for all fetch() requests
// ──────────────────────────────────────────────
async function apiCall(endpoint, method = 'GET', body = null, requiresAuth = false) {
  const headers = { 'Content-Type': 'application/json' };

  // Add JWT token for protected routes
  if (requiresAuth) {
    const token = localStorage.getItem('attendance_token');
    if (!token) throw new Error('Not authenticated. Please login.');
    headers['Authorization'] = `Bearer ${token}`;
  }

  const options = { method, headers };
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, options);
  const data = await response.json();

  // Handle 401 (Unauthorized) - token expired
  if (response.status === 401) {
    clearAuthData();
    showAuthPage();
    throw new Error('Session expired. Please login again.');
  }

  return data;
}

// ──────────────────────────────────────────────
// HELPER: Show Toast Notification
// ──────────────────────────────────────────────
function showToast(message, type = 'success') {
  const toast   = document.getElementById('toast');
  const msgEl   = document.getElementById('toast-message');
  const iconEl  = document.getElementById('toast-icon-class');

  msgEl.textContent = message;

  // Reset classes
  toast.classList.remove('show', 'error', 'warning', 'success');
  iconEl.className = '';

  // Set type-specific styles
  if (type === 'error') {
    toast.classList.add('error');
    iconEl.className = 'fas fa-times-circle';
    toast.style.borderLeftColor = 'var(--clr-error)';
    iconEl.style.color = 'var(--clr-error)';
  } else if (type === 'warning') {
    toast.classList.add('warning');
    iconEl.className = 'fas fa-exclamation-triangle';
    toast.style.borderLeftColor = 'var(--clr-warning)';
    iconEl.style.color = 'var(--clr-warning)';
  } else {
    iconEl.className = 'fas fa-check-circle';
    toast.style.borderLeftColor = 'var(--clr-success)';
    iconEl.style.color = 'var(--clr-success)';
  }

  // Show toast
  toast.classList.add('show');

  // Auto-hide after 4 seconds
  setTimeout(() => closeToast(), 4000);
}

function closeToast() {
  document.getElementById('toast').classList.remove('show');
}

// ──────────────────────────────────────────────
// HELPER: Set Button Loading State
// ──────────────────────────────────────────────
function setButtonLoading(btn, isLoading) {
  const textEl   = btn.querySelector('.btn-text');
  const loaderEl = btn.querySelector('.btn-loader');

  if (isLoading) {
    if (textEl)   textEl.classList.add('hidden');
    if (loaderEl) loaderEl.classList.remove('hidden');
    btn.disabled = true;
  } else {
    if (textEl)   textEl.classList.remove('hidden');
    if (loaderEl) loaderEl.classList.add('hidden');
    btn.disabled = false;
  }
}

// ──────────────────────────────────────────────
// HELPER: Toggle Password Visibility
// ──────────────────────────────────────────────
function togglePassword(inputId, toggleBtn) {
  const input = document.getElementById(inputId);
  const icon  = toggleBtn.querySelector('i');

  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
  }
}

// ──────────────────────────────────────────────
// HELPER: Password Strength Meter
// ──────────────────────────────────────────────
function checkPasswordStrength() {
  const password  = document.getElementById('reg-password').value;
  const strengthEl = document.getElementById('password-strength');

  let strength = 0;
  if (password.length >= 6) strength++;
  if (password.length >= 10) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  const widths = ['0%', '20%', '40%', '65%', '85%', '100%'];
  const colors = ['transparent', '#ef4444', '#f59e0b', '#eab308', '#10b981', '#10b981'];

  strengthEl.style.setProperty('--strength-width', widths[strength]);
  strengthEl.style.setProperty('--strength-color', colors[strength]);
}

// ──────────────────────────────────────────────
// HELPER: Live Clock in Navbar
// ──────────────────────────────────────────────
function startLiveClock() {
  function updateClock() {
    const now  = new Date();
    const time = now.toLocaleTimeString('en-IN', { hour12: true });
    const date = now.toLocaleDateString('en-IN', {
      weekday: 'short',
      day:     'numeric',
      month:   'short',
      year:    'numeric'
    });

    const timeEl = document.getElementById('current-time');
    const dateEl = document.getElementById('current-date');
    if (timeEl) timeEl.textContent = time;
    if (dateEl) dateEl.textContent = date;
  }

  updateClock();
  clockInterval = setInterval(updateClock, 1000);
}

// ──────────────────────────────────────────────
// HELPER: Set Welcome Greeting (Morning/Afternoon/Evening)
// ──────────────────────────────────────────────
function setWelcomeGreeting() {
  const hour     = new Date().getHours();
  let greeting   = 'Good Morning';
  let emoji      = '☀️';

  if (hour >= 12 && hour < 17) { greeting = 'Good Afternoon'; emoji = '🌤️'; }
  else if (hour >= 17)          { greeting = 'Good Evening';   emoji = '🌙'; }

  const heading = document.getElementById('welcome-heading');
  if (heading && currentUser) {
    heading.textContent = `${greeting}, ${currentUser.name}! ${emoji}`;
  }
}

// ──────────────────────────────────────────────
// HELPER: Update Donut Progress Chart
// ──────────────────────────────────────────────
function updateDonut(percentage) {
  const circumference = 2 * Math.PI * 50;  // 2πr where r=50
  const dashArray     = (circumference * percentage) / 100;
  const dashOffset    = circumference * 0.25;  // Start from top

  const donut = document.getElementById('donut-progress');
  const label = document.getElementById('donut-percent-text');

  if (donut) {
    donut.style.strokeDasharray  = `${dashArray} ${circumference}`;
    donut.style.strokeDashoffset = dashOffset;

    // Color based on percentage
    if (percentage >= 75)      donut.style.stroke = '#10b981'; // green
    else if (percentage >= 50) donut.style.stroke = '#f59e0b'; // orange
    else                       donut.style.stroke = '#ef4444'; // red
  }

  if (label) label.textContent = percentage + '%';
}

// ──────────────────────────────────────────────
// HELPER: Animate Number in Stats Card
// ──────────────────────────────────────────────
function animateNumber(elementId, targetNum) {
  const el = document.getElementById(elementId);
  if (!el) return;

  const start    = 0;
  const duration = 800;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed  = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased    = 1 - Math.pow(1 - progress, 3);  // Ease-out cubic
    const current  = Math.round(start + (targetNum - start) * eased);

    el.textContent = current;

    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// ──────────────────────────────────────────────
// HELPER: Show "Already Marked" state
// ──────────────────────────────────────────────
function markButtonAsAlreadyMarked(record) {
  const btn       = document.getElementById('mark-btn');
  const statusBox = document.getElementById('today-attendance-status');
  const timeDisplay = document.getElementById('marked-time-display');

  if (btn) {
    btn.disabled = true;
    const textEl = btn.querySelector('.btn-mark-text');
    if (textEl) textEl.textContent = '✓ Attendance Marked Today';
  }

  if (statusBox) statusBox.classList.remove('hidden');
  if (timeDisplay && record) {
    timeDisplay.textContent = `Marked today at ${record.time}`;
  }
}

function showAttendanceMarkedState(data) {
  markButtonAsAlreadyMarked(data);
}

// ──────────────────────────────────────────────
// HELPER: Clear Auth Data from localStorage
// ──────────────────────────────────────────────
function clearAuthData() {
  localStorage.removeItem('attendance_token');
  localStorage.removeItem('attendance_user');
}

// ──────────────────────────────────────────────
// HELPER: Hide Loading Overlay
// ──────────────────────────────────────────────
function hideLoadingOverlay() {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) {
    overlay.classList.add('fade-out');
    setTimeout(() => overlay.remove(), 500);
  }
}
