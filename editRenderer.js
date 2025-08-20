// editRenderer.js

const form = document.getElementById('add-game-form');
let currentGame = null;

window.electronAPI.on('game-data-for-edit', (game) => {
    currentGame = game;
    document.getElementById('title').value = game.title;
    document.getElementById('platform').value = game.platform;
    document.getElementById('playtime').value = game.playtime;
    document.getElementById('purchasePrice').value = game.purchasePrice;
    document.getElementById('microtransaction').value = game.microtransaction;
    
    if (game.rating) {
        document.getElementById(`star${game.rating}`).checked = true;
    }
});

function imageToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}

form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const imageFile = document.getElementById('coverImage').files[0];
    
    const updatedGameData = {
        id: currentGame.id,
        title: document.getElementById('title').value,
        platform: document.getElementById('platform').value,
        playtime: parseInt(document.getElementById('playtime').value) || 0,
        purchasePrice: parseInt(document.getElementById('purchasePrice').value) || 0,
        microtransaction: parseInt(document.getElementById('microtransaction').value) || 0,
        rating: parseInt(document.querySelector('input[name="rating"]:checked')?.value) || 0,
    };

    if(imageFile) {
        updatedGameData.coverImage = await imageToBase64(imageFile);
    }

    window.electronAPI.send('update-game', updatedGameData);
});

// BARU: Listener untuk tombol hapus
const deleteBtn = document.getElementById('delete-btn');

deleteBtn.addEventListener('click', () => {
    const isConfirmed = confirm(`Apakah Anda yakin ingin menghapus game "${currentGame.title}"?`);

    if (isConfirmed && currentGame) {
        window.electronAPI.send('delete-game', currentGame.id);
    }
});