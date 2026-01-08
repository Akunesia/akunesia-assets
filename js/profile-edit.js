/**
 * Profile Edit JavaScript - v1.0.2
 * Handles profile settings, password change, photo upload, and activity timeline
 * 
 * @author Akunesia
 * @license MIT
 */

(function() {
  'use strict';

  // Helper function untuk safe element selection
  function safeGetElement(selector) {
    try {
      return document.querySelector(selector);
    } catch (e) {
      console.warn('Element not found:', selector);
      return null;
    }
  }

  function safeGetElements(selector) {
    try {
      return document.querySelectorAll(selector);
    } catch (e) {
      console.warn('Elements not found:', selector);
      return [];
    }
  }

  // Wait for DOM to be ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  function init() {
    try {
      initAlerts();
      initPasswordToggle();
      initPhotoUpload();
      initBasicInfoForm();
      initPasswordForm();
      initUserImageRefresh();
      initActivityFilter();
      initLoadMoreActivity();
      addCustomStyles();
    } catch (error) {
      console.error('Profile Edit JS Error:', error);
    }
  }

  // =====================================================
  // AUTO-HIDE ALERTS
  // =====================================================
  function initAlerts() {
    const alerts = safeGetElements('.alert');
    if (!alerts || alerts.length === 0) return;

    alerts.forEach(alert => {
      setTimeout(function() {
        try {
          if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
            const bsAlert = new bootstrap.Alert(alert);
            bsAlert.close();
          } else {
            alert.style.display = 'none';
          }
        } catch (e) {
          console.warn('Failed to close alert:', e);
        }
      }, 5000);
    });
  }

  // =====================================================
  // PASSWORD VISIBILITY TOGGLE
  // =====================================================
  function initPasswordToggle() {
    const toggleButtons = safeGetElements('.toggle-password');
    if (!toggleButtons || toggleButtons.length === 0) return;

    toggleButtons.forEach(button => {
      button.addEventListener('click', function() {
        const targetId = this.getAttribute('data-target');
        if (!targetId) return;

        const passwordInput = document.getElementById(targetId);
        if (!passwordInput) return;

        if (passwordInput.type === 'password') {
          passwordInput.type = 'text';
          this.innerHTML = '<i class="fe fe-eye-off"></i>';
        } else {
          passwordInput.type = 'password';
          this.innerHTML = '<i class="fe fe-eye"></i>';
        }
      });
    });
  }

  // =====================================================
  // PHOTO UPLOAD & PREVIEW
  // =====================================================
  function initPhotoUpload() {
    const avatarUpload = safeGetElement('#avatar-upload');
    const photoForm = safeGetElement('#photo-form');

    if (!avatarUpload || !photoForm) return;

    avatarUpload.addEventListener('change', function() {
      if (this.files.length === 0) return;

      // Validasi ukuran file (maks 2MB)
      if (this.files[0].size > 2 * 1024 * 1024) {
        alert('File size cannot exceed 2MB. Please select a smaller image.');
        this.value = '';
        return;
      }

      const file = this.files[0];
      const objectUrl = URL.createObjectURL(file);

      // Tampilkan preview
      const avatarContainer = safeGetElement('.user-avatar');
      if (!avatarContainer) return;

      const existingImg = avatarContainer.querySelector('img');
      const placeholder = avatarContainer.querySelector('.avatar-placeholder');

      if (existingImg) {
        existingImg.src = objectUrl;
        existingImg.style.display = 'block';
      } else if (placeholder) {
        placeholder.style.display = 'none';

        const newImg = document.createElement('img');
        newImg.id = 'user-photo';
        newImg.alt = 'User Profile';
        newImg.src = objectUrl;
        newImg.className = 'profile-image';

        avatarContainer.insertBefore(newImg, placeholder);
      }

      // Update icon
      const avatarEdit = safeGetElement('.avatar-edit-btn');
      if (avatarEdit) {
        avatarEdit.innerHTML = '<i class="fe fe-upload"></i>';
        avatarEdit.style.backgroundColor = '#FFA500';
      }

      // Create/show save button
      let saveButton = safeGetElement('#save-photo-button');

      if (!saveButton) {
        saveButton = document.createElement('button');
        saveButton.id = 'save-photo-button';
        saveButton.type = 'button';
        saveButton.className = 'btn btn-primary btn-sm mt-2';
        saveButton.innerHTML = '<i class="fe fe-save"></i> Save Photo';
        saveButton.style.display = 'block';
        saveButton.style.margin = '10px auto 0';

        avatarContainer.parentNode.insertBefore(saveButton, avatarContainer.nextSibling);

        saveButton.addEventListener('click', function() {
          handlePhotoSave(this, photoForm, avatarEdit);
        });
      } else {
        saveButton.style.display = 'block';
        saveButton.disabled = false;
        saveButton.innerHTML = '<i class="fe fe-save"></i> Save Photo';
      }

      // Cleanup objectURL on page unload
      window.addEventListener('beforeunload', function() {
        URL.revokeObjectURL(objectUrl);
      });
    });
  }

  function handlePhotoSave(button, form, avatarEdit) {
    button.disabled = true;
    button.innerHTML = '<i class="fe fe-loader"></i> Saving...';

    if (window.FormData) {
      const formData = new FormData(form);

      fetch(window.location.href, {
        method: 'POST',
        body: formData
      })
      .then(response => response.text())
      .then(html => {
        if (avatarEdit) {
          avatarEdit.innerHTML = '<i class="fe fe-camera"></i>';
          avatarEdit.style.backgroundColor = '';
        }

        button.style.display = 'none';

        showSuccessAlert('User Photo is updated successfully.');
      })
      .catch(error => {
        console.error('Error uploading image:', error);

        button.disabled = false;
        button.innerHTML = '<i class="fe fe-save"></i> Save Photo';

        if (avatarEdit) {
          avatarEdit.innerHTML = '<i class="fe fe-camera"></i>';
          avatarEdit.style.backgroundColor = '';
        }

        alert('Failed to save photo. Please try again.');
      });
    } else {
      form.submit();
    }
  }

  function showSuccessAlert(message) {
    const alertContainer = document.createElement('div');
    alertContainer.className = 'alert alert-success alert-dismissible fade show';
    alertContainer.setAttribute('role', 'alert');
    alertContainer.innerHTML = `
      <i class="fe fe-check-circle me-2"></i> ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;

    const container = safeGetElement('.content.container-fluid');
    if (container && container.firstChild) {
      container.insertBefore(alertContainer, container.firstChild.nextSibling);

      setTimeout(() => {
        try {
          if (typeof bootstrap !== 'undefined' && bootstrap.Alert) {
            const bsAlert = new bootstrap.Alert(alertContainer);
            bsAlert.close();
          }
        } catch (e) {
          alertContainer.remove();
        }
      }, 5000);
    }
  }

  // =====================================================
  // BASIC INFO FORM VALIDATION
  // =====================================================
  function initBasicInfoForm() {
    const basicInfoForm = safeGetElement('#basic-info-form');
    const saveChangesBtn = safeGetElement('#saveChangesBtn');

    if (!basicInfoForm) return;

    const usernameInput = safeGetElement('#username');
    const phoneInput = safeGetElement('#phone');

    let originalUsername = usernameInput ? usernameInput.value : '';
    let originalPhone = phoneInput ? phoneInput.value : '';

    const checkChanges = function() {
      let hasChanges = false;

      if (usernameInput && !usernameInput.readOnly && usernameInput.value !== originalUsername) {
        hasChanges = true;
      }

      if (phoneInput && phoneInput.value !== originalPhone) {
        hasChanges = true;
      }

      if (saveChangesBtn) {
        saveChangesBtn.disabled = !hasChanges;
        saveChangesBtn.title = hasChanges ? "Save your changes" : "No changes to save";
      }

      return hasChanges;
    };

    if (usernameInput) {
      usernameInput.addEventListener('input', checkChanges);
      usernameInput.addEventListener('change', checkChanges);
    }

    if (phoneInput) {
      phoneInput.addEventListener('input', checkChanges);
      phoneInput.addEventListener('change', checkChanges);
    }

    setTimeout(checkChanges, 500);

    basicInfoForm.addEventListener('submit', function(e) {
      if (!checkChanges()) {
        e.preventDefault();
        alert('No changes were made.');
      }
    });
  }

  // =====================================================
  // PASSWORD FORM VALIDATION
  // =====================================================
  function initPasswordForm() {
    const passwordForm = safeGetElement('#password-form');
    const passwordInput = safeGetElement('#password');
    const rePasswordInput = safeGetElement('#re_password');
    const updatePasswordBtn = safeGetElement('#updatePasswordBtn');
    const strengthBar = safeGetElement('#password-strength .progress-bar');
    const strengthFeedback = safeGetElement('.password-feedback');

    if (!passwordForm || !passwordInput || !rePasswordInput) return;

    if (updatePasswordBtn) {
      updatePasswordBtn.disabled = true;
    }

    const checkPasswordStrength = function() {
      const password = passwordInput.value;
      const rePassword = rePasswordInput.value;
      let strength = 0;
      let feedback = '';
      let isValid = false;

      if (password.length === 0) {
        if (strengthBar) {
          strengthBar.style.width = '0%';
          strengthBar.className = 'progress-bar';
        }
        if (strengthFeedback) strengthFeedback.textContent = '';
        if (updatePasswordBtn) updatePasswordBtn.disabled = true;
        return;
      }

      // Calculate strength
      if (password.length >= 8) strength += 25;
      if (/[A-Z]/.test(password)) strength += 25;
      if (/[0-9]/.test(password)) strength += 25;
      if (/[^A-Za-z0-9]/.test(password)) strength += 25;

      // Update UI
      if (strengthBar) {
        strengthBar.style.width = strength + '%';

        if (strength <= 25) {
          strengthBar.className = 'progress-bar bg-danger';
          feedback = 'Weak password. Try adding numbers, symbols, and uppercase letters.';
        } else if (strength <= 50) {
          strengthBar.className = 'progress-bar bg-warning';
          feedback = 'Medium strength. Try adding more variety.';
        } else if (strength <= 75) {
          strengthBar.className = 'progress-bar bg-info';
          feedback = 'Good password. Consider making it longer.';
        } else {
          strengthBar.className = 'progress-bar bg-success';
          feedback = 'Strong password!';
        }
      }

      if (strengthFeedback) strengthFeedback.textContent = feedback;

      // Check password match
      if (password && rePassword) {
        if (password === rePassword) {
          isValid = true;
          rePasswordInput.classList.remove('is-invalid');
          rePasswordInput.classList.add('is-valid');
        } else {
          isValid = false;
          rePasswordInput.classList.remove('is-valid');
          rePasswordInput.classList.add('is-invalid');
        }
      }

      if (updatePasswordBtn) {
        updatePasswordBtn.disabled = !(isValid && password.length > 0);
      }
    };

    passwordInput.addEventListener('input', checkPasswordStrength);
    rePasswordInput.addEventListener('input', checkPasswordStrength);

    passwordForm.addEventListener('submit', function(e) {
      const password = passwordInput.value;
      const rePassword = rePasswordInput.value;

      if (!password || !rePassword) {
        e.preventDefault();
        alert('Please fill in all password fields.');
        return;
      }

      if (password !== rePassword) {
        e.preventDefault();
        alert('Passwords do not match.');
        return;
      }
    });
  }

  // =====================================================
  // USER IMAGE REFRESH
  // =====================================================
  function initUserImageRefresh() {
    window.addEventListener('load', function() {
      const userImage = safeGetElement('.user-avatar img');
      if (!userImage) return;

      const currentSrc = userImage.src;
      if (currentSrc.indexOf('?') > -1) {
        userImage.src = currentSrc.split('?')[0] + '?v=' + new Date().getTime();
      } else {
        userImage.src = currentSrc + '?v=' + new Date().getTime();
      }
    });
  }

  // =====================================================
  // ACTIVITY TIMELINE FILTER
  // =====================================================
  function initActivityFilter() {
    const activityFilter = safeGetElement('#activityFilter');
    const timelineItems = safeGetElements('.timeline-item');

    if (!activityFilter || timelineItems.length === 0) return;

    activityFilter.addEventListener('change', function() {
      const filterValue = this.value;

      timelineItems.forEach(item => {
        const activityType = item.getAttribute('data-activity-type');

        if (filterValue === 'all' || filterValue === activityType) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // =====================================================
  // LOAD MORE ACTIVITY
  // =====================================================
  function initLoadMoreActivity() {
    const loadMoreBtn = safeGetElement('#loadMoreActivity');
    if (!loadMoreBtn) return;

    let page = 1;

    loadMoreBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fe fe-loader"></i> Loading...';
      this.disabled = true;

      const userId = this.getAttribute('data-user-id');

      fetch(`get_more_logs.php?page=${++page}&user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
          if (data.logs && data.logs.length > 0) {
            const timelineWrapper = safeGetElement('.timeline-wrapper');
            if (!timelineWrapper) return;

            data.logs.forEach(log => {
              const timelineItem = createTimelineItem(log);
              timelineWrapper.appendChild(timelineItem);
            });

            this.innerHTML = '<i class="fe fe-refresh-cw me-1"></i> Load More';
            this.disabled = false;

            if (data.logs.length < 15) {
              this.style.display = 'none';
            }
          } else {
            this.innerHTML = 'No more activities';
            this.disabled = true;

            setTimeout(() => {
              this.style.display = 'none';
            }, 2000);
          }
        })
        .catch(error => {
          console.error('Error loading more logs:', error);
          this.innerHTML = '<i class="fe fe-refresh-cw me-1"></i> Try Again';
          this.disabled = false;
        });
    });
  }

  // =====================================================
  // HELPER FUNCTIONS
  // =====================================================
  function createTimelineItem(log) {
    let icon = 'alert-circle';
    let color = 'primary';

    switch (log.activity_type) {
      case 'login': icon = 'log-in'; color = 'success'; break;
      case 'logout': icon = 'log-out'; color = 'warning'; break;
      case 'profile': icon = 'user'; color = 'info'; break;
      case 'password': icon = 'lock'; color = 'danger'; break;
      case 'view': icon = 'eye'; color = 'secondary'; break;
    }

    const item = document.createElement('div');
    item.className = 'timeline-item';
    item.setAttribute('data-activity-type', log.activity_type);

    item.innerHTML = `
      <div class="timeline-dot bg-${color}">
        <i class="fe fe-${icon}"></i>
      </div>
      <div class="timeline-content">
        <div class="timeline-time">${formatTimeAgo(log.created_at)}</div>
        <h4 class="timeline-title">${log.activity_type.charAt(0).toUpperCase() + log.activity_type.slice(1)} Activity</h4>
        <p class="timeline-text">${log.description}</p>
        <div class="timeline-details">
          <span><i class="fe fe-globe"></i> ${log.ip_address}</span>
          <span><i class="fe fe-calendar"></i> ${formatDate(log.created_at)}</span>
        </div>
      </div>
    `;

    return item;
  }

  function formatTimeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);

    if (diffDay > 0) {
      if (diffDay === 1) return 'Yesterday';
      if (diffDay < 7) return `${diffDay} days ago`;
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }

    if (diffHour > 0) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    return 'Just now';
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  }

  // =====================================================
  // ADD CUSTOM STYLES
  // =====================================================
  function addCustomStyles() {
    // Check if styles already added
    if (document.getElementById('profile-edit-styles')) return;

    const style = document.createElement('style');
    style.id = 'profile-edit-styles';
    style.textContent = `
      .user-avatar {
        position: relative;
        width: 120px;
        height: 120px;
        margin: 0 auto 25px;
      }
      
      .user-avatar img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        border-radius: 50%;
        border: 4px solid #fff;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      }
      
      @keyframes pulse {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      
      .fe-upload, .fe-loader {
        animation: pulse 1.5s infinite;
      }
    `;
    document.head.appendChild(style);
  }

})();
