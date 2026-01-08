window.onload = function() {
    if (!window.feedbackGiven) {
        setTimeout(function() {
            var feedbackModal = new bootstrap.Modal(
                document.getElementById('feedbackModal')
            );
            feedbackModal.show();
        }, 2000);
    }

    // Initialize search functionality
    const searchInput = document.getElementById('accountSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const tableRows = document.querySelectorAll('#accountTable tbody tr');

            tableRows.forEach(row => {
                const name = row.querySelector('.name-col').textContent.toLowerCase();
                const category = row.querySelector('.category-col').textContent.toLowerCase();

                row.style.display =
                    name.includes(searchTerm) || category.includes(searchTerm)
                        ? ''
                        : 'none';
            });
        });
    }
};

// Prevent duplicate form submission
document.addEventListener('DOMContentLoaded', function () {
    const feedbackForm = document.getElementById('feedbackForm');
    const submitBtn = document.getElementById('submitFeedbackBtn');

    if (feedbackForm && submitBtn) {
        feedbackForm.addEventListener('submit', function () {
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Mengirim...';
        });
    }
});

// --- JavaScript untuk Inform Consent (Diubah untuk persistensi sesi dan centang otomatis) ---
document.addEventListener('DOMContentLoaded', function() {
    const consentModal = document.getElementById('consentModal');
    const continueBtn = document.getElementById('continueBtn');
    const consentCheckboxes = document.querySelectorAll('.consent-checkbox');
    let targetAccountModalId = ''; // Variabel untuk menyimpan ID modal akun yang akan dibuka

    // Kunci untuk session storage
    const CONSENT_GIVEN_KEY = 'akunesia_share_account_consent_given';

    // Fungsi untuk memeriksa apakah semua checkbox sudah dicentang
    function checkAllCheckboxes() {
        let allChecked = true;
        consentCheckboxes.forEach(checkbox => {
            if (!checkbox.checked) {
                allChecked = false;
            }
        });
        continueBtn.disabled = !allChecked; // Aktifkan/nonaktifkan tombol
    }

    // Setiap kali modal consent ditampilkan
    if (consentModal) {
        consentModal.addEventListener('show.bs.modal', function () {
            const consentGivenInSession = sessionStorage.getItem(CONSENT_GIVEN_KEY);

            if (consentGivenInSession === 'true') {
                // Jika sudah disetujui, centang otomatis semua checkbox dan aktifkan tombol
                consentCheckboxes.forEach(checkbox => {
                    checkbox.checked = true;
                });
                continueBtn.disabled = false; // Pastikan tombol aktif
            } else {
                // Jika belum disetujui, reset checkbox dan nonaktifkan tombol
                consentCheckboxes.forEach(checkbox => {
                    checkbox.checked = false;
                });
                continueBtn.disabled = true; // Pastikan tombol nonaktif
            }
        });
    }

    // Tambahkan event listener ke setiap checkbox
    consentCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', checkAllCheckboxes);
    });

    // Tangani klik pada tombol "Lihat Detail" di tabel akun
    document.querySelectorAll('.btn-view-details').forEach(button => {
        button.addEventListener('click', function(event) {
            targetAccountModalId = this.dataset.accountModalId; // Simpan ID target

            // Tidak perlu lagi mencegat event default karena logika centang/aktif di handle di 'show.bs.modal'
            // Biarkan Bootstrap menampilkan consentModal seperti biasa
        });
    });

    // Ketika tombol "LANJUTKAN" di modal consent ditekan
    if (continueBtn) {
        continueBtn.addEventListener('click', function() {
            // Set tanda bahwa consent sudah diberikan di sesi ini HANYA JIKA tombol diaktifkan manual (belum otomatis)
            // Ini penting agar tidak menimpa status 'true' jika sudah otomatis tercentang
            if (!continueBtn.disabled) { // Pastikan tombol memang aktif saat diklik (baik manual centang atau otomatis)
                sessionStorage.setItem(CONSENT_GIVEN_KEY, 'true');
            }

            // Sembunyikan modal consent
            const bsConsentModal = bootstrap.Modal.getInstance(consentModal);
            if (bsConsentModal) {
                bsConsentModal.hide();
            }

            // Tampilkan modal detail akun yang sebelumnya disimpan
            if (targetAccountModalId) {
                const accountModalElement = document.querySelector(targetAccountModalId);
                if (accountModalElement) {
                    const bsAccountModal = new bootstrap.Modal(accountModalElement);
                    bsAccountModal.show();
                }
            }
        });
    }

    // Jika pengguna menutup modal consent tanpa menyetujui, reset targetModalId (opsional, tapi baik)
    if (consentModal) {
        consentModal.addEventListener('hidden.bs.modal', function () {
            // targetAccountModalId tidak perlu direset jika kita ingin mempertahankan target untuk kasus lain
            // Misalnya jika consent tidak mutlak diperlukan untuk melihat detail, tapi hanya untuk 'warning'.
            // Namun, untuk kasus Anda di mana detail akun baru bisa dilihat setelah consent,
            // tidak meresetnya tidak masalah karena logic akan tetap melewati consent.
        });
    }
});
// --- Akhir JavaScript untuk Inform Consent ---
// Function to copy text from input field
function copyFromInput(button) {
    const input = button.previousElementSibling;
    let textToCopy = '';

    if (input && (input.tagName === 'INPUT' || input.tagName === 'TEXTAREA')) {
        textToCopy = input.value;
    } else {
        textToCopy = input?.innerText || '';
    }

    if (!textToCopy) return;

    // Gunakan Clipboard API yang modern
    navigator.clipboard.writeText(textToCopy).then(() => {
        // Visual feedback
        button.classList.add('copied');
        const originalIcon = button.innerHTML;
        button.innerHTML = '<i class="fe fe-check"></i>';

        setTimeout(() => {
            button.innerHTML = originalIcon;
            button.classList.remove('copied');
        }, 1500);
    }).catch(err => {
        console.error('Gagal menyalin teks:', err);
        alert('❌ Gagal menyalin teks. Coba salin manual ya kak.');
    });
}
// Initialize tooltips when modal is shown
document.addEventListener('DOMContentLoaded', function() {
    const accountModals = document.querySelectorAll('.bottomsheet');
    
    accountModals.forEach(modal => {
        modal.addEventListener('shown.bs.modal', function () {
            const tooltips = modal.querySelectorAll('[data-bs-toggle="tooltip"]');
            tooltips.forEach(el => {
                new bootstrap.Tooltip(el);
            });
        });
        
        // Add swipe down to close functionality
        if (typeof Hammer !== 'undefined') {
            const hammertime = new Hammer(modal);
            hammertime.get('swipe').set({ direction: Hammer.DIRECTION_DOWN });
            
            hammertime.on('swipedown', function() {
                const modalInstance = bootstrap.Modal.getInstance(modal);
                if (modalInstance) modalInstance.hide();
            });
        }
        
        // Handle drag from drag handle
        const dragHandle = modal.querySelector('.modal-drag-handle');
        if (dragHandle) {
            dragHandle.addEventListener('touchstart', function(e) {
                this.setAttribute('data-touch-start-y', e.touches[0].clientY);
            });
            
            dragHandle.addEventListener('touchmove', function(e) {
                const startY = parseInt(this.getAttribute('data-touch-start-y')) || 0;
                const currentY = e.touches[0].clientY;
                
                if (currentY - startY > 50) {
                    const modalInstance = bootstrap.Modal.getInstance(modal);
                    if (modalInstance) modalInstance.hide();
                }
            });
        }
    });
});

