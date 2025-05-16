<template>
    <canvas ref="liveCanvas" class="live2d-canvas"></canvas>
</template>

<script>
import * as PIXI from 'pixi.js';
import { Live2DModel } from 'pixi-live2d-display';
import { Ticker, TickerPlugin } from '@pixi/ticker';
import { extensions } from '@pixi/extensions';

Live2DModel.registerTicker(Ticker);
extensions.add(TickerPlugin);

export default {
    name: 'Live2DCanvas',
    async mounted() {
        // 初始化 PIXI 应用
        const app = new PIXI.Application({
            view: this.$refs.liveCanvas,
            autoStart: true,
            transparent: true,
            resizeTo: this.$refs.liveCanvas,
        });

        // 加载 Live2D 模型
        const model = await Live2DModel.from('/live2d/Resources/mao_pro/mao_pro.model3.json');
        model.scale.set(0.05);
        model.position.set(0, 0); // 根据需要设置位置

        app.stage.addChild(model);

        model.motion('motions/mtn_01.motion3.json');
    },
};
</script>

<style scoped>
.live2d-canvas {
    width: 300px;
    height: 400px;
    position: absolute;
    right: 0%;
    top: 20%;

}
</style>