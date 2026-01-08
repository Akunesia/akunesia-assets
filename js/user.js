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

