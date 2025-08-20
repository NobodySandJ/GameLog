// renderer.js

// Variabel global untuk menyimpan semua data game
let allGames = [];

// Ambil elemen filter
const platformFilter = document.getElementById('platform-filter');

document.addEventListener('DOMContentLoaded', () => {
    window.electronAPI.send('get-initial-data');
});

document.getElementById('add-game-btn').addEventListener('click', () => {
    window.electronAPI.send('open-add-window');
});

// Listener untuk event 'change' pada dropdown filter
platformFilter.addEventListener('change', () => {
    const selectedPlatform = platformFilter.value;
    filterAndRenderGames(selectedPlatform);
});

// Listener untuk menerima data game terbaru dari main.js
window.electronAPI.on('update-games', (games) => {
    allGames = games; // Simpan data asli ke variabel global
    const selectedPlatform = platformFilter.value; // Dapatkan nilai filter saat ini
    filterAndRenderGames(selectedPlatform); // Terapkan filter yang aktif
    updateStatistics(allGames); // Statistik selalu dihitung dari semua game
});

// Fungsi baru untuk memfilter dan me-render game
function filterAndRenderGames(platform) {
    let filteredGames = allGames;

    if (platform !== 'all') {
        filteredGames = allGames.filter(game => game.platform === platform);
    }

    renderGames(filteredGames); // Panggil fungsi render dengan data yang sudah difilter
}

function renderGames(gamesToRender) {
    const gameList = document.getElementById('game-list');
    gameList.innerHTML = ''; 

    if (!gamesToRender || gamesToRender.length === 0) {
        gameList.innerHTML = '<p>Tidak ada game yang cocok dengan filter ini.</p>';
        return;
    }

    gamesToRender.forEach(game => {
        const card = document.createElement('div');
        card.className = 'game-card';

        let stars = '☆'.repeat(5);
        if (game.rating > 0) {
            stars = '★'.repeat(game.rating) + '☆'.repeat(5 - game.rating);
        }
        
        card.innerHTML = `
            <img src="${game.coverImage}" alt="${game.title}" style="aspect-ratio: 1 / 1; object-fit: cover;">
            <div class="game-info">
                <h3>${game.title}</h3>
                <p><strong>Platform:</strong> ${game.platform}</p>
                <p><strong>Playtime:</strong> ${game.playtime} jam</p>
                <p><strong>Rating:</strong> ${stars}</p>
            </div>
        `;
        card.addEventListener('click', () => {
            // Kita kirim data game dari 'allGames' untuk memastikan data yang dikirim lengkap
            const originalGameData = allGames.find(g => g.id === game.id);
            window.electronAPI.send('open-edit-window', originalGameData);
        });
        gameList.appendChild(card);
    });
}

function updateStatistics(games) {
    const totalPlaytime = games.reduce((sum, game) => sum + (game.playtime || 0), 0);
    const totalPurchase = games.reduce((sum, game) => sum + (game.purchasePrice || 0), 0);
    const totalMicro = games.reduce((sum, game) => sum + (game.microtransaction || 0), 0);

    document.getElementById('total-playtime').textContent = `${totalPlaytime} jam`;
    document.getElementById('total-purchase').textContent = `Rp ${totalPurchase.toLocaleString('id-ID')}`;
    document.getElementById('total-microtransaction').textContent = `Rp ${totalMicro.toLocaleString('id-ID')}`;
    document.getElementById('total-spent').textContent = `Rp ${(totalPurchase + totalMicro).toLocaleString('id-ID')}`;
}