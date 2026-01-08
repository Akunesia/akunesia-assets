/**
 * Profile Edit JavaScript
 * Handles profile settings, password change, photo upload, and activity timeline
 * 
 * @author Akunesia
 * @version 1.0.0
 */

document.addEventListener("DOMContentLoaded", function() {
  
  // =====================================================
  // AUTO-HIDE ALERTS
  // =====================================================
  const alerts = document.querySelectorAll('.alert');
  if (alerts.length > 0) {
    alerts.forEach(alert => {
      setTimeout(function() {
        const bsAlert = new bootstrap.Alert(alert);
        bsAlert.close();
      }, 5000); // 5 seconds
    });
  }
  
  // =====================================================
  // PASSWORD VISIBILITY TOGGLE
  // =====================================================
  document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('data-target');
      const passwordInput = document.getElementById(targetId);
      
      if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        this.innerHTML = '<i class="fe fe-eye-off"></i>';
      } else {
        passwordInput.type = 'password';
        this.innerHTML = '<i class="fe fe-eye"></i>';
      }
    });
  });
  
  // =====================================================
  // PHOTO UPLOAD & PREVIEW
  // =====================================================
  const avatarUpload = document.getElementById('avatar-upload');
  const photoForm = document.getElementById('photo-form');

  if (avatarUpload && photoForm) {
    avatarUpload.addEventListener('change', function() {
      if (this.files.length > 0) {
        // Validasi ukuran file (maks 2MB)
        if (this.files[0].size > 2 * 1024 * 1024) {
          alert('File size cannot exceed 2MB. Please select a smaller image.');
          this.value = ''; // Reset input
          return;
        }
        
        // Dapatkan file yang dipilih
        const file = this.files[0];
        
        // Buat objek URL untuk file lokal
        const objectUrl = URL.createObjectURL(file);
        
        // Tampilkan preview menggunakan objectURL
        const avatarContainer = document.querySelector('.user-avatar');
        const existingImg = avatarContainer.querySelector('img');
        const placeholder = avatarContainer.querySelector('.avatar-placeholder');
        
        // Jika sudah ada gambar, update src nya
        if (existingImg) {
          existingImg.src = objectUrl;
          existingImg.style.display = 'block';
        } else if (placeholder) {
          // Jika belum ada gambar tapi ada placeholder, sembunyikan placeholder dan buat gambar baru
          placeholder.style.display = 'none';
          
          const newImg = document.createElement('img');
          newImg.id = 'user-photo';
          newImg.alt = 'User Profile';
          newImg.src = objectUrl;
          
          // Tambahkan class yang sama seperti yang digunakan pada gambar profil
          newImg.className = 'profile-image';
          
          // Sisipkan gambar baru sebelum placeholder
          avatarContainer.insertBefore(newImg, placeholder);
        }
        
        // Tampilkan indikator loading
        const avatarEdit = document.querySelector('.avatar-edit-btn');
        if (avatarEdit) {
          avatarEdit.innerHTML = '<i class="fe fe-upload"></i>';
          avatarEdit.style.backgroundColor = '#FFA500'; // Warna oranye untuk menunjukkan sedang dalam proses
        }
        
        // Tampilkan tombol Save jika belum ada
        let saveButton = document.getElementById('save-photo-button');
        
        if (!saveButton) {
          saveButton = document.createElement('button');
          saveButton.id = 'save-photo-button';
          saveButton.type = 'button';
          saveButton.className = 'btn btn-primary btn-sm mt-2';
          saveButton.innerHTML = '<i class="fe fe-save"></i> Save Photo';
          saveButton.style.display = 'block';
          saveButton.style.margin = '10px auto 0';
          
          // Tambahkan tombol setelah avatar container
          avatarContainer.parentNode.insertBefore(saveButton, avatarContainer.nextSibling);
          
          // Event listener untuk tombol save
          saveButton.addEventListener('click', function() {
            // Ubah status tombol saat proses upload
            this.disabled = true;
            this.innerHTML = '<i class="fe fe-loader"></i> Saving...';
            
            // Submit form dengan AJAX
            if (window.FormData) {
              const formData = new FormData(photoForm);
              
              fetch(window.location.href, {
                method: 'POST',
                body: formData
              })
              .then(response => response.text())
              .then(html => {
                // Kembalikan ikon kamera
                if (avatarEdit) {
                  avatarEdit.innerHTML = '<i class="fe fe-camera"></i>';
                  avatarEdit.style.backgroundColor = '';
                }
                
                // Sembunyikan tombol save setelah berhasil
                saveButton.style.display = 'none';
                
                // Tampilkan notifikasi sukses
                const alertContainer = document.createElement('div');
                alertContainer.className = 'alert alert-success alert-dismissible fade show';
                alertContainer.setAttribute('role', 'alert');
                alertContainer.innerHTML = `
                  <i class="fe fe-check-circle me-2"></i> User Photo is updated successfully.
                  <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
                `;
                
                // Tambahkan ke halaman
                const container = document.querySelector('.content.container-fluid');
                if (container) {
                  container.insertBefore(alertContainer, container.firstChild.nextSibling);
                  
                  // Auto-hide setelah 5 detik
                  setTimeout(() => {
                    const bsAlert = new bootstrap.Alert(alertContainer);
                    bsAlert.close();
                  }, 5000);
                }
              })
              .catch(error => {
                console.error('Error uploading image:', error);
                
                // Reset tombol
                saveButton.disabled = false;
                saveButton.innerHTML = '<i class="fe fe-save"></i> Save Photo';
                
                // Kembalikan ikon kamera
                if (avatarEdit) {
                  avatarEdit.innerHTML = '<i class="fe fe-camera"></i>';
                  avatarEdit.style.backgroundColor = '';
                }
                
                // Tampilkan error alert
                alert('Failed to save photo. Please try again.');
              });
            } else {
              // Fallback jika FormData tidak didukung
              photoForm.submit();
            }
          });
        } else {
          // Jika tombol save sudah ada, pastikan terlihat
          saveButton.style.display = 'block';
          saveButton.disabled = false;
          saveButton.innerHTML = '<i class="fe fe-save"></i> Save Photo';
        }
        
        // Tambahkan fungsi untuk membersihkan objURL saat tidak diperlukan lagi
        // untuk mencegah memory leak
        window.addEventListener('beforeunload', function() {
          URL.revokeObjectURL(objectUrl);
        });
      }
    });
  }

  // Tambahkan CSS untuk memperbaiki tampilan gambar preview
  const style = document.createElement('style');
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
    
    /* Tambahkan animasi loading untuk ikon upload */
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
  
  // =====================================================
  // BASIC INFO FORM VALIDATION
  // =====================================================
  const basicInfoForm = document.getElementById('basic-info-form');
  const saveChangesBtn = document.getElementById('saveChangesBtn');
  let originalUsername = '';
  let originalPhone = '';

  if (basicInfoForm) {
    // Simpan nilai awal saat halaman dimuat
    const usernameInput = document.getElementById('username');
    const phoneInput = document.getElementById('phone');
    
    if (usernameInput) originalUsername = usernameInput.value;
    if (phoneInput) originalPhone = phoneInput.value;
    
    // Periksa perubahan pada input
    const checkChanges = function() {
      let hasChanges = false;
      
      if (usernameInput && !usernameInput.readOnly && usernameInput.value !== originalUsername) {
        hasChanges = true;
      }
      
      if (phoneInput && phoneInput.value !== originalPhone) {
        hasChanges = true;
      }
      
      // Enable/disable tombol berdasarkan ada tidaknya perubahan
      if (saveChangesBtn) {
        if (hasChanges) {
          saveChangesBtn.disabled = false;
          saveChangesBtn.title = "Save your changes";
        } else {
          saveChangesBtn.disabled = true;
          saveChangesBtn.title = "No changes to save";
        }
      }
      
      return hasChanges;
    };
    
    // Pasang event listener untuk memantau perubahan
    if (usernameInput) {
      usernameInput.addEventListener('input', checkChanges);
      usernameInput.addEventListener('change', checkChanges);
    }
    
    if (phoneInput) {
      phoneInput.addEventListener('input', checkChanges);
      phoneInput.addEventListener('change', checkChanges);
    }
    
    // Cek status tombol saat halaman dimuat
    setTimeout(checkChanges, 500);
    
    // Validasi form sebelum submit
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
  const passwordForm = document.getElementById('password-form');
  const passwordInput = document.getElementById('password');
  const rePasswordInput = document.getElementById('re_password');
  const updatePasswordBtn = document.getElementById('updatePasswordBtn');
  const strengthBar = document.querySelector('#password-strength .progress-bar');
  const strengthFeedback = document.querySelector('.password-feedback');

  if (passwordForm && passwordInput && rePasswordInput) {
    // Disable tombol submit secara default sampai kedua input diisi
    if (updatePasswordBtn) {
      updatePasswordBtn.disabled = true;
    }
    
    // Fungsi untuk memeriksa kekuatan password dan validitas
    const checkPasswordStrength = function() {
      const password = passwordInput.value;
      const rePassword = rePasswordInput.value;
      let strength = 0;
      let feedback = '';
      let isValid = false;
      
      // Reset jika kosong
      if (password.length === 0) {
        strengthBar.style.width = '0%';
        strengthBar.className = 'progress-bar';
        strengthFeedback.textContent = '';
        updatePasswordBtn.disabled = true;
        return;
      }
      
      // Length check
      if (password.length >= 8) {
        strength += 25;
      }
      
      // Uppercase check
      if (/[A-Z]/.test(password)) {
        strength += 25;
      }
      
      // Number check
      if (/[0-9]/.test(password)) {
        strength += 25;
      }
      
      // Special character check
      if (/[^A-Za-z0-9]/.test(password)) {
        strength += 25;
      }
      
      // Update UI
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
      
      strengthFeedback.textContent = feedback;
      
      // Cek kecocokan password
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
      
      // Update status tombol
      if (updatePasswordBtn) {
        updatePasswordBtn.disabled = !(isValid && password.length > 0);
      }
    };
    
    // Pasang event listeners
    passwordInput.addEventListener('input', checkPasswordStrength);
    rePasswordInput.addEventListener('input', checkPasswordStrength);
    
    // Validasi sebelum submit
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
  function refreshUserImage() {
    const userImage = document.querySelector('.user-avatar img');
    if (userImage) {
      const currentSrc = userImage.src;
      if (currentSrc.indexOf('?') > -1) {
        // Jika sudah ada parameter query
        userImage.src = currentSrc.split('?')[0] + '?v=' + new Date().getTime();
      } else {
        // Jika belum ada parameter query
        userImage.src = currentSrc + '?v=' + new Date().getTime();
      }
    }
  }

  // Memastikan gambar profile di-refresh saat halaman dimuat
  window.addEventListener('load', refreshUserImage);

  // =====================================================
  // ACTIVITY TIMELINE FILTER
  // =====================================================
  const activityFilter = document.getElementById('activityFilter');
  const timelineItems = document.querySelectorAll('.timeline-item');
  
  if (activityFilter) {
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
  const loadMoreBtn = document.getElementById('loadMoreActivity');
  if (loadMoreBtn) {
    let page = 1;
    
    loadMoreBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fe fe-loader"></i> Loading...';
      this.disabled = true;
      
      // Get user_id from button data attribute or session
      const userId = this.getAttribute('data-user-id');
      
      // Ajax request to get more logs
      fetch(`get_more_logs.php?page=${++page}&user_id=${userId}`)
        .then(response => response.json())
        .then(data => {
          if (data.logs && data.logs.length > 0) {
            // Tambahkan logs ke timeline
            const timelineWrapper = document.querySelector('.timeline-wrapper');
            
            data.logs.forEach(log => {
              const timelineItem = createTimelineItem(log);
              timelineWrapper.appendChild(timelineItem);
            });
            
            // Enable button kembali
            this.innerHTML = '<i class="fe fe-refresh-cw me-1"></i> Load More';
            this.disabled = false;
            
            // Sembunyikan button jika tidak ada lagi logs
            if (data.logs.length < 15) {
              this.style.display = 'none';
            }
          } else {
            // Tidak ada lagi logs
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
  
  // Fungsi untuk membuat elemen timeline item
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
  
  // Format date helpers
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
  
});
