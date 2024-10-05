# Vue3 + Live2d + Electron 开发的二次元桌面宠物



## 安装依赖

```powershell
npm install
```



## 项目运行

>浏览器运行
```powershell
npm run dev
```

>Electron桌面运行
```powershell
// 开发环境
npm run electron:dev
// 测试生产环境
npm run electron:pro
```

>Electron打包桌面应用
```powershell
npm run electron:build
// 打包后的应用程式在 dist_electronm
```



## 其他

由于本人现阶段使用Vue3较多，考虑到后期的扩展性，故使用Vue3框架进行开发，另外核心插件和模型都放在本地引入是为了满足离线也能正常运行的情况。