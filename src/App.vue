<template>
  <a-layout style="height: 100%;display: flex;flex-direction: row;">
    <!-- 左侧栏 -->
    <div style="width: 260px;">
      <LeftSidebar v-model:propName="value" />
    </div>



    <!-- 主内容区域 -->
    <a-layout-content class="Right-Layout">
      <UserInputManager />
    </a-layout-content>
  </a-layout>
</template>

<script>
import LeftSidebar from './components/LeftSidebar.vue';
import UserInputManager from './components/UserInputManager.vue';

export default {
  components: {
    LeftSidebar,
    UserInputManager,
  },
  data() {
    return {
      collapsed: false
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