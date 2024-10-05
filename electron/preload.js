// preload.js

const { contextBridge, ipcRenderer } = require('electron')

// 所有Node.js API都可以在预加载过程中使用。
// 它拥有与Chrome扩展一样的沙盒。
window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
})

contextBridge.exposeInMainWorld("electron", {
    getScreen: () => ipcRenderer.sendSync('getScreen'), // 获取屏幕信息
    getMainPoint: () => ipcRenderer.sendSync('getMainPoint'), // 获取当前窗口位置
    dragMain: (mouseOnPage) => ipcRenderer.send('dragMain', mouseOnPage), // 拖动窗口
    getCursorScreenPoint: () => ipcRenderer.sendSync('getCursorScreenPoint')

});