// p5.brush 2.2.3 未提供声明；这里只声明演示实际调用的官方 API。
declare module "p5.brush/standalone" {
  export const RADIANS: "radians";
  export function createCanvas(width: number, height: number, options: { parent: HTMLElement | null; pixelDensity: number }): HTMLCanvasElement;
  export function angleMode(mode: typeof RADIANS): void;
  export function clear(color: string): void;
  export function render(): void;
  export function push(): void;
  export function pop(): void;
  export function translate(x: number, y: number): void;
  export function seed(value: number): void;
  export function noiseSeed(value: number): void;
  export function noField(): void;
  export function noWash(): void;
  export function scaleBrushes(scale: number): void;
  export function set(name: string, color: string, weight: number): void;
  export function noFill(): void;
  export function noStroke(): void;
  export function noHatch(): void;
  export function fill(color: string, opacity: number): void;
  export function fillBleed(strength: number): void;
  export function fillTexture(texture: number, border: number): void;
  export function circle(x: number, y: number, radius: number): void;
  export function line(x1: number, y1: number, x2: number, y2: number): void;
}
