document.addEventListener('DOMContentLoaded', function () {
    // ==== SEARCH HANDLING ====
    const searchInput = document.getElementById('searchInput');
    const searchForm = document.getElementById('searchForm');
    
    if (searchInput && searchInput.value.trim() !== '') {
        const searchWrapper = searchInput.closest('.input-group');
        // Tambahkan pengecekan apakah wrapper ada
        if (searchWrapper) {
            const resetButton = document.createElement('button');
            resetButton.type = 'button';
            resetButton.className = 'search-reset';
            resetButton.innerHTML = '<i class="fe fe-x"></i>';
            resetButton.style.display = 'block';
            searchWrapper.style.position = 'relative';
            searchWrapper.appendChild(resetButton);
            
            resetButton.addEventListener('click', function() {
                const currentUrl = new URL(window.location.href);
                currentUrl.searchParams.delete('search');
                window.location.href = currentUrl.toString();
            });
        }
    }

    // ==== FILTER KATEGORI ====
    window.filterByKategori = function (kategori) {
        // Cari elemen saat fungsi dijalankan agar lebih akurat
        const currentSearchInput = document.getElementById('searchInput');
        const searchValue = currentSearchInput ? currentSearchInput.value.trim() : '';
        let url = 'produk.php';
        
        let params = new URLSearchParams();
        if (kategori) params.append('kategori', kategori);
        if (searchValue) params.append('search', searchValue);
        
        const queryString = params.toString();
        window.location.href = queryString ? url + '?' + queryString : url;
    };

    // ==== SWITCH VIEW ====
    const viewGrid = document.getElementById('view-grid');
    const viewList = document.getElementById('view-list');
    const productGrid = document.getElementById('productGrid');
    const productList = document.getElementById('productList');

    // Gunakan pengecekan semua elemen sebelum menjalankan fungsi switch
    if (viewGrid && viewList && productGrid && productList) {
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
});
