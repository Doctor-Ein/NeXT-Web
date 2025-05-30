import { createApp } from 'vue';
import App from './App.vue';
import { Button, Space, InputNumber, Input, Textarea, LayoutContent, Layout, LayoutSider, LayoutHeader, Upload, List, ListItem, Avatar } from 'ant-design-vue'
import 'ant-design-vue/dist/reset.css'; // 使用 reset.css 替代 antd.css
import '@/assets/fonts/font.css'; // Maple Mono 字体css文件
// import 'katex/dist/katex.min.css'; // katex的配置样式(但是感觉不存在啊)

const app = createApp(App)

app.component('a-button', Button)
app.component('a-space', Space)
app.component('a-input-number', InputNumber)
app.component('a-input', Input)
app.component('a-textarea', Textarea)
app.component('a-layout', Layout)
app.component('a-layout-content', LayoutContent)
app.component('a-layout-sider', LayoutSider)
app.component('a-layout-header', LayoutHeader)
app.component('a-upload', Upload)
app.component('a-list', List)
app.component('a-list-item', ListItem)
app.component('a-avatar', Avatar)

app.mount('#app')
