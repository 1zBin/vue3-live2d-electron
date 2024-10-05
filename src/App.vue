<script setup>
import { onBeforeUnmount, onMounted, ref } from "vue";

// 初始化变量和数据
const tap_body_des = [
  "嘿，主人！今天过得怎么样？",
  "加油！你是最棒的！",
  "记得喝水哦，保持健康！",
  "来吧，我们一起玩吧！",
  "今天要好好照顾自己！",
];
const isMessage = ref(false);
const message = ref("");
const live2d = PIXI.live2d;

let app;
let model;
let isAnimating = false;
let lastBodyNum;

// 模拟用户点击
function simulateUserClick() {
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });
  document.body.dispatchEvent(event);
}

// 在组件挂载后执行的操作
onMounted(async () => {
  const live2dBox = document.querySelector("#live2d-box");

  // 实例化模型
  app = new PIXI.Application({
    view: live2dBox,
    autoDensity: true, // 控制是否自动调整渲染器的分辨率以适应高 DPI 显示屏
    antialias: true, // 控制是否启用抗锯齿功能，使渲染的图形更加平滑。
    resolution: window.devicePixelRatio, // 设置渲染器的分辨率
    autoStart: true, // 控制应用程序是否自动开始渲染
    resizeTo: window, // 指定应用程序在窗口大小变化时是否自动调整大小，这里设置为 window，表示在窗口大小变化时自动调整大小。
    transparent: true, // 控制渲染器是否为透明背景
  });

  try {
    model = await live2d.Live2DModel.fromSync(
      "model/shizuku/shizuku.model.json", // 确保路径正确
      {
        onError: console.warn,
      }
    );
    console.log("模型加载成功");
  } catch (error) {
    console.error("模型加载失败:", error);
  }

  model.once("load", () => {
    console.log("模型加载事件触发", model);
    app.stage.addChild(model);
    simulateUserClick();
    setupModelInteractions(model, 0);

    const scaleX = (innerWidth * 1) / model.width;
    const scaleY = (innerHeight * 1) / model.height;

    model.scale.set(Math.min(scaleX, scaleY));

    model.x = -innerWidth * 0.03;
    model.y = -innerWidth * 0.1;

    addFrame(model);

    let bodyNum = 0;
    model.on("hit", (hitAreas) => {
      if (hitAreas.includes("body")) {
        bodyNum = random(0, tap_body_des.length - 1);
        if (lastBodyNum !== bodyNum) setupModelInteractions(model, bodyNum);
      }

      if (hitAreas.includes("head")) {
        model.expression(random(0, 3));
      }
    });

    model.internalModel.motionManager.on(
      "motionStart",
      (_group, index, audio) => {
        if (audio) {
          audio.volume = 1;
          message.value = tap_body_des[index];
        }
      }
    );

    model.internalModel.motionManager.on("motionFinish", () => {
      setTimeout(() => {
        console.log("动画播放完成");
        isMessage.value = false;
        message.value = "";
        isAnimating = false;
      }, 500);
    });
  });
});

// 设置模型交互
const setupModelInteractions = (model, num) => {
  if (isAnimating) return; // 如果正在动画，则返回
  isAnimating = true;
  model
    .motion("tap_body", num)
    .then(() => {
      isMessage.value = true;
      message.value = tap_body_des[num];
      lastBodyNum = num;
    })
    .catch((error) => {
      console.error("动画出错:", error);
    });
};

// 生成指定范围内的随机数
function random(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

// 添加一个透明的前景框
function addFrame(model) {
  const foreground = PIXI.Sprite.from(PIXI.Texture.WHITE);
  foreground.width = model.internalModel.width;
  foreground.height = model.internalModel.height;
  foreground.alpha = 0;
  model.addChild(foreground);
}

// 鼠标拖动模型，暂时用不上
// function draggable(model) {
//   model.buttonMode = true;
//   model.on("pointerdown", (e) => {
//     model.dragging = true;
//     model._pointerX = e.data.global.x - model.x;
//     model._pointerY = e.data.global.y - model.y;
//   });
//   model.on("pointermove", (e) => {
//     if (model.dragging) {
//       model.position.x = e.data.global.x - model._pointerX;
//       model.position.y = e.data.global.y - model._pointerY;
//     }
//   });
//   model.on("pointerupoutside", () => (model.dragging = false));
//   model.on("pointerup", () => (model.dragging = false));
// }

// function addHitAreaFrames(model) {
//   const hitAreaFrames = new live2d.HitAreaFrames();
//   model.addChild(hitAreaFrames);
// }

// 在组件卸载前执行的清理操作
onBeforeUnmount(() => {
  model?.destroy();
  app?.destroy();
});
</script>

<template>
  <div id="landlord">
    <div class="message" v-show="isMessage">{{ message }}</div>
    <canvas id="live2d-box" width="300" height="300" class="live2d"></canvas>
  </div>
</template>

<style scoped>
#landlord {
  user-select: none;
  position: fixed;
  top: 50px;
  width: 280px;
  height: 250px;
  z-index: 10000;
  font-size: 0;
  transition: all 0.3s ease-in-out;
}

#live2d-box {
  position: relative;
  cursor: pointer !important;
}

