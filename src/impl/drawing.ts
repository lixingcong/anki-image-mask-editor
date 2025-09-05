import { type Point, type Rect, type Size } from "./types";

class RectFactory implements Rect {
    topLeft: Point
    size: Size
    selected: boolean

    /**
     * @startX：鼠标 点击时 的坐标轴 X 值
     * @startY：鼠标 点击时 的坐标轴 Y 值
     * @endX：鼠标 抬起时 的坐标轴 X 值
     * @endY：鼠标 抬起时 的坐标轴 Y 值
     * */
    constructor(startX:number, startY:number, width:number|null, height:number|null) {
        this.topLeft={x:startX, y:startY}
        if(null!=width && null != height)
            this.size={w:width, h:height}
        else
            this.size={w:0,h:0}
        this.selected = false
    }

    setSize(w:number , h:number){
        this.size={w:w, h:h}
    }

    get center():Point{
        let w, h
        [w, h] = [this.size.w / 2 , this.size.h / 2]
        return {x: this.topLeft.x+w, y:this.topLeft.y+h}
    }

    draw(canvas:HTMLCanvasElement, fillColor:string, arrayIndex:number) {
        const ctx = canvas.getContext('2d')!
        const P = this.topLeft
        const S = this.size

        ctx.beginPath();
        ctx.moveTo(P.x, P.y)
        ctx.lineTo(P.x+S.w, P.y)
        ctx.lineTo(P.x+S.w, P.y+S.h)
        ctx.lineTo(P.x, P.y+S.h)
        ctx.lineTo(P.x, P.y)

        // 填充颜色
        ctx.fillStyle = fillColor
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();

        // 写字
        if(arrayIndex >= 0){
            ctx.font = "15px Arial";
            ctx.fillStyle = "white";
            const center = this.center
            ctx.fillText(arrayIndex+1+'', center.x, center.y);
        }
    }

    moveTo(x:number, y:number){
        this.topLeft.x=x
        this.topLeft.y=y
    }

    scale(f:number){
        this.topLeft.x*=f
        this.topLeft.y*=f
        this.size.w*=f
        this.size.h*=f
    }

    hit(x:number, y:number){
        const TL:Point = this.topLeft
        const BR:Point = {x:TL.x+this.size.w, y:TL.y+this.size.h}
        return x>=TL.x && x<=BR.x && y>=TL.y && y<=BR.y
    }

    // 面积占比，返回百分比
    areaPercentIn(sceneSize:Size):number{
        if(sceneSize.w >0 && sceneSize.h > 0)
            return (this.size.w * this.size.h) / (sceneSize.w * sceneSize.h) * 100.0
        return 0
    }
}


export {RectFactory}