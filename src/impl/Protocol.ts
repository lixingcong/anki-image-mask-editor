import { type Rect, type Size } from "./types";

interface T {
    x: number
    y: number
    w: number
    h: number
}

const fromJson = (jsonString: string, imageSize: Size) => {
    let ret: Rect[] = []

    try {
        const json = JSON.parse(jsonString)
        const arr: T[] = json as T[]
        ret = arr.map(t => {
            const x = t.x * imageSize.w
            const y = t.y * imageSize.h
            const w = t.w * imageSize.w
            const h = t.h * imageSize.h

            return {
                topLeft: { x: x, y: y },
                size: { w: w, h: h },
                selected: false
            }
        })
    } catch (error) {

    }

    return ret
}

const toJson = (rects: Rect[], imageSize: Size) => {
    let arr: T[] = rects.map(r => {
        const x = r.topLeft.x / imageSize.w
        const y = r.topLeft.y / imageSize.h
        const w = r.size.w / imageSize.w
        const h = r.size.h / imageSize.h

        return {
            x: x,
            y: y,
            w: w,
            h: h
        }
    })


    return JSON.stringify(arr)
}

export {fromJson, toJson}