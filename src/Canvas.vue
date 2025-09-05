<template>
  <canvas ref="canvas" class="coveringCanvas"></canvas>
</template>

<script lang="ts" setup>
import { onMounted, reactive, ref, toRef, watch } from 'vue';
import { type Size, type CanvasProps ,type Rect} from './impl/types';
import { RectFactory } from './impl/drawing';

const props = defineProps<CanvasProps>()
let imageSizeOld: Size = { w: 0, h: 0 }
const imageSize = reactive(props.canvasSize)
const shapeCollection = reactive(props.rects)
const hasLoadedImage = toRef(props, 'hasLoadedImage')
const selectedIndexByParent = toRef(props, 'selectedRectIndex')
const reorder = toRef(props, 'reorder')
const canvas = ref()
const selectedIndexByClicked = ref(-1)

const reorderRects:Rect[] = []

const emit = defineEmits<{
  (e: 'clicked-rect-index', idx: number): void
  (e: 'reorder-done'): void
}>()

const hitShape = (x: number, y: number): number => {
  let minimalAreaIndex = -1
  let minimalArea = Number.MAX_VALUE

  shapeCollection.map(s => {
    return {
      hit: (s as RectFactory).hit(x, y),
      area: s.size.w * s.size.h
    }
  }).forEach((a, idx) => {
    if(a.hit && a.area < minimalArea){
      minimalAreaIndex=idx
      minimalArea = a.area
    }
  })

  return minimalAreaIndex
}

onMounted(() => {
  const c = canvas.value as HTMLCanvasElement

  c.onmousedown = (e) => {
    if (!hasLoadedImage.value)
      return

    // 鼠标按下时，需要获取canvas相对浏览器视窗的位置
    const rect = c.getBoundingClientRect();
    const startClientX = e.clientX
    const startClientY = e.clientY

    const canvasX = startClientX - rect.left
    const canvasY = startClientY - rect.top

    const hitIndex = hitShape(canvasX, canvasY)

    // console.log('hit', hitIndex)
    clearSelected()

    if(reorder.value){
      if(hitIndex>=0){
        const shape  = shapeCollection[hitIndex]
        if(!reorderRects.includes(shape)){
          reorderRects.push(shape);
          repaintShapes()
        }
        if(reorderRects.length == shapeCollection.length)
          emit('reorder-done')
      }
    }else if (-1 == hitIndex) {
      const shape = new RectFactory(canvasX, canvasY, null, null)
      shape.selected = true
      shapeCollection.push(shape)
      selectedIndexByClicked.value = shapeCollection.length - 1

      window.onmousemove = (evt) => {
        if (shapeCollection.length > 0) {
          let w, h
          [w, h] = [evt.clientX - startClientX, evt.clientY - startClientY];

          (shapeCollection[shapeCollection.length - 1] as RectFactory).setSize(w, h)
        }
      }
    } else {
      selectedIndexByClicked.value = hitIndex

      const shape = shapeCollection[hitIndex]
      const shapeOldX = shape.topLeft.x
      const shapeOldY = shape.topLeft.y
      shape.selected = true

      window.onmousemove = (evt) => {
        let dx, dy
        [dx, dy] = [evt.clientX - startClientX, evt.clientY - startClientY];

        (shapeCollection[hitIndex] as RectFactory).moveTo(shapeOldX + dx, shapeOldY + dy)
      }
    }
  }

  // 抬起鼠标
  c.onmouseup = () => {
    c.onmousemove = null;
    window.onmousemove = null;

    if(selectedIndexByClicked.value>=0){
      const r = (shapeCollection[selectedIndexByClicked.value] as RectFactory)
      const percent = r.areaPercentIn(imageSize)
      // console.log('percent=', percent)
      if(percent < 0.05){
        console.warn('Too small, delete the rect')
        shapeCollection.splice(selectedIndexByClicked.value, 1)
        selectedIndexByClicked.value = -1
      }
    }

    repaintShapes()
  };

  // 删除一个
  addEventListener('keydown', (event: KeyboardEvent) => {
    if(event.key !== 'Delete')
      return

    if (!reorder.value && selectedIndexByClicked.value >= 0) {
      shapeCollection.splice(selectedIndexByClicked.value, 1);
      selectedIndexByClicked.value = -1
    }
  });
})

const clearSelected = () => {
  for (const pp of shapeCollection) {
    const r = (pp as RectFactory)
    r.selected = false
  }

  selectedIndexByClicked.value = -1
  repaintShapes()
}

const repaintShapes = () => {
  const c = canvas.value as HTMLCanvasElement
  c.getContext('2d')!.clearRect(0, 0, c.width, c.height)

  shapeCollection.forEach((pp, idx) => {
    const r = (pp as RectFactory)
    const color = r.selected ? 'rgba(66, 218, 145, 0.9)' : 'rgba(245, 155, 145, 0.9)'

    let arrayIdx = idx
    if(reorder.value)
      arrayIdx = reorderRects.indexOf(pp)

    r.draw(c, color, arrayIdx)
  })
}

watch(shapeCollection, repaintShapes)

watch(imageSize, (newSize) => {
  //console.log('image was resized from', imageSizeOld.w, '*', imageSizeOld.h,'to', newSize.w, '*', newSize.h)

  const c = canvas.value as HTMLCanvasElement
  c.style.width = newSize.w + 'px'
  c.style.height = newSize.h + 'px'
  c.width = newSize.w
  c.height = newSize.h

  if (imageSizeOld.h > 0 && newSize.h > 0) {
    const ratio = newSize.h / imageSizeOld.h
    for (let i = 0; i < shapeCollection.length; ++i) {
      (shapeCollection[i] as RectFactory).scale(ratio)
    }
  }

  imageSizeOld.w = imageSize.w
  imageSizeOld.h = imageSize.h
})

watch(selectedIndexByClicked, ()=>{
  emit('clicked-rect-index', selectedIndexByClicked.value)
})

watch(selectedIndexByParent, ()=>{
  //console.log('selectedIndexByParent', selectedIndexByParent.value)
  selectedIndexByClicked.value = selectedIndexByParent.value
})

watch(reorder, (newVal)=>{
  if(newVal){
    reorderRects.length = 0
  }else{
    if(reorderRects.length != shapeCollection.length){
      alert('Fail to re-order!\nThey are restored to original order.\nYou must click all rects one by one!')
    }else{
      for(let i = 0;i<reorderRects.length;++i)
        shapeCollection[i] = reorderRects[i]
    }
  }

  repaintShapes()
})

</script>

<style scoped>
.coveringCanvas {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  margin-inline: auto;
  /* background-color: rgba(255, 0, 0, .1); */
  z-index: 1;
}

</style>