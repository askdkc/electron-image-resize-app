const path = require('path')
const os = require('os')
const { ipcRenderer } = require('electron')

const form = document.getElementById('image-form')
const slider = document.getElementById('slider')
const img = document.getElementById('img')

// When the user clicks the button, open the file dialog
document.getElementById('selectFileButton').addEventListener('click', (event) => {
    event.preventDefault()
    ipcRenderer.send('open-file-dialog')
});

// Receive the selected file path from the main process
ipcRenderer.on('selected-file', (event, filePath) => {
    document.getElementById('filePath').innerText = `選択したファイル:${filePath}`;
});

// get message from main process mainWindow.webContents.send('image:done', quality)
ipcRenderer.on('image:done', () => {
    M.toast({ html: `画像のリサイズが完了しました。品質：${slider.value}` })
})

document.getElementById('output-path').innerText = path.join(
    os.homedir(),
    'image-resized' // 出力先のディレクトリ
)

form.addEventListener('submit', (e) => {
    e.preventDefault()

    const imgPath = document.getElementById('filePath').innerText.replace("選択したファイル:", "")
    const quality = slider.value

    ipcRenderer.send('image:minimize', {
        imgPath,
        quality,
    })
})

