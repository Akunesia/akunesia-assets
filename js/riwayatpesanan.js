document.addEventListener('DOMContentLoaded', function () {

    // ================= ORDER ITEM HOVER =================
    document.querySelectorAll('.order-item').forEach(item => {
        item.addEventListener('mouseenter', () => {
            item.style.transform = 'translateY(-4px)';
        });
        item.addEventListener('mouseleave', () => {
            item.style.transform = 'translateY(0)';
        });
    });

    // ================= DETAIL BUTTON =================
    document.querySelectorAll('.btn-detail').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault();
            const orderToken = this.getAttribute('data-order-token');
            if (orderToken) {
                showOrderDetail(orderToken);
            }
        });
    });

    // ================= SWIPE TO CLOSE =================
    const modalElement = document.getElementById('orderDetailModal');
    if (typeof Hammer !== 'undefined' && modalElement) {
        const hammertime = new Hammer(modalElement);
        hammertime.get('swipe').set({ direction: Hammer.DIRECTION_DOWN });

        hammertime.on('swipedown', function () {
            const modal = bootstrap.Modal.getInstance(modalElement);
            if (modal) modal.hide();
        });

        const modalHeader = modalElement.querySelector('.modal-header');
        if (modalHeader) {
            modalHeader.addEventListener('touchstart', function (e) {
                this.dataset.touchStartY = e.touches[0].clientY;
            });

            modalHeader.addEventListener('touchmove', function (e) {
                const startY = parseInt(this.dataset.touchStartY || '0');
                if (e.touches[0].clientY - startY > 50) {
                    const modal = bootstrap.Modal.getInstance(modalElement);
                    if (modal) modal.hide();
                }
            });
        }
    }
});

// ================= SHOW ORDER DETAIL =================
function showOrderDetail(orderToken) {
    const modalElement = document.getElementById('orderDetailModal');
    const contentElement = document.getElementById('orderDetailContent');

    if (!modalElement || !contentElement || !orderToken) return;

    contentElement.innerHTML = `
        <div class="loader text-center py-4">
            <div class="spinner-border text-primary" role="status"></div>
            <p class="mt-2">Memuat data...</p>
        </div>
    `;

    modalElement.style.display = 'block';

    setTimeout(() => {
        const modal = new bootstrap.Modal(modalElement);
        modal.show();

        fetch('get_order_detail.php?order_token=' + encodeURIComponent(orderToken))
            .then(res => res.json())
            .then(data => {
                if (data.success && data.html) {
                    contentElement.innerHTML = data.html;

                    const content = contentElement.firstElementChild;
                    if (content) {
                        content.style.opacity = '0';
                        content.style.transform = 'translateY(20px)';
                        content.style.transition = 'opacity .3s ease, transform .3s ease';

                        requestAnimationFrame(() => {
                            content.style.opacity = '1';
                            content.style.transform = 'translateY(0)';
                        });
                    }
                } else {
                    contentElement.innerHTML = `
                        <div class="alert alert-danger">
                            <i class="fe fe-alert-circle me-2"></i>
                            ${data.message || 'Gagal mengambil detail pesanan.'}
                        </div>
                    `;
                }
            })
            .catch(() => {
                contentElement.innerHTML = `
                    <div class="alert alert-danger">
                        <i class="fe fe-alert-circle me-2"></i>
                        Terjadi kesalahan saat mengambil detail pesanan.
                    </div>
                `;
            });
    }, 10);
}
