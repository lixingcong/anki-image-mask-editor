<template>
    <div :class="hideContent ? 'card-title-hidden' : 'card-title'" @click="hideContent = !hideContent">About</div>
    <div :class="hideContent ? 'card-content-hidden' : 'card-content'">
        <div>
            Source code: <a target="_blank" :href="props.url">Github</a>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps<{url:string}>()
let hideContent = ref(true)
</script>