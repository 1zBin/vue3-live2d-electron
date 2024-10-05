import { onBeforeUnmount, onMounted, ref } from "vue";
const { defineProps, defineSlots, defineEmits, defineExpose, defineModel, defineOptions, withDefaults, } = await import('vue');
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
onMounted(async () => {
    const live2dBox = document.querySelector("#live2d-box");
    console.log("PIXI", PIXI);
    app = new PIXI.Application({
        view: live2dBox,
        autoDensity: true,
        antialias: true,
        resolution: window.devicePixelRatio,
        autoStart: true,
        resizeTo: window,
        transparent: true,
    });
    try {
        model = await live2d.Live2DModel.fromSync("model/shizuku/shizuku.model.json", // 确保路径正确
        {
            onError: console.warn,
        });
        console.log("模型加载成功");
    }
    catch (error) {
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
        // draggable(model);
        // addHitAreaFrames(model);
        let bodyNum = 0;
        model.on("hit", (hitAreas) => {
            console.log("hitAreas", hitAreas);
            if (hitAreas.includes("body")) {
                bodyNum = random(0, tap_body_des.length - 1);
                if (lastBodyNum !== bodyNum)
                    setupModelInteractions(model, bodyNum);
            }
            if (hitAreas.includes("head")) {
                model.expression(random(0, 3));
            }
        });
        model.internalModel.motionManager.on("motionStart", (_group, index, audio) => {
            if (audio) {
                audio.volume = 1;
                message.value = tap_body_des[index];
            }
        });
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
const setupModelInteractions = (model, num) => {
    if (isAnimating)
        return; // 如果正在动画，则返回
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
function random(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}
function addFrame(model) {
    const foreground = PIXI.Sprite.from(PIXI.Texture.WHITE);
    foreground.width = model.internalModel.width;
    foreground.height = model.internalModel.height;
    foreground.alpha = 0;
    model.addChild(foreground);
}
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
onBeforeUnmount(() => {
    model?.destroy();
    app?.destroy();
});
const __VLS_fnComponent = (await import('vue')).defineComponent({});
;
let __VLS_functionalComponentProps;
function __VLS_template() {
    const __VLS_ctx = {};
    const __VLS_localComponents = {
        ...{},
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_components;
    const __VLS_localDirectives = {
        ...{},
        ...__VLS_ctx,
    };
    let __VLS_directives;
    let __VLS_styleScopedClasses;
    // CSS variable injection 
    // CSS variable injection end 
    let __VLS_resolvedLocalAndGlobalComponents;
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ id: ("landlord"), });
    __VLS_elementAsFunction(__VLS_intrinsicElements.div, __VLS_intrinsicElements.div)({ ...{ class: ("message") }, });
    __VLS_directiveAsFunction(__VLS_directives.vShow)(null, { ...__VLS_directiveBindingRestFields, value: (__VLS_ctx.isMessage) }, null, null);
    (__VLS_ctx.message);
    __VLS_elementAsFunction(__VLS_intrinsicElements.canvas, __VLS_intrinsicElements.canvas)({ id: ("live2d-box"), width: ("300"), height: ("300"), ...{ class: ("live2d") }, });
    __VLS_styleScopedClasses['message'];
    __VLS_styleScopedClasses['live2d'];
    var __VLS_slots;
    var __VLS_inheritedAttrs;
    const __VLS_refs = {};
    var $refs;
    return {
        slots: __VLS_slots,
        refs: $refs,
        attrs: {},
    };
}
;
const __VLS_self = (await import('vue')).defineComponent({
    setup() {
        return {
            isMessage: isMessage,
            message: message,
        };
    },
});
export default (await import('vue')).defineComponent({
    setup() {
        return {};
    },
});
;