.message {
  width: 70%;
  height: auto;
  margin: 10px;
  padding: 5px;
  top: -40px;
  left: -5px;
  text-align: center;
  border: 1px solid rgba(255, 184, 137, 0.4);
  border-radius: 12px;
  background-color: rgb(255, 200, 137, 0.7);
  box-shadow: 0 3px 15px 2px rgba(255, 190, 137, 0.4);
  color: #27dfb7;
  font-size: 13px;
  font-weight: 400;
  text-overflow: ellipsis;
  text-transform: uppercase;
  overflow: hidden;
  position: absolute;
  animation-delay: 5s;
  animation-duration: 50s;
  animation-iteration-count: infinite;
  animation-name: shake;
  animation-timing-function: ease-in-out;
  z-index: 100000;
}

/* @media (max-width: 860px) {
    #landlord {
        display: none;
    }
} */

@keyframes shake {
  2% {
    transform: translate(0.5px, -1.5px) rotate(-0.5deg);
  }

  4% {
    transform: translate(0.5px, 1.5px) rotate(1.5deg);
  }

  6% {
    transform: translate(1.5px, 1.5px) rotate(1.5deg);
  }

  8% {
    transform: translate(2.5px, 1.5px) rotate(0.5deg);
  }

  10% {
    transform: translate(0.5px, 2.5px) rotate(0.5deg);
  }

  12% {
    transform: translate(1.5px, 1.5px) rotate(0.5deg);
  }

  14% {
    transform: translate(0.5px, 0.5px) rotate(0.5deg);
  }

  16% {
    transform: translate(-1.5px, -0.5px) rotate(1.5deg);
  }

  18% {
    transform: translate(0.5px, 0.5px) rotate(1.5deg);
  }

  20% {
    transform: translate(2.5px, 2.5px) rotate(1.5deg);
  }

  22% {
    transform: translate(0.5px, -1.5px) rotate(1.5deg);
  }

  24% {
    transform: translate(-1.5px, 1.5px) rotate(-0.5deg);
  }

  26% {
    transform: translate(1.5px, 0.5px) rotate(1.5deg);
  }

  28% {
    transform: translate(-0.5px, -0.5px) rotate(-0.5deg);
  }

  30% {
    transform: translate(1.5px, -0.5px) rotate(-0.5deg);
  }

  32% {
    transform: translate(2.5px, -1.5px) rotate(1.5deg);
  }

  34% {
    transform: translate(2.5px, 2.5px) rotate(-0.5deg);
  }

  36% {
    transform: translate(0.5px, -1.5px) rotate(0.5deg);
  }

  38% {
    transform: translate(2.5px, -0.5px) rotate(-0.5deg);
  }

  40% {
    transform: translate(-0.5px, 2.5px) rotate(0.5deg);
  }

  42% {
    transform: translate(-1.5px, 2.5px) rotate(0.5deg);
  }

  44% {
    transform: translate(-1.5px, 1.5px) rotate(0.5deg);
  }

  46% {
    transform: translate(1.5px, -0.5px) rotate(-0.5deg);
  }

  48% {
    transform: translate(2.5px, -0.5px) rotate(0.5deg);
  }

  50% {
    transform: translate(-1.5px, 1.5px) rotate(0.5deg);
  }

  52% {
    transform: translate(-0.5px, 1.5px) rotate(0.5deg);
  }

  54% {
    transform: translate(-1.5px, 1.5px) rotate(0.5deg);
  }

  56% {
    transform: translate(0.5px, 2.5px) rotate(1.5deg);
  }

  58% {
    transform: translate(2.5px, 2.5px) rotate(0.5deg);
  }

  60% {
    transform: translate(2.5px, -1.5px) rotate(1.5deg);
  }

  62% {
    transform: translate(-1.5px, 0.5px) rotate(1.5deg);
  }

  64% {
    transform: translate(-1.5px, 1.5px) rotate(1.5deg);
  }

  66% {
    transform: translate(0.5px, 2.5px) rotate(1.5deg);
  }

  68% {
    transform: translate(2.5px, -1.5px) rotate(1.5deg);
  }

  70% {
    transform: translate(2.5px, 2.5px) rotate(0.5deg);
  }

  72% {
    transform: translate(-0.5px, -1.5px) rotate(1.5deg);
  }

  74% {
    transform: translate(-1.5px, 2.5px) rotate(1.5deg);
  }

  76% {
    transform: translate(-1.5px, 2.5px) rotate(1.5deg);
  }

  78% {
    transform: translate(-1.5px, 2.5px) rotate(0.5deg);
  }

  80% {
    transform: translate(-1.5px, 0.5px) rotate(-0.5deg);
  }

  82% {
    transform: translate(-1.5px, 0.5px) rotate(-0.5deg);
  }

  84% {
    transform: translate(-0.5px, 0.5px) rotate(1.5deg);
  }

  86% {
    transform: translate(2.5px, 1.5px) rotate(0.5deg);
  }

  88% {
    transform: translate(-1.5px, 0.5px) rotate(1.5deg);
  }

  90% {
    transform: translate(-1.5px, -0.5px) rotate(-0.5deg);
  }

  92% {
    transform: translate(-1.5px, -1.5px) rotate(1.5deg);
  }

  94% {
    transform: translate(0.5px, 0.5px) rotate(-0.5deg);
  }

  96% {
    transform: translate(2.5px, -0.5px) rotate(-0.5deg);
  }

  98% {
    transform: translate(-1.5px, -1.5px) rotate(-0.5deg);
  }

  0%,
  100% {
    transform: translate(0, 0) rotate(0);
  }
}
</style>
