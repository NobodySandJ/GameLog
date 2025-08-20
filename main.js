// main.js

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(app.getPath('userData'), 'games.json');

// Deklarasikan mainWindow di sini agar bisa diakses secara global
let mainWindow;

function createWindow() {
  // Gunakan variabel global yang sudah dideklarasikan
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js') 
    }
  });

  mainWindow.loadFile('index.html');

  // Set mainWindow menjadi null saat ditutup untuk garbage collection
  mainWindow.on('closed', () => mainWindow = null);
}

app.whenReady().then(() => {
  createWindow();
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Listener IPC

ipcMain.on('open-add-window', () => {
  const addWindow = new BrowserWindow({
    width: 600,
    height: 750,
    title: 'Tambah Game Baru',
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  addWindow.loadFile('add.html');
});

ipcMain.on('open-edit-window', (event, game) => {
  const editWindow = new BrowserWindow({
    width: 600,
    height: 750,
    title: 'Edit Game',
    parent: mainWindow,
    modal: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  });
  editWindow.loadFile('edit.html');
  editWindow.webContents.on('did-finish-load', () => {
    editWindow.webContents.send('game-data-for-edit', game);
  });
});

ipcMain.on('add-game', (event, newGame) => {
    let games = [];
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        games = JSON.parse(data);
    } catch (err) {}
    games.push(newGame);
    fs.writeFileSync(dbPath, JSON.stringify(games, null, 2));

    if(mainWindow) {
        mainWindow.webContents.send('update-games', games);
    }
    BrowserWindow.fromWebContents(event.sender).close();
});

ipcMain.on('update-game', (event, updatedGame) => {
    let games = [];
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        games = JSON.parse(data);
    } catch (err) { return; }

    const gameIndex = games.findIndex(g => g.id === updatedGame.id);
    if (gameIndex !== -1) {
        games[gameIndex] = { ...games[gameIndex], ...updatedGame };
        fs.writeFileSync(dbPath, JSON.stringify(games, null, 2));
        if(mainWindow) {
            mainWindow.webContents.send('update-games', games);
        }
    }
    BrowserWindow.fromWebContents(event.sender).close();
});

ipcMain.on('get-initial-data', (event) => {
    let games = [];
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        games = JSON.parse(data);
    } catch (err) {}
    event.sender.send('update-games', games);
});

// BARU: Listener untuk menghapus game
ipcMain.on('delete-game', (event, gameId) => {
    let games = [];
    try {
        const data = fs.readFileSync(dbPath, 'utf8');
        games = JSON.parse(data);
    } catch (err) { return; }

    const updatedGames = games.filter(g => g.id !== gameId);

    fs.writeFileSync(dbPath, JSON.stringify(updatedGames, null, 2));

    if (mainWindow) {
        mainWindow.webContents.send('update-games', updatedGames);
    }
    BrowserWindow.fromWebContents(event.sender).close();
});