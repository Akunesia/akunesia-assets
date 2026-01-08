<!-- Custom JS for Leaderboard -->
  
// Safely pass user ID
const ldbCurrentUserId = window.ldbCurrentUserId;

// Format number with thousand separator
function ldbFormatNumber(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// Get first character for avatar
function ldbGetAvatarLetter(text) {
    if (!text || typeof text !== 'string' || text.length === 0) return '?';
    return text.charAt(0).toUpperCase();
}

// Fetch leaderboard data
function ldbFetchLeaderboard() {
    // Show loading
    document.getElementById('ldb-loading').style.display = 'flex';
    document.getElementById('ldb-error').style.display = 'none';
    document.getElementById('ldb-rankings').style.display = 'none';
    
    // Timestamp to prevent caching
    const timestamp = new Date().getTime();
    const apiUrl = 'api/leaderboard_point_api.php?t=' + timestamp;
    
    console.log('Fetching leaderboard data...');
    
    fetch(apiUrl)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            document.getElementById('ldb-loading').style.display = 'none';
            console.log('Leaderboard data received:', data);
            
            if (data.status === 'success' && data.leaderboard && data.leaderboard.length > 0) {
                // Sort by total_point (descending) if not already sorted
                const sortedData = [...data.leaderboard].sort((a, b) => b.total_point - a.total_point);
                
                // Render top 3
                renderTop3(sortedData.slice(0, 3));
                
                // Render positions 4-10
                renderOtherRankings(sortedData.slice(3, 10));
                
                // Find current user position
                const userPosition = findUserPosition(sortedData, ldbCurrentUserId);
                if (userPosition.found) {
                    renderUserPosition(userPosition);
                    document.getElementById('ldb-user-position').style.display = 'block';
                }
                
                // Show the rankings container
                document.getElementById('ldb-rankings').style.display = 'block';
                
                // Start countdown for refresh
                resetCountdown();
            } else {
                document.getElementById('ldb-error').style.display = 'block';
                document.getElementById('ldb-error-message').textContent = 
                    'Tidak ada data leaderboard yang tersedia';
            }
        })
        .catch(error => {
            document.getElementById('ldb-loading').style.display = 'none';
            document.getElementById('ldb-error').style.display = 'block';
            document.getElementById('ldb-error-message').textContent = 
                'Gagal mengambil data: ' + error.message;
            console.error('Error fetching data:', error);
        });
}

// Find current user position
function findUserPosition(leaderboardData, userId) {
    for (let i = 0; i < leaderboardData.length; i++) {
        if (leaderboardData[i].user_id == userId) {
            return {
                found: true,
                position: i + 1,
                data: leaderboardData[i]
            };
        }
    }
    return { found: false };
}

// Render top 3 rankings
function renderTop3(top3Users) {
    const container = document.getElementById('ldb-top-rankings');
    container.innerHTML = '';
    
    const medals = ['🥇', '🥈', '🥉'];
    
    top3Users.forEach((user, index) => {
        const rankNum = index + 1;
        const avatarLetter = ldbGetAvatarLetter(user.phone);
        
        const card = document.createElement('div');
        card.className = `ldb-ranking-card ldb-rank-${rankNum}`;
        
        card.innerHTML = `
            <div class="ldb-rank">#${rankNum}</div>
            <div class="ldb-avatar ldb-rank-${rankNum}">${avatarLetter}</div>
            <div class="ldb-info">
                <div class="ldb-phone">${user.phone || '-'}</div>
                <div class="ldb-points">${ldbFormatNumber(user.total_point)} Poin</div>
            </div>
            <div class="ldb-medal">${medals[index]}</div>
        `;
        
        container.appendChild(card);
    });
}

// Render other rankings (4-10)
function renderOtherRankings(users) {
    const container = document.getElementById('ldb-other-rankings');
    container.innerHTML = '';
    
    users.forEach((user, index) => {
        const rankNum = index + 4; // Starting from rank 4
        const avatarLetter = ldbGetAvatarLetter(user.phone);
        const isCurrentUser = user.user_id == ldbCurrentUserId;
        
        const card = document.createElement('div');
        card.className = `ldb-ranking-card ${isCurrentUser ? 'ldb-current-user' : ''}`;
        
        card.innerHTML = `
            <div class="ldb-rank">#${rankNum}</div>
            <div class="ldb-avatar ldb-rank-other">${avatarLetter}</div>
            <div class="ldb-info">
                <div class="ldb-phone">${user.phone || '-'}</div>
                <div class="ldb-points">${ldbFormatNumber(user.total_point)} Poin</div>
            </div>
        `;
        
        container.appendChild(card);
    });
    
    // If no users to display
    if (users.length === 0) {
        container.innerHTML = '<div class="ldb-empty">Tidak ada data tambahan</div>';
    }
}

// Render user position
function renderUserPosition(position) {
    const container = document.getElementById('ldb-user-position');
    const user = position.data;
    const avatarLetter = ldbGetAvatarLetter(user.phone);
    
    // Calculate percentage text
    let percentageText = '';
    if (position.position === 1) {
        percentageText = 'Top 10%';
    } else if (position.position <= 10) {
        percentageText = `Top ${position.position * 10}%`;
    } else {
        percentageText = `Top ${Math.round((position.position / 10) * 100)}%`;
    }
    
    container.innerHTML = `
        <div class="ldb-user-position">${position.position}</div>
        <div class="ldb-user-avatar">${avatarLetter}</div>
        <div class="ldb-user-content">
            <div class="ldb-user-label">Anda</div>
            <div class="ldb-user-phone">${user.phone}</div>
            <div class="ldb-user-points">${ldbFormatNumber(user.total_point)} Poin</div>
        </div>
        <div class="ldb-user-status">${percentageText}</div>
    `;
}

// Countdown timer untuk 6 jam
let ldbCountdownInterval;
function resetCountdown() {
    clearInterval(ldbCountdownInterval);
    
    // Hitung kapan terakhir kali diperbarui
    const lastUpdate = localStorage.getItem('ldb_last_update');
    const now = new Date().getTime();
    
    if (lastUpdate) {
        const timeDiff = now - parseInt(lastUpdate);
        const sixHoursInMs = 6 * 60 * 60 * 1000; // 6 jam dalam milidetik
        
        // Jika terakhir diperbarui kurang dari 6 jam yang lalu
        if (timeDiff < sixHoursInMs) {
            // Hitung waktu tersisa sampai pembaruan berikutnya
            const timeRemaining = sixHoursInMs - timeDiff;
            console.log(`Pembaruan berikutnya dalam ${Math.floor(timeRemaining / 3600000)} jam ${Math.floor((timeRemaining % 3600000) / 60000)} menit`);
            
            // Set auto-refresh untuk waktu yang tersisa
            setTimeout(() => {
                ldbFetchLeaderboard();
            }, timeRemaining);
            
            return;
        }
    }
    
    // Jika belum pernah diperbarui atau sudah lebih dari 6 jam
    localStorage.setItem('ldb_last_update', now.toString());
    
    // Jadwalkan refresh berikutnya dalam 6 jam
    setTimeout(() => {
        ldbFetchLeaderboard();
    }, 6 * 60 * 60 * 1000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Loading leaderboard...');
    ldbFetchLeaderboard();
    
    // Filter buttons functionality
    document.querySelectorAll('.ldb-filter-btn').forEach(button => {
        button.addEventListener('click', function() {
            document.querySelectorAll('.ldb-filter-btn').forEach(btn => {
                btn.classList.remove('ldb-active');
            });
            this.classList.add('ldb-active');
            ldbFetchLeaderboard();
        });
    });
});
