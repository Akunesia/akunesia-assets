document.addEventListener("DOMContentLoaded", function() {
    // Auto-hide alerts after 5 seconds
    const alerts = document.querySelectorAll('.alert');
    if (alerts.length > 0) {
        alerts.forEach(alert => {
            setTimeout(function() {
                if (typeof bootstrap !== 'undefined') {
                    const bsAlert = new bootstrap.Alert(alert);
                    bsAlert.close();
                }
            }, 5000);
        });
    }

    // Password visibility toggle
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

    // Perbaikan untuk preview foto
    const avatarUpload = document.getElementById('avatar-upload');
    const photoForm = document.getElementById('photo-form');

    if (avatarUpload && photoForm) {
        avatarUpload.addEventListener('change', function() {
            if (this.files.length > 0) {
                if (this.files[0].size > 2 * 1024 * 1024) {
                    alert('File size cannot exceed 2MB. Please select a smaller image.');
                    this.value = '';
                    return;
                }

                const file = this.files[0];
                const objectUrl = URL.createObjectURL(file);
                const avatarContainer = document.querySelector('.user-avatar');
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

                const avatarEdit = document.querySelector('.avatar-edit-btn');
                if (avatarEdit) {
                    avatarEdit.innerHTML = '<i class="fe fe-upload"></i>';
                    avatarEdit.style.backgroundColor = '#FFA500';
                }

                const statusLabel = document.createElement('div');
                statusLabel.className = 'upload-status';
                statusLabel.innerHTML = 'Save To Change';
                statusLabel.style.cssText = 'position:absolute; bottom:110px; left:0; right:0; text-align:center; font-size:12px; color:#FFA500; font-weight:bold;';

                let saveButton = document.getElementById('save-photo-button');
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
                        this.disabled = true;
                        this.innerHTML = '<i class="fe fe-loader"></i> Saving...';
                        if (window.FormData) {
                            const formData = new FormData(photoForm);
                            fetch(window.location.href, { method: 'POST', body: formData })
                            .then(response => response.text())
                            .then(html => {
                                statusLabel.innerHTML = 'Photo saved successfully!';
                                statusLabel.style.color = '#28a745';
                                if (avatarEdit) {
                                    avatarEdit.innerHTML = '<i class="fe fe-camera"></i>';
                                    avatarEdit.style.backgroundColor = '';
                                }
                                saveButton.style.display = 'none';
                                const container = document.querySelector('.content.container-fluid');
                                if (container) {
                                    const alertContainer = document.createElement('div');
                                    alertContainer.className = 'alert alert-success alert-dismissible fade show';
                                    alertContainer.innerHTML = '<i class="fe fe-check-circle me-2"></i> Photo updated!<button type="button" class="btn-close" data-bs-dismiss="alert"></button>';
                                    container.insertBefore(alertContainer, container.firstChild.nextSibling);
                                    setTimeout(() => { if(typeof bootstrap !== 'undefined'){ new bootstrap.Alert(alertContainer).close(); } }, 5000);
                                }
                                setTimeout(() => { if (statusLabel.parentNode) statusLabel.parentNode.removeChild(statusLabel); }, 3000);
                            })
                            .catch(error => {
                                console.error('Error:', error);
                                this.disabled = false;
                                this.innerHTML = '<i class="fe fe-save"></i> Save Photo';
                            });
                        } else {
                            photoForm.submit();
                        }
                    });
                }
                window.addEventListener('beforeunload', () => URL.revokeObjectURL(objectUrl));
            }
        });
    }

    // Inject CSS
    const style = document.createElement('style');
    style.textContent = `
        .user-avatar { position: relative; width: 120px; height: 120px; margin: 0 auto 25px; }
        .user-avatar img { width: 100%; height: 100%; object-fit: cover; border-radius: 50%; border: 4px solid #fff; box-shadow: 0 5px 15px rgba(0,0,0,0.1); }
        @keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.1); } 100% { transform: scale(1); } }
        .fe-upload, .fe-loader { animation: pulse 1.5s infinite; }
    `;
    document.head.appendChild(style);
});
