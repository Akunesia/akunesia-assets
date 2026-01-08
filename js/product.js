document.addEventListener('DOMContentLoaded', function () {
    // ==== SEARCH HANDLING ====
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    
    if (searchInput && searchInput.value.trim() !== '') {
        // Tambahkan tombol reset pencarian jika ada nilai pencarian
        const searchWrapper = searchInput.closest('.input-group');
        const resetButton = document.createElement('button');
        resetButton.type = 'button';
        resetButton.className = 'search-reset';
        resetButton.innerHTML = '<i class="fe fe-x"></i>';
        resetButton.style.display = 'block';
        searchWrapper.style.position = 'relative';
        searchWrapper.appendChild(resetButton);
        
        // Reset pencarian ketika tombol reset diklik
        resetButton.addEventListener('click', function() {
            // Hapus parameter search dari URL dan refresh halaman
            const currentUrl = new URL(window.location.href);
            currentUrl.searchParams.delete('search');
            window.location.href = currentUrl.toString();
        });
    }

    // ==== FILTER KATEGORI ====
    window.filterByKategori = function (kategori) {
        // Pertahankan parameter pencarian jika ada
        const searchValue = searchInput ? searchInput.value.trim() : '';
        let url = 'produk.php';
        
        // Tambahkan kategori jika dipilih
        if (kategori) {
            url += '?kategori=' + encodeURIComponent(kategori);
            // Tambahkan search jika ada
            if (searchValue) {
                url += '&search=' + encodeURIComponent(searchValue);
            }
        } else if (searchValue) {
            // Jika hanya ada pencarian tanpa kategori
            url += '?search=' + encodeURIComponent(searchValue);
        }
        
        window.location.href = url;
    };

    // ==== SWITCH VIEW ====
    const viewGrid = document.getElementById('view-grid');
    const viewList = document.getElementById('view-list');
    const productGrid = document.getElementById('productGrid');
    const productList = document.getElementById('productList');

    if (viewGrid && viewList) {
        viewGrid.addEventListener('click', function (e) {
            e.preventDefault();
            productGrid.classList.remove('d-none');
            productList.classList.add('d-none');
            viewGrid.classList.add('active');
            viewList.classList.remove('active');
            localStorage.setItem('productViewPreference', 'grid');
        });

        viewList.addEventListener('click', function (e) {
            e.preventDefault();
            productGrid.classList.add('d-none');
            productList.classList.remove('d-none');
            viewGrid.classList.remove('active');
            viewList.classList.add('active');
            localStorage.setItem('productViewPreference', 'list');
        });

        const savedView = localStorage.getItem('productViewPreference');
        if (savedView === 'list') {
            productGrid.classList.add('d-none');
            productList.classList.remove('d-none');
            viewGrid.classList.remove('active');
            viewList.classList.add('active');
        }
    }

  // ==== MODAL PRODUK ====
    const productModal = document.getElementById('productModal');
    if (productModal) {
        productModal.addEventListener('show.bs.modal', function (event) {
            const button = event.relatedTarget;
            const productId = button.getAttribute('data-id');
            const productName = button.getAttribute('data-name');
            const productPrice = button.getAttribute('data-price');
            const productCategory = button.getAttribute('data-category');
            const productDescription = button.getAttribute('data-description');
            const productImage = button.getAttribute('data-image');
            const productOriginalPrice = button.getAttribute('data-original-price');

            document.getElementById('modalProductName').textContent = productName;
            document.getElementById('modalProductPrice').textContent = 'Rp ' + productPrice;
            document.getElementById('modalProductCategory').textContent = productCategory;

            const desc = document.getElementById('modalProductDescription');
            desc.textContent = (productDescription && productDescription.trim() !== '') ? productDescription : 'Tidak ada deskripsi untuk produk ini.';

            const ori = document.getElementById('modalProductOriginalPrice');
            if (productOriginalPrice && productOriginalPrice.trim() !== '') {
                ori.textContent = 'Rp ' + productOriginalPrice;
                ori.style.display = 'block';
            } else {
                ori.style.display = 'none';
            }

            const image = document.getElementById('modalProductImage');
            image.innerHTML = (productImage && productImage.trim() !== '') ?
                `<img src="${productImage}" class="img-fluid rounded" alt="${productName}">` :
                `<div class="text-center py-5">
                    <i class="fe fe-image" style="font-size: 4rem; color: #ccc;"></i>
                    <p class="mt-2">Tidak ada gambar</p>
                </div>`;

            // === TOMBOL BELI ===
            const buyButton = document.getElementById('buyProductBtn');
            if (buyButton) {
                buyButton.setAttribute('data-product-id', productId);
                buyButton.onclick = function () {
                    // Tampilkan loading pada tombol
                    const originalText = buyButton.innerHTML;
                    buyButton.disabled = true;
                    buyButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Menambahkan...';
                    
                    fetch('add_to_cart', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: 'product_id=' + productId + '&quantity=1'
                    })
                    .then(res => res.json())
                    .then(data => {
                        if (data.success) {
                            // Ganti teks tombol dengan indikator sukses
                            buyButton.innerHTML = '<i class="fe fe-check-circle me-1"></i> Berhasil Ditambahkan';
                            buyButton.classList.remove('btn-primary');
                            buyButton.classList.add('btn-success');
                            
                            setTimeout(() => {
                                // Tutup modal
                                const modal = bootstrap.Modal.getInstance(productModal);
                                if (modal) modal.hide();
                                
                                // Reset tombol setelah modal tertutup
                                setTimeout(() => {
                                    buyButton.innerHTML = originalText;
                                    buyButton.disabled = false;
                                    buyButton.classList.remove('btn-success');
                                    buyButton.classList.add('btn-primary');
                                }, 300);
                            }, 1000);
                        
                            // Update badge
                            const badge = document.getElementById('cartCounter');
                            if (badge) {
                                badge.textContent = data.cartCount;
                                badge.style.display = data.cartCount > 0 ? 'block' : 'none';
                            }
                        
                            // ✅ Update isi dropdown keranjang
                            updateCartDropdown();
                        } else {
                            // Reset tombol jika error
                            buyButton.innerHTML = originalText;
                            buyButton.disabled = false;
                            alert(data.message || 'Gagal menambahkan produk ke keranjang');
                        }
                    })
                    .catch(err => {
                        console.error('Error:', err);
                        buyButton.innerHTML = originalText;
                        buyButton.disabled = false;
                        alert('Terjadi kesalahan saat menambahkan ke keranjang');
                    });
                };
            }
        });
    }

    console.log("Cart dropdown handling script loaded");

  // ==== FUNGSI: Cegah dropdown tertutup saat klik tombol di dalamnya ====
    const cartDropdownMenu = document.querySelector('.dropdown-menu.cart-dropdown');
    if (cartDropdownMenu) {
        // Mencegah dropdown tertutup saat mengklik di dalam dropdown
        cartDropdownMenu.addEventListener('click', function(e) {
            // Hanya mencegah jika klik pada tombol +/- atau hapus
            if (e.target.closest('[data-action]') || e.target.closest('[data-remove-cart-id]')) {
                e.stopPropagation();
            }
        });
    }

    // ==== FUNGSI: Update isi dropdown keranjang tanpa menutupnya ====
    function updateCartDropdown() {
        // Gunakan URL tanpa .php karena URL rewriting
        fetch('cart_dropdown')
            .then(res => res.text())
            .then(html => {
                const dropdownMenu = document.querySelector('.dropdown-menu.cart-dropdown');
                if (dropdownMenu) {
                    // Simpan status dropdown (terbuka/tertutup)
                    const isDropdownOpen = dropdownMenu.classList.contains('show');
                    
                    // Update konten dropdown
                    dropdownMenu.innerHTML = html;
                    
                    // Atur kembali handler events
                    attachQtyButtons();
                    attachRemoveCartEvents();
                    
                    // Pastikan dropdown tetap terbuka jika sebelumnya terbuka
                    if (isDropdownOpen) {
                        dropdownMenu.classList.add('show');
                    }
                }
            })
            .catch(err => {
                console.error("Failed to update cart dropdown:", err);
            });
    }

// ==== FUNGSI: Tombol + dan - quantity ====
    function attachQtyButtons() {
        document.querySelectorAll('[data-action]').forEach(btn => {
            btn.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation(); // Mencegah event bubbling yang bisa menutup dropdown
                
                const cartId = this.getAttribute('data-cart-id');
                const action = this.getAttribute('data-action');

                if (!cartId) {
                    console.error("No cart ID found for quantity button");
                    return;
                }

                // Tambahkan efek loading pada tombol
                const originalHTML = this.innerHTML;
                this.disabled = true;
                
                if (action === "plus") {
                    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                } else if (action === "minus") {
                    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                }

                // Ubah URL tanpa .php
                const xhr = new XMLHttpRequest();
                xhr.open('POST', 'update_cart_qty', true);
                xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
                
                xhr.onload = function() {
                    try {
                        const data = JSON.parse(this.responseText);
                        if (data.success) {
                            const badge = document.getElementById('cartCounter');
                            if (badge) {
                                badge.textContent = data.cartCount;
                                badge.style.display = data.cartCount > 0 ? 'block' : 'none';
                            }
                            updateCartDropdown();
                        } else {
                            alert(data.message || 'Gagal update qty.');
                            btn.innerHTML = originalHTML;
                            btn.disabled = false;
                        }
                    } catch (e) {
                        console.error("Error parsing response:", e);
                        btn.innerHTML = originalHTML;
                        btn.disabled = false;
                    }
                };
                
                xhr.onerror = function() {
                    console.error("Network error during quantity update");
                    btn.innerHTML = originalHTML;
                    btn.disabled = false;
                };
                
                xhr.send('cart_id=' + encodeURIComponent(cartId) + '&action=' + encodeURIComponent(action));
            });
        });
    }

    // ==== FUNGSI: Hapus item dari cart ====
    function attachRemoveCartEvents() {
        document.querySelectorAll('[data-remove-cart-id]').forEach(el => {
            el.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation(); // Mencegah event bubbling yang bisa menutup dropdown
                
                const cartId = this.getAttribute('data-remove-cart-id');
                if (!cartId) {
                    console.error("No cart ID found for remove button");
                    return;
                }
                
                if (confirm("Yakin ingin menghapus item ini dari keranjang?")) {
                    // Tambahkan efek loading
                    const originalHTML = this.innerHTML;
                    this.disabled = true;
                    this.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>';
                    
                    removeCartItem(cartId, this, originalHTML);
                }
            });
        });
    }
  function removeCartItem(cartId, button, originalHTML) {
        // Ubah URL tanpa .php
        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'remove_from_cart', true);
        xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        
        xhr.onload = function() {
            try {
                const data = JSON.parse(this.responseText);
                if (data.success) {
                    const badge = document.getElementById('cartCounter');
                    if (badge) {
                        badge.textContent = data.cartCount;
                        badge.style.display = data.cartCount > 0 ? 'block' : 'none';
                    }
                    updateCartDropdown();
                } else {
                    alert('Gagal menghapus item dari keranjang.');
                    if (button) {
                        button.innerHTML = originalHTML;
                        button.disabled = false;
                    }
                }
            } catch (e) {
                console.error("Error parsing response:", e);
                if (button) {
                    button.innerHTML = originalHTML;
                    button.disabled = false;
                }
            }
        };
        
        xhr.onerror = function() {
            console.error("Network error during remove from cart");
            alert('Terjadi kesalahan saat menghapus.');
            if (button) {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }
        };
        
        xhr.send('cart_id=' + encodeURIComponent(cartId));
    }

    // Inisialisasi
    attachQtyButtons();
    attachRemoveCartEvents();
});
