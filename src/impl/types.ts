interface Point
{
    x:number
    y:number
}

interface Size
{
    w:number
    h:number
}

interface Rect
{
    topLeft:Point
    size: Size
    selected: boolean
}

interface CanvasProps
{
    hasLoadedImage: boolean
    canvasSize: Size
    rects: Rect[]
    selectedRectIndex: number
    reorder: boolean
}

export { type Point, type Size, type Rect, type CanvasProps}