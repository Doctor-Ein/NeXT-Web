<template>
  <a-layout style="height: 100%;display: flex;flex-direction: row;">
    <!-- 左侧栏 -->
    <LeftSidebar />



    <!-- 主内容区域 -->
    <a-layout-content class="Right-Layout">
      <MainChat :messages="mes" />
      <UserInputManager />
    </a-layout-content>
  </a-layout>
</template>

<script>
import LeftSidebar from './components/LeftSidebar.vue';
import UserInputManager from './components/UserInputManager.vue';
import MainChat from './components/MainChat.vue';



export default {
  components: {
    LeftSidebar,
    UserInputManager,
    MainChat,
  },
  data() {
    return {
      collapsed: false,
      mes: [{ 'id': 1, 'role': 'assistant', 'content': '### 你好呀' }, { 'id': 2, 'role': 'user', 'content': '我一点都不好😭' },],
    };
  }
};
</script>

<style scoped>
.Right-Layout {
  position: relative;
  padding-left: 15%;
  padding-right: 15%;
}
</style>