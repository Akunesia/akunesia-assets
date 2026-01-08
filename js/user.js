// ================== FEEDBACK MODAL + SEARCH ==================
window.onload = function () {
    if (typeof window.feedbackGiven !== 'undefined' && !window.feedbackGiven) {
        const feedbackEl = document.getElementById('feedbackModal');
        if (feedbackEl && typeof bootstrap !== 'undefined') {
            setTimeout(() => {
                new bootstrap.Modal(feedbackEl).show();
            }, 2000);
        }
    }

    const searchInput = document.getElementById('accountSearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', function () {
            const searchTerm = this.value.toLowerCase();
            document.querySelectorAll('#accountTable tbody tr').forEach(row => {
                const name = row.querySelector('.name-col')?.textContent.toLowerCase() || '';
                const category = row.querySelector('.category-col')?.textContent.toLowerCase() || '';
                row.style.display = (name.includes(searchTerm) || category.includes(searchTerm)) ? '' : 'none';
            });
        });
    }
};

// ================== PREVENT DOUBLE SUBMIT ==================
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

// ================== CONSENT MODAL ==================
document.addEventListener('DOMContentLoaded', function () {
    const consentModal = document.getElementById('consentModal');
    const continueBtn = document.getElementById('continueBtn');
    const consentCheckboxes = document.querySelectorAll('.consent-checkbox');

    if (!consentModal || !continueBtn || consentCheckboxes.length === 0) return;

    const CONSENT_GIVEN_KEY = 'akunesia_share_account_consent_given';
    let targetAccountModalId = '';

    function checkAllCheckboxes() {
        continueBtn.disabled = ![...consentCheckboxes].every(cb => cb.checked);
    }

    consentModal.addEventListener('show.bs.modal', function () {
        const consentGiven = sessionStorage.getItem(CONSENT_GIVEN_KEY) === 'true';
        consentCheckboxes.forEach(cb => cb.checked = consentGiven);
        continueBtn.disabled = !consentGiven;
    });

    consentCheckboxes.forEach(cb => cb.addEventListener('change', checkAllCheckboxes));

    document.querySelectorAll('.btn-view-details').forEach(btn => {
        btn.addEventListener('click', function () {
            targetAccountModalId = this.dataset.accountModalId || '';
        });
    });

    continueBtn.addEventListener('click', function () {
        if (!continueBtn.disabled) {
            sessionStorage.setItem(CONSENT_GIVEN_KEY, 'true');
        }

        bootstrap.Modal.getInstance(consentModal)?.hide();

        if (targetAccountModalId) {
            const targetModal = document.querySelector(targetAccountModalId);
            if (targetModal) {
                new bootstrap.Modal(targetModal).show();
            }
        }
    });
});

// ================== COPY TO CLIPBOARD ==================
function copyFromInput(button) {
    if (!button) return;

    const input = button.previousElementSibling;
    const text = input?.value || input?.innerText || '';
    if (!text) return;

    navigator.clipboard.writeText(text).then(() => {
        const original = button.innerHTML;
        button.innerHTML = '<i class="fe fe-check"></i>';
        setTimeout(() => button.innerHTML = original, 1500);
    }).catch(() => {
        alert('Gagal menyalin teks.');
    });
}

// ================== TOOLTIP + BOTTOMSHEET ==================
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.bottomsheet').forEach(modal => {
        modal.addEventListener('shown.bs.modal', function () {
            modal.querySelectorAll('[data-bs-toggle="tooltip"]').forEach(el => {
                new bootstrap.Tooltip(el);
            });
        });

        if (typeof Hammer !== 'undefined') {
            const hammer = new Hammer(modal);
            hammer.get('swipe').set({ direction: Hammer.DIRECTION_DOWN });
            hammer.on('swipedown', () => bootstrap.Modal.getInstance(modal)?.hide());
        }
    });
});
