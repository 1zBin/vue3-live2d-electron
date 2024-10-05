const electron = require("electron");

//electron app
const app = electron.app;
//electron窗口
const BrowserWindow = electron.BrowserWindow;
//electron ipc通讯 主进程
const ipcMain = electron.ipcMain;
//electron 菜单
const Menu = electron.Menu;
//electron 系统托盘
const Tray = electron.Tray;
//electron screen
const screen = electron.screen;

const path = require("path");

const NODE_ENV = process.env.NODE_ENV;

//主窗口对象
var mainWindow = null;
//系统托盘对象
var appTray = null;

function createWindow() {
  // 获取主显示器的工作区尺寸
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  // 创建浏览器窗口
  mainWindow = new BrowserWindow({
    x: width - 250,
    y: height - 325,
    width: 250,
    height: 325,
    frame: false, //去掉窗口边框和标题栏
    // backgroundColor: "#fff",     //背景色
    //窗体透明属性，实际使用时发现如果窗体一部分，从拐角移出屏幕，再移回来，移出去的透明部分会变黑色
    //如果把整个窗体全染黑，就会回归透明，并且不会再出现染黑现象，原因不明，解决方法不明
    transparent: true, //窗口透明
    skipTaskbar: true, //任务栏不显示图标
    resizable: false, //是否允许改变窗口尺寸
    alwaysOnTop: true, //窗口是否总是在最前端
    webPreferences: {
      preload: path.join(__dirname, "preload.js"), // 确保路径正确
      contextIsolation: true, // 建议启用
      enableRemoteModule: false, // 不推荐使用
      nodeIntegration: false, // 确保为 false
    },
  });

  // 加载 index.html
  mainWindow.loadURL(
    NODE_ENV === "development"
      ? "http://localhost:47281"
      : `file://${path.join(__dirname, "../dist/index.html")}`
  );

  //关闭窗口时初始化主窗口(避免浪费内存)
  //监听到closed事件后执行
  mainWindow.on("closed", () => {
    mainWindow = null;
  });

  // 打开开发工具
  if (NODE_ENV === "development") {
    mainWindow.webContents.openDevTools();
  }

  //系统托盘右键菜单
  var trayMenuTemplate = [
    // {
    //     label: '设置',
    //     click: function () {
    //     }
    // },
    {
      label: "关于",
      click: function () {
        //弹出一个窗口，内容为作品，作者描述
        // 创建一个新的窗口以显示关于信息
        const aboutWindow = new BrowserWindow({
          width: 350,
          height: 140,
          frame: false, // 允许窗口边框
          resizable: false, //是否允许改变窗口尺寸
          alwaysOnTop: true, //窗口是否总是在最前端
          webPreferences: {
            contextIsolation: true,
            enableRemoteModule: false,
            nodeIntegration: false,
          },
        });

        // 加载内容，可以是一个 HTML 文件，或者直接注入 HTML
        aboutWindow.loadURL(`data:text/html;charset=utf-8,
                 <html>
                    <head>
                        <style>
                            .about {
                                width: 100%;
                                height: 100%;
                                display: flex;
                                flex-direction: column; /* 设置为列方向 */
                                align-items: center; /* 水平居中 */
                            }
                            .title {
                                line-height: 0.2;
                            }
                            .closeBtn {
                                align-self: self-end;
                                cursor: pointer; /* 鼠标悬停时显示手型 */
                            }
                        </style>
                    </head>
                    <body>
                        <div class="about">
                            <h2 class="title">关于</h2>
                            <p class="content">智能桌宠1.0.0，萌宠陪伴，增添桌面乐趣！</p>
                            <button class="closeBtn" onclick="window.close()">关闭</button>
                        </div>
                    </body>
                </html>`);
      },
    },
    {
      label: "退出",
      click: function () {
        //退出程序
        app.quit();
      },
    },
  ];

  //系统托盘图标目录
  appTray = new Tray(path.join(__dirname, "./image/icon.ico"));
  //设置此托盘图标的悬停提示内容
  appTray.setToolTip("这是个系统托盘");
  //图标的上下文菜单
  const contextMenu = Menu.buildFromTemplate(trayMenuTemplate);
  //设置此图标的上下文菜单
  appTray.setContextMenu(contextMenu);
}

// ipc监听，获取屏幕信息
ipcMain.on("getScreen", (event) => {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;
  event.returnValue = { width, height }; // 返回屏幕尺寸
});

//ipc监听，拖拽主窗体
ipcMain.on("dragMain", (_event, mouseOnPage) => {
  //1.获取鼠标新位置
  const { x, y } = screen.getCursorScreenPoint();
  // console.log("鼠标新左键坐标:" + x + " " + y)
  // console.log("接收鼠标相对于窗口坐标:" + mouseOnPage[0] + " " + mouseOnPage[1])

  //2.计算窗口新坐标
  const pos = mainWindow.getPosition();
  let newWinPointX = x - mouseOnPage[0];
  let newWinPointY = y - mouseOnPage[1];

  //3.禁止超出屏幕
  //获取桌面大小
  let size = screen.getPrimaryDisplay().workAreaSize;
  // console.log(size)
  //获取窗口大小
  let winSize = mainWindow.getSize();
  //窗口四个代表性边缘坐标值
  //上边
  let winPoint_up_y = newWinPointY;
  //下边
  let winPoint_down_y = newWinPointY + winSize[1];
  //左边
  let winPoint_left_x = newWinPointX;
  //右边
  let winPoint_right_x = newWinPointX + winSize[0];

  //窗口上方超出屏幕，重置Y为0
  if (winPoint_up_y < 0) {
    newWinPointY = 0;
  }
  //窗口下方超出屏幕，重置Y为 屏幕高度最大值 - 窗口高度
  if (winPoint_down_y > size.height) {
    newWinPointY = size.height - winSize[1];
  }
  //窗口左边超出屏幕，重置X为0
  if (winPoint_left_x < 0) {
    newWinPointX = 0;
  }
  //窗口左边超出屏幕，重置X为 屏幕长度最大值 - 窗口长度
  if (winPoint_right_x > size.width) {
    newWinPointX = size.width - winSize[0];
  }

  //4.移动窗口
  mainWindow.setPosition(newWinPointX, newWinPointY);
  mainWindow.transparent = true;
});

// ipc监听,获取鼠标相对于屏幕的坐标
ipcMain.on("getCursorScreenPoint", (event) => {
  const { x, y } = screen.getCursorScreenPoint();
  event.returnValue = { x, y }; // 返回鼠标坐标
});

//ipc监听，获取主窗体位置
ipcMain.on("getMainPoint", (event, msg) => {
  const pos = mainWindow.getPosition();
  event.returnValue = pos;
});

// 这段程序将会在 Electron 结束初始化
// 和创建浏览器窗口的时候调用
// 部分 API 在 ready 事件触发后才能使用。
app.whenReady().then(() => {
  createWindow();

  app.on("activate", function () {
    // 通常在 macOS 上，当点击 dock 中的应用程序图标时，如果没有其他
    // 打开的窗口，那么程序会重新创建一个窗口。
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// 除了 macOS 外，当所有窗口都被关闭的时候退出程序。 因此，通常对程序和它们在
// 任务栏上的图标来说，应当保持活跃状态，直到用户使用 Cmd + Q 退出。
app.on("window-all-closed", function () {
  if (process.platform !== "darwin") app.quit();
});
