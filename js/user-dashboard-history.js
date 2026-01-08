document.addEventListener('DOMContentLoaded', function() {
    // Search functionality
    const searchInput = document.getElementById('historySearch');
    if (searchInput) {
        searchInput.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const cards = document.querySelectorAll('.history-card-item');
            let visibleCount = 0;
            
            cards.forEach(card => {
                const itemName = card.querySelector('.item-name').textContent.toLowerCase();
                const category = card.querySelector('.category-badge').textContent.toLowerCase();
                
                if (itemName.includes(searchTerm) || category.includes(searchTerm)) {
                    card.style.display = '';
                    visibleCount++;
                } else {
                    card.style.display = 'none';
                }
            });
            
            // Update pagination info
            const paginationInfo = document.querySelector('.pagination-info');
            if (paginationInfo && searchTerm) {
                paginationInfo.textContent = `Menampilkan ${visibleCount} data yang sesuai`;
            } else if (paginationInfo && !searchTerm) {
                const totalItems = paginationInfo.getAttribute('data-total');
                const currentPage = paginationInfo.getAttribute('data-page');
                const itemsPerPage = paginationInfo.getAttribute('data-per-page');
                const offset = (currentPage - 1) * itemsPerPage;
                const end = Math.min(parseInt(offset) + parseInt(itemsPerPage), totalItems);
                
                paginationInfo.textContent = `Menampilkan ${parseInt(offset)+1} - ${end} dari ${totalItems} data`;
            }
            
            // Hide pagination if searching
            const pagination = document.querySelector('.pagination');
            if (pagination) {
                pagination.style.display = searchTerm ? 'none' : 'flex';
            }
        });
    }
    
    // Filter tabs functionality
    const filterButtons = document.querySelectorAll('.filter-btn');
    if (filterButtons.length > 0) {
        filterButtons.forEach(button => {
            button.addEventListener('click', function() {
                const filter = this.getAttribute('data-filter');
                window.location.href = `?filter=${filter}`;
            });
        });
    }
});
