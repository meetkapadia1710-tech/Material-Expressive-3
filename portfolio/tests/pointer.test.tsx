import test from "node:test";
import assert from "node:assert/strict";
import { createPointerTracker, type PointerEnvironment, type PointerSample } from "../lib/pointer-tracker";

function fixture(fine = true, reduced = false) {
  const fineMedia = Object.assign(new EventTarget(), { matches: fine });
  const reducedMedia = Object.assign(new EventTarget(), { matches: reduced });
  const view = Object.assign(new EventTarget(), { matchMedia: (query: string) => query.includes("reduced") ? reducedMedia : fineMedia });
  const document = Object.assign(new EventTarget(), { hidden: false });
  const frames = new Set<() => void>();
  let observe: (element: Element, visible: boolean) => void = () => {};
  const env = { view, document, observe: (callback: typeof observe) => { observe = callback; return { observe() {}, unobserve() {}, disconnect() {} }; }, schedule: (callback: () => void) => { frames.add(callback); }, cancel: (callback: () => void) => { frames.delete(callback); } } as unknown as PointerEnvironment;
  const tracker = createPointerTracker(env);
  let reads = 0;
  const element = { isConnected: true, getBoundingClientRect: () => { reads++; return { left: 10, top: 20, width: 200, height: 100 }; } } as unknown as Element;
  const samples: { sample: PointerSample | null; immediate: boolean }[] = [];
  const unsubscribe = tracker.subscribe(element, (sample, immediate) => samples.push({sample, immediate}));
  observe(element, true);
  const move = (x = 100, y = 60, pointerType = "mouse") => view.dispatchEvent(Object.assign(new Event("pointermove"), {clientX: x, clientY: y, pointerType}));
  const flush = () => { const batch = [...frames]; frames.clear(); batch.forEach(callback => callback()); };
  return { tracker, frames, element, samples, move, flush, unsubscribe, document, view, fineMedia, reducedMedia, visible: (visible: boolean) => observe(element, visible), reads: () => reads };
}
test("pointer bursts queue one frame and read only the latest coordinates", () => {
  const f = fixture(); for (let i=0; i<50; i++) f.move(50+i, 60);
  assert.equal(f.frames.size, 1); assert.equal(f.reads(), 0); f.flush();
  assert.equal(f.reads(), 1); assert.deepEqual(f.samples[0].sample, {x:89,y:40,width:200,height:100}); assert.equal(f.frames.size,0); f.tracker.destroy();
});
test("coarse pointer and reduced motion attach no effective tracking", () => {
  for (const f of [fixture(false,false), fixture(true,true)]) { f.move(); f.flush(); assert.equal(f.reads(),0); assert.equal(f.samples.length,0); f.tracker.destroy(); }
});
test("preference changes cancel pending frames and reset immediately", () => {
  const f = fixture(); f.move(); f.flush(); f.move(); f.reducedMedia.matches=true; f.reducedMedia.dispatchEvent(new Event("change"));
  assert.equal(f.frames.size,0); assert.deepEqual(f.samples.at(-1),{sample:null,immediate:true}); f.move(); assert.equal(f.frames.size,0);
  f.reducedMedia.matches=false; f.reducedMedia.dispatchEvent(new Event("change")); f.move(); assert.equal(f.frames.size,1); f.tracker.destroy();
});
test("hidden tabs and off-screen elements stop updates", () => {
  const f=fixture(); f.move(); f.flush(); f.visible(false); const reads=f.reads(); f.move(); f.flush(); assert.equal(f.reads(),reads); assert.equal(f.frames.size,0);
  f.visible(true); f.document.hidden=true; f.document.dispatchEvent(new Event("visibilitychange")); f.move(); assert.equal(f.frames.size,0); f.tracker.destroy();
});
test("leaving, scrolling, keyboard use and touch reset without blocking input", () => {
  const f=fixture(); f.move(); f.flush(); f.move(500,500); f.flush(); assert.deepEqual(f.samples.at(-1),{sample:null,immediate:false});
  f.move(); f.flush(); f.view.dispatchEvent(Object.assign(new Event("keydown"),{key:"Tab"})); assert.deepEqual(f.samples.at(-1),{sample:null,immediate:true});
  f.move(); f.flush(); f.view.dispatchEvent(new Event("scroll")); assert.equal(f.samples.at(-1)?.sample,null);
  f.move(50,50,"touch"); assert.equal(f.frames.size,0); f.tracker.destroy();
});
test("unsubscribe and destroy release subscriptions and queued work", () => {
  const f=fixture(); f.move(); f.unsubscribe(); assert.equal(f.frames.size,0); f.move(); assert.equal(f.frames.size,0); f.tracker.destroy();
});
