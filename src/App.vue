<template>
  <ImageMaskEditor></ImageMaskEditor>
  <MarkdownEditor></MarkdownEditor>
  <About :url="githubUrl"></About>
</template>

<script setup lang="ts">
import About from './About.vue';
import ImageMaskEditor from './ImageMaskEditor.vue';
import MarkdownEditor from './MarkdownEditor.vue';
import "@/view/style.css"

const githubUrl = 'https://github.com/lixingcong/anki-image-mask-editor'
</script>

<style scoped>

</style>