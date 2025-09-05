<template>
    <div ref="containerDiv" class="split-container">
        <div ref="edit" class="column editor-pane">
            <div class="editor-wrapper">
                <textarea v-model="textAreaText" class="editor"></textarea>
            </div>
        </div>

        <div ref="splitDivider" class="split-divider"></div>

        <div ref="preview" class="column preview-pane">
            <button @click="copyHtml" class="absolute-right">Copy</button>
            <div class="preview-wrapper">
                <div class="markdown-body" v-html="markdownOutputHtml"></div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { marked } from 'marked';
import DOMPurify from 'dompurify';
import "@/view/github-markdown.css"
import useClipboard from 'vue-clipboard3'

const { toClipboard } = useClipboard()

const splitDivider = ref()
const edit = ref()
const preview = ref()
const containerDiv = ref()

const textAreaText = ref(`# Markdown table

|Header1|Header2|
|---|---|
|Item1|Item2|
|Item3|Item4|

# List

- Item 1
- Item 2

# Code block

${"`"}${"`"}${"`"}
let message = 'Hello world';
alert(message);
${"`"}${"`"}${"`"}

# Link

This project is based on [Markdown Live Preview](https://markdownlivepreview.com).
`)

const setupDivider = () => {
    let lastLeftRatio = 0.5;
    const divider = (splitDivider.value as HTMLDivElement)
    const leftPane = (edit.value as HTMLDivElement)
    const rightPane =  (preview.value as HTMLDivElement)
    const container = (containerDiv.value as HTMLDivElement)

    let isDragging = false;

    divider.addEventListener('mouseenter', () => {
        divider.classList.add('hover');
    });

    divider.addEventListener('mouseleave', () => {
        if (!isDragging) {
            divider.classList.remove('hover');
        }
    });

    divider.addEventListener('mousedown', () => {
        isDragging = true;
        divider.classList.add('active');
        document.body.style.cursor = 'col-resize';
    });

    divider.addEventListener('dblclick', () => {
        const containerRect = container.getBoundingClientRect();
        const totalWidth = containerRect.width;
        const dividerWidth = divider.offsetWidth;
        const halfWidth = (totalWidth - dividerWidth) / 2;

        leftPane.style.width = halfWidth + 'px';
        rightPane.style.width = halfWidth + 'px';
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        document.body.style.userSelect = 'none';
        const containerRect = container.getBoundingClientRect();
        const totalWidth = containerRect.width;
        const offsetX = e.clientX - containerRect.left;
        const dividerWidth = divider.offsetWidth;

        // Prevent overlap or out-of-bounds
        const dividerComputedStyle = getComputedStyle(divider)
        const dividerMarginLeft = parseInt(dividerComputedStyle.marginLeft, 10)
        const minWidth = 100;
        const maxWidth = totalWidth - minWidth - dividerWidth - dividerMarginLeft
        const leftWidth = Math.max(minWidth, Math.min(offsetX, maxWidth));
        leftPane.style.width = leftWidth + 'px';
        rightPane.style.width = (totalWidth - leftWidth - dividerWidth) + 'px';
        lastLeftRatio = leftWidth / (totalWidth - dividerWidth);
    });

    document.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            divider.classList.remove('active');
            divider.classList.remove('hover');
            document.body.style.cursor = 'default';
            document.body.style.userSelect = '';
        }
    });

    window.addEventListener('resize', () => {
        const containerRect = container.getBoundingClientRect();
        const totalWidth = containerRect.width;
        const dividerWidth = divider.offsetWidth;
        const availableWidth = totalWidth - dividerWidth;

        const newLeft = availableWidth * lastLeftRatio;
        const newRight = availableWidth * (1 - lastLeftRatio);

        leftPane.style.width = newLeft + 'px';
        rightPane.style.width = newRight + 'px';
    });
};

onMounted(() => {
    setupDivider()
})

const markdownOutputHtml = computed(() => {
    const html = marked.parse(textAreaText.value)
    if(html)
        return DOMPurify.sanitize(html as string)
    return ''
})

const copyHtml = () => {
    const t = markdownOutputHtml.value
    if(t){
        toClipboard(t).then(()=>{
            alert('HTML code has been copied to clipboard')
        })
    }else{
        alert('Failed to copy, content is empty')
    }
}

</script>

<style scoped>
.editor-wrapper {
    height: 100%;
}

.editor {
    height: 100%;
    width: 100%;
    resize: none;
    border: none;
    outline: none;
}

.preview-wrapper {
    padding: 0px 4px 4px 4px;
}

.column {
    width: 50%;
    padding: 0;
    margin: 0;
    vertical-align: top;
}

.split-container {
    display: flex;
    height: 25em;
    width: 100%;
    resize: vertical;
    overflow: hidden;
}

.editor-pane {
    height: 100%;
}

.preview-pane {
    overflow: auto;
}

.split-divider {
    width: 5px;
    background: #ccc;
    cursor: col-resize;
    z-index: 1;
    margin-left: 10px;
}

.split-divider.hover {
    background: #999;
}

.split-divider.active {
    background: #c63b3b;
}

.absolute-right{
    float:right;
}
</style>