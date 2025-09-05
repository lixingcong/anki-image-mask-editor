<template>
    <div>
        Source code: <a target="_blank" :href="props.url">Github</a>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{url:string}>()
let hideContent = ref(true)
</script>