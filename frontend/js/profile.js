/* =====================================================================
   Study Sphere AI  -  profile.js  (settings & account management)
   ===================================================================== */

let currentSettings = {};

document.addEventListener('DOMContentLoaded', async () => {
  if (!SS.requireAuth()) return;

  setupPasswordToggles();
  loadUserProfile();
  loadSettings();
  setupTabNavigation();
  setupEventListeners();
});

function setupPasswordToggles() {
  document.querySelectorAll('.toggle-pw').forEach((btn) => {
    btn.addEventListener('click', () => {
      const input = document.getElementById(btn.dataset.target);
      if (!input) return;
      const isPw = input.type === 'password';
      input.type = isPw ? 'text' : 'password';
      btn.innerHTML = `<i class="fas fa-eye${isPw ? '-slash' : ''}"></i>`;
    });
  });
}

async function loadUserProfile() {
  try {
    const data = await SS.api('/api/auth/me');
    const user = data.user;
    document.getElementById('fullName').value = user.name || '';
    document.getElementById('username').value = user.username || user.email || '';
    document.getElementById('email').value = user.email || '';
  } catch (err) {
    console.error('Failed to load profile:', err);
    SS.toast('Failed to load profile', 'error');
  }
}

async function loadSettings() {
  try {
    const data = await SS.api('/api/auth/settings');
    currentSettings = data;

    // Apply appearance settings
    if (data.appearance) {
      const theme = data.appearance.theme || 'dark';
      SS.applyTheme(theme);
      document.querySelectorAll('.theme-opt').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
      });

      const accentColor = data.appearance.accentColor || '#3b82f6';
      document.querySelectorAll('.color-opt').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.color === accentColor);
      });
    }

    // Apply dashboard settings
    if (data.dashboard) {
      document.getElementById('compactSidebar').checked = data.dashboard.compactSidebar || false;
      document.getElementById('showWelcome').checked = data.dashboard.showWelcome !== false;
      document.getElementById('showStreak').checked = data.dashboard.showStreak !== false;
      document.getElementById('defaultPage').value = data.dashboard.defaultPage || 'dashboard';
    }

    // Apply notification settings
    if (data.notifications) {
      document.getElementById('emailNotifications').checked = data.notifications.email !== false;
      document.getElementById('studyReminders').checked = data.notifications.reminders !== false;
      document.getElementById('dailyGoalReminders').checked = data.notifications.dailyGoal !== false;
    }

    // Apply AI settings
    if (data.ai_settings) {
      document.getElementById('aiModel').value = data.ai_settings.model || 'gpt-4';
      document.getElementById('responseLength').value = data.ai_settings.length || 'medium';
      document.getElementById('studyDifficulty').value = data.ai_settings.difficulty || 'intermediate';
    }
  } catch (err) {
    console.error('Failed to load settings:', err);
  }
}

function setupTabNavigation() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tabName = btn.dataset.tab;
      
      // Update active tab button
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      // Update active panel
      document.querySelectorAll('.settings-panel').forEach(p => p.classList.remove('active'));
      document.getElementById(`${tabName}-tab`).classList.add('active');
    });
  });
}

function setupEventListeners() {
  // Account tab
  document.getElementById('saveProfileBtn')?.addEventListener('click', saveProfile);
  document.getElementById('changePasswordBtn')?.addEventListener('click', changePassword);
  document.getElementById('deleteAccountBtn')?.addEventListener('click', deleteAccount);

  // Appearance tab
  document.querySelectorAll('.theme-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      const theme = btn.dataset.theme;
      SS.applyTheme(theme);
      document.querySelectorAll('.theme-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveAppearanceSettings();
    });
  });

  document.querySelectorAll('.color-opt').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-opt').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      saveAppearanceSettings();
    });
  });

  // Dashboard tab
  document.getElementById('saveDashboardBtn')?.addEventListener('click', saveDashboardSettings);

  // Notifications tab
  document.getElementById('saveNotificationsBtn')?.addEventListener('click', saveNotificationSettings);

  // AI tab
  document.getElementById('saveAiBtn')?.addEventListener('click', saveAiSettings);
}

async function saveProfile() {
  const name = document.getElementById('fullName').value.trim();
  if (!name) return showMsg('profileMsg', 'Please enter your name.');

  const btn = document.getElementById('saveProfileBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  try {
    await SS.api('/api/auth/profile', {
      method: 'PUT',
      body: { name }
    });
    showMsg('profileMsg', 'Profile updated successfully!', 'success');
    SS.toast('Profile updated!');
  } catch (err) {
    showMsg('profileMsg', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Changes';
  }
}

async function changePassword() {
  const current = document.getElementById('currentPassword').value;
  const newPw = document.getElementById('newPassword').value;
  const confirm = document.getElementById('confirmPassword').value;

  if (!current || !newPw || !confirm) {
    return showMsg('pwMsg', 'Please fill in all password fields.');
  }
  if (newPw.length < 6) {
    return showMsg('pwMsg', 'New password must be at least 6 characters.');
  }
  if (newPw !== confirm) {
    return showMsg('pwMsg', 'New passwords do not match.');
  }

  const btn = document.getElementById('changePasswordBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Updating…';

  try {
    await SS.api('/api/auth/change-password', {
      method: 'PUT',
      body: { current_password: current, new_password: newPw }
    });
    showMsg('pwMsg', 'Password changed successfully!', 'success');
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    SS.toast('Password updated!');
  } catch (err) {
    showMsg('pwMsg', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-key"></i> Change Password';
  }
}

async function deleteAccount() {
  if (!confirm('Are you sure? This will permanently delete your account and all data. This cannot be undone.')) {
    return;
  }

  const btn = document.getElementById('deleteAccountBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Deleting…';

  try {
    await SS.api('/api/auth/account', { method: 'DELETE' });
    SS.toast('Account deleted. Redirecting…');
    setTimeout(() => {
      SS.clearSession();
      window.location.href = '/';
    }, 1500);
  } catch (err) {
    SS.toast(err.message, 'error');
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-trash"></i> Delete Account';
  }
}

async function saveAppearanceSettings() {
  const theme = document.querySelector('.theme-opt.active')?.dataset.theme || 'dark';
  const accentColor = document.querySelector('.color-opt.active')?.dataset.color || '#3b82f6';

  try {
    await SS.api('/api/auth/settings', {
      method: 'PUT',
      body: {
        category: 'appearance',
        data: { theme, accentColor }
      }
    });
    SS.toast('Appearance settings saved!');
  } catch (err) {
    SS.toast(err.message, 'error');
  }
}

async function saveDashboardSettings() {
  const data = {
    compactSidebar: document.getElementById('compactSidebar').checked,
    showWelcome: document.getElementById('showWelcome').checked,
    showStreak: document.getElementById('showStreak').checked,
    defaultPage: document.getElementById('defaultPage').value
  };

  const btn = document.getElementById('saveDashboardBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  try {
    await SS.api('/api/auth/settings', {
      method: 'PUT',
      body: { category: 'dashboard', data }
    });
    showMsg('dashboardMsg', 'Dashboard settings saved!', 'success');
    SS.toast('Dashboard settings updated!');
  } catch (err) {
    showMsg('dashboardMsg', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Preferences';
  }
}

async function saveNotificationSettings() {
  const data = {
    email: document.getElementById('emailNotifications').checked,
    reminders: document.getElementById('studyReminders').checked,
    dailyGoal: document.getElementById('dailyGoalReminders').checked
  };

  const btn = document.getElementById('saveNotificationsBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  try {
    await SS.api('/api/auth/settings', {
      method: 'PUT',
      body: { category: 'notifications', data }
    });
    showMsg('notificationsMsg', 'Notification settings saved!', 'success');
    SS.toast('Notification preferences updated!');
  } catch (err) {
    showMsg('notificationsMsg', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Preferences';
  }
}

async function saveAiSettings() {
  const data = {
    model: document.getElementById('aiModel').value,
    length: document.getElementById('responseLength').value,
    difficulty: document.getElementById('studyDifficulty').value
  };

  const btn = document.getElementById('saveAiBtn');
  btn.disabled = true;
  btn.innerHTML = '<span class="spinner"></span> Saving…';

  try {
    await SS.api('/api/auth/settings', {
      method: 'PUT',
      body: { category: 'ai_settings', data }
    });
    showMsg('aiMsg', 'AI settings saved!', 'success');
    SS.toast('AI settings updated!');
  } catch (err) {
    showMsg('aiMsg', err.message);
  } finally {
    btn.disabled = false;
    btn.innerHTML = '<i class="fas fa-save"></i> Save Settings';
  }
}

function showMsg(elementId, text, type = 'error') {
  const box = document.getElementById(elementId);
  if (!box) return;
  box.textContent = text;
  box.className = `form-msg show ${type}`;
  setTimeout(() => {
    box.className = 'form-msg';
  }, 5000);
}
