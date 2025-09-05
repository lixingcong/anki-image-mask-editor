<template>
  <Collapsible :title="'Image Mask Editor'" :hidden="false">
    <ImageMaskEditor></ImageMaskEditor>
  </Collapsible>

  <Collapsible :title="'Markdown Live Preview'" :hidden="true">
    <MarkdownEditor></MarkdownEditor>
  </Collapsible>

  <Collapsible :title="'About'" :hidden="true">
    <About :url="githubUrl"></About>
  </Collapsible>
</template>

<script setup lang="ts">
import About from './About.vue';
import ImageMaskEditor from './ImageMaskEditor.vue';
import MarkdownEditor from './MarkdownEditor.vue';
import Collapsible from './Collapsible.vue';
import "@/view/style.css"

const githubUrl = 'https://github.com/lixingcong/anki-image-mask-editor'
</script>

<style scoped>

</style>