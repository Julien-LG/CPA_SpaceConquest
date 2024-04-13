import * as conf from './conf'
import { useRef, useEffect } from 'react'
import { State, step, click, mouseMove, endOfGame } from './state'
import { render } from './renderer'
import {Triangle, Circle, OurModel} from './v2/model';

export type ViewRender = {
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
};

const randomInt = (max: number) => Math.floor(Math.random() * max)
const randomSign = () => Math.sign(Math.random() - 0.5)

const initCanvas =
  (iterate: (ctx: CanvasRenderingContext2D) => void) =>
  (canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    requestAnimationFrame(() => iterate(ctx))
  }

const Canvas = ({ height, width }: { height: number; width: number }) => {
  const initialModel: OurModel = {
    // triangles: new Array(2).fill(1).map((_) => ({
    //   life: conf.BALLLIFE,
    //   coord: {
    //     x: randomInt(width - 120) + 60,
    //     y: randomInt(height - 120) + 60,
    //     dx: 4 * randomSign(),
    //     dy: 4 * randomSign(),
    //   },
    // })),
    // size: { height, width },
    // endOfGame: true,
    triangles: [],
    circles: [],
    startSelec : null,
    endSelec : null,
    events: [],
  }

  const ref = useRef<any>()
  const model = useRef<OurModel>(initialModel)


  // const iterate = (ctx: CanvasRenderingContext2D) => {
  //   state.current = step(state.current)
  //   state.current.endOfGame = !endOfGame(state.current)
  //   render(ctx)(state.current)
  //   if (!state.current.endOfGame) requestAnimationFrame(() => iterate(ctx))
  // }
  // const onClick = (e: PointerEvent) => {
  //   state.current = click(state.current)(e)
  // }

  // const onMove = (e: PointerEvent) => {
  //   state.current = mouseMove(state.current)(e)
  // }
  // useEffect(() => {
  //   if (ref.current) {
  //     initCanvas(iterate)(ref.current)
  //     ref.current.addEventListener('click', onClick)
  //     ref.current.addEventListener('mousemove', onMove)
  //   }
  //   return () => {
  //     ref.current.removeEventListener('click', onMove)
  //     ref.current.removeEventListener('mousemove', onMove)
  //   }
  // }, [])
  return <canvas {...{ height, width, ref }} />
}

const drawTriangle = (ctx: CanvasRenderingContext2D, triangle: Triangle) => {
  // Dessine un triangle sur le canvas
  ctx.beginPath();
  ctx.moveTo(triangle.points[0].x, triangle.points[0].y);
  triangle.points.forEach(point => ctx.lineTo(point.x, point.y));
  ctx.closePath();
  ctx.fillStyle = triangle.color;
  ctx.fill();

  // Si le triangle est slectionné, dessine un contour orange
  if (triangle.selected) {
      ctx.strokeStyle = 'orange';
      ctx.lineWidth = 3; 
      ctx.stroke(); // Dessine le contour
  }
}

const drawCircle = (ctx: CanvasRenderingContext2D, circle: Circle) => {
  // Dessine un cercle sur le canvas
  ctx.beginPath();
  ctx.arc(circle.center.x, circle.center.y, circle.radius, 0, Math.PI * 2);
  ctx.fillStyle = circle.color;
  ctx.fill();
}

const drawSelectionArea = (ctx: CanvasRenderingContext2D, model: OurModel) => {
  const { startSelec, endSelec } = model;
  if (startSelec && endSelec) {
      ctx.beginPath();
      ctx.rect(startSelec.x, startSelec.y, endSelec.x - startSelec.x, endSelec.y - startSelec.y);
      ctx.strokeStyle = 'white';
      ctx.lineWidth = 3; 
      ctx.stroke();
      ctx.closePath();
  }
}

export const drawAll = (view: ViewRender, model: OurModel) => {
  const { ctx } = view;
  ctx.clearRect(0, 0, view.canvas.width, view.canvas.height);
  model.triangles.forEach(triangle => drawTriangle(ctx, triangle));
  model.circles.forEach(circle => drawCircle(ctx, circle));
  drawSelectionArea(ctx, model);
}

export default Canvas
