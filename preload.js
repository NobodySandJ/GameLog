// preload.js
const { contextBridge, ipcRenderer } = require('electron');

// Mengekspos (expose) fungsi tertentu ke Renderer Process (UI)
// dengan cara yang aman.
contextBridge.exposeInMainWorld('electronAPI', {
  // Fungsi untuk mengirim pesan dari UI ke Main Process
  send: (channel, data) => ipcRenderer.send(channel, data),
  // Fungsi untuk menerima pesan dari Main Process ke UI
  on: (channel, func) => {
    ipcRenderer.on(channel, (event, ...args) => func(...args));
  }
});