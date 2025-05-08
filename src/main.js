import { createApp } from 'vue';
import App from './App.vue';
import { Button, InputNumber, Input, Textarea, LayoutContent, Layout, LayoutSider } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'; // 使用 reset.css 替代 antd.css
import '@/assets/fonts/font.css'; // Maple Mono 字体css文件

const app = createApp(App)

app.component('a-button', Button)
app.component('a-input-number', InputNumber)
app.component('A-input', Input)
app.component('a-textarea', Textarea)
app.component('a-layout', Layout)
app.component('a-layout-content', LayoutContent)
app.component('a-layout-sider', LayoutSider)

app.mount('#app')
