# Electron Sample App

読み込んだ画像をリサイズするElectronアプリ

Electronのドキュメントはこちら(日本語)
https://www.electronjs.org/ja/docs/latest/

## 使い方
```bash
git clone git@github.com:askdkc/electron-image-resize-app.git
cd electron-image-resize-app
npm i
npm start
```

## ネイティブアプリ作成
- macOS(ARM)
```bash
npm run package-mac
```
- Windows(64bit)
```bash
npm run package-win
```
- Linux(64bit)
```bash
npm run package-linux
```

`release-builds`配下にパッケージ化されたアプリが生成される

Electronのドキュメントは`electron-forge`を使えと書いてあるが、forgeはアプリがまともに動かなかったりビルドがコケるので`electron-packager`を使った方が幸せと思う

### サンプル画像

  <img width="366" alt="gazo-resize" src="https://github.com/user-attachments/assets/62fe2971-45b5-4671-8587-fe30e1e6cbbd">

