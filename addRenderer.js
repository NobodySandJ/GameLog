// addRenderer.js

const form = document.getElementById('add-game-form');

// Fungsi untuk mengubah file gambar menjadi format Base64 (teks)
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

    const title = document.getElementById('title').value;
    const platform = document.getElementById('platform').value;
    const playtime = parseInt(document.getElementById('playtime').value) || 0;
    const purchasePrice = parseInt(document.getElementById('purchasePrice').value) || 0;
    const microtransaction = parseInt(document.getElementById('microtransaction').value) || 0;
    const imageFile = document.getElementById('coverImage').files[0];
    
    const ratingElement = document.querySelector('input[name="rating"]:checked');
    const rating = ratingElement ? parseInt(ratingElement.value) : 0;

    if (!imageFile) {
        alert('Tolong pilih sebuah gambar cover!');
        return;
    }

    const coverImage = await imageToBase64(imageFile);

    const gameData = {
        id: Date.now(),
        title,
        platform,
        playtime,
        purchasePrice,
        microtransaction,
        rating,
        coverImage
    };

    window.electronAPI.send('add-game', gameData);
});
// Kurung kurawal berlebih yang ada di sini sudah dihapus