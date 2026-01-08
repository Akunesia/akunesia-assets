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

});
