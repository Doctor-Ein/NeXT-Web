<template>
    <div id="live2d-container" ref="container"></div>
</template>

<script setup>
import { onMounted, ref } from 'vue'

const container = ref(null)

onMounted(async () => {
    // 加载 Live2D 脚本（如果未打包为模块）
    await loadScript('/public/live2d/live2dcubismcore.js')
    await loadScript('/public/live2d/framework.js') // 可能还有自定义加载逻辑的 JS 文件

    // 初始化 Live2D 模型
    const app = new PIXI.Application({
        view: createCanvas(),
        autoStart: true,
        width: 400,
        height: 600,
        transparent: true,
    })

    container.value.appendChild(app.view)

    // 初始化模型
    const model = await loadLive2DModel('/live2d/Hiyori.model3.json', app)
    app.stage.addChild(model)
})

// 工具函数：动态加载脚本
function loadScript(src) {
    return new Promise((resolve, reject) => {
        const script = document.createElement('script')
        script.src = src
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
    })
}

// 示例函数：创建 canvas
function createCanvas() {
    const canvas = document.createElement('canvas')
    canvas.width = 400
    canvas.height = 600
    return canvas
}

// 示例函数：加载模型（你需要根据具体 SDK 实现）
async function loadLive2DModel(modelUrl, app) {
    // 这里参考官方 SDK 的加载逻辑实现
    // 比如使用 `Live2DCubismFramework` 相关类
}
</script>