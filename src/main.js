import { createApp } from 'vue';
import App from './App.vue';
import Antd from 'ant-design-vue';
import 'ant-design-vue/dist/reset.css'; // 使用 reset.css 替代 antd.css
import '@/assets/fonts/font.css'; // Maple Mono 字体css文件

const app = createApp(App);
app.use(Antd);
app.mount('#app');
