<template>
  <div>
    Upload:
    <input type="file" ref="fileInput" @change="openFile" accept=".png,.jpg,.gif,.jpeg,.webp" />
    <button @click="importFromJson">Import Json</button>
    <button @click="exportToJson">Export Json</button>
  </div>

  <div class="outsideWrapper" ref="outsideWrapper">
    <div class="insideWrapper">
      <img ref="backgroundImage" class="coveredImage"></img>
      <Canvas
        :rects="canvasProps.rects"
        :canvasSize="canvasProps.canvasSize"
        :hasLoadedImage="canvasProps.hasLoadedImage"
        :selectedRectIndex="canvasProps.selectedRectIndex"
        :reorder="canvasProps.reorder"
        @clicked-rect-index="onClickedShape"
        @reorder-done="stopReorder"
        ></Canvas>
    </div>
  </div>

  <div class="btn-container">
    <button @click="deleteClicked" :disabled="reorder">Delete Selected</button>
    <button @click="clearAllRects" :disabled="reorder">Clear All</button>
    <label><input type="checkbox" v-model="reorder"></input>Re-order</label>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref, toRef, watch } from 'vue';
import { RectFactory } from './impl/drawing';
import {type Size, type CanvasProps} from './impl/types'
import Canvas from './Canvas.vue';
import { fromJson, toJson } from './impl/Protocol';
import useClipboard from 'vue-clipboard3'

const fileInput = ref()
const backgroundImage = ref()
const outsideWrapper = ref()
let clickedRectIndex = -1
const { toClipboard } = useClipboard()

const canvasProps:CanvasProps = reactive({
  canvasSize:{w:0, h:0},
  rects:[],
  hasLoadedImage:false,
  selectedRectIndex: -1,
  reorder:false
})

const reorder = toRef(canvasProps, 'reorder')
const onClickedShape = (i:number) => {
  // console.log('clicked', i)
  clickedRectIndex = i
}

const clearAllRects = () => {
  if(confirm('Are you sure to delete all rects?'))
    canvasProps.rects.length = 0
}

const deleteClicked = () => {
  if(clickedRectIndex >= 0 && clickedRectIndex < canvasProps.rects.length){
    canvasProps.rects.splice(clickedRectIndex, 1)
    canvasProps.selectedRectIndex = -1
  }
}

const importFromJson = () => {
  const j = prompt('Paste the json')
  if(j){
    const rects = fromJson(j, canvasProps.canvasSize)
    canvasProps.rects.length = 0
    for(const r of rects){
      const pp = new RectFactory(0,0,0,0)
      Object.assign(pp, r)
      canvasProps.rects.push(pp)
    }
  }
}

const exportToJson = () => {
  const j = toJson(canvasProps.rects, canvasProps.canvasSize)
  // console.log(j)
  toClipboard(j).then(()=>{
    alert('Json has been copied to clipboard')
  })
}

const openFile = () => {
  const srcFiles = (fileInput.value as HTMLInputElement).files
  if (!srcFiles || srcFiles.length != 1) {
    return
  }

  canvasProps.hasLoadedImage = false
  canvasProps.rects.length = 0

  const reader = new FileReader()
  reader.onload = (e) => {
    const i = backgroundImage.value as HTMLImageElement
    i.src = e.target!.result as string

    i.onload = () => {
      canvasProps.hasLoadedImage = true
    }
  }
  reader.readAsDataURL(srcFiles[0])
}

const stopReorder = () => {reorder.value = false}

onMounted(() => {
  (outsideWrapper.value as HTMLDivElement).style.height = (window.innerHeight * 0.7) + 'px'

  const resizeObserver = new ResizeObserver(entries => {
    const first = entries[0].contentRect
    Object.assign(canvasProps.canvasSize, {w:first.width, h:first.height})
  })

  resizeObserver.observe(backgroundImage.value)
})

// watch(canvasProps.rects, ()=>{
//   console.log('changed rects, count=', canvasProps.rects.length)
// })

</script>

<style scoped>

button{
  margin-right: 1em;
}

.outsideWrapper {
  width: 100%;
  height: 10em;
  resize: vertical;
  border: 1px dashed gray;
  overflow: hidden;
}

.insideWrapper {
  width: 100%;
  height: 100%;
  position: relative;
}

.coveredImage {
  max-width: 100%;
  max-height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin-inline: auto;
}

</style>
