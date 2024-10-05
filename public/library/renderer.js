// renderer.js

window.onload = function () {
    // 确保 window.electron 存在
    if (window.electron) {
        // 获取屏幕信息
        // const screenSize = window.electron.getScreen();
        console.log('window.electron', window.electron);
        // 窗口拖动
        makeDraggable();
    } else {
        console.error('window.electron is undefined');
    }
};

// 拖动窗口的逻辑
function makeDraggable() {
    const live2d = document.querySelector("#live2d-box");
    let dragging = false;
    let mousedown_left = false;
    let mouseOnPage;

    live2d.addEventListener('mousedown', (e) => {
        console.log("鼠标", e.button);

        if (e.button == 0) { // 鼠标左键
            mousedown_left = true;
        }

        // 获取鼠标位置
        const { x, y } = window.electron.getCursorScreenPoint(); // 这里需要在 preload.js 中暴露
        // 从主进程获取当前窗口位置
        const pos = window.electron.getMainPoint();
        // 计算鼠标相对于窗口位置
        mouseOnPage = [(x - pos[0]), (y - pos[1])];
    });

    live2d.addEventListener('mouseup', () => {
        mousedown_left = false;
        dragging = false;
    });

    live2d.addEventListener('mousemove', () => {
        // 按下鼠标并移动，判定为拖动窗口
        if (mousedown_left) {
            dragging = true;
        }

        // 执行拖动操作
        if (dragging) {
            // 移动窗口操作发送到主进程进行
            window.electron.dragMain(mouseOnPage);
        }
    });
}
