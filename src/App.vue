<template>
  <a-layout style="height: 100vh">
    <!-- 左侧栏 -->
    <LeftSidebar v-model:propName="value" />


    <!-- 主内容区域 -->
    <a-layout-content style="padding: 24px;">
    </a-layout-content>
  </a-layout>
</template>

<script>
import LeftSidebar from './components/LeftSidebar.vue';

export default {
  components: {
    LeftSidebar,
  },
  data() {
    return {
      collapsed: false
    };
  }
};
</script>
