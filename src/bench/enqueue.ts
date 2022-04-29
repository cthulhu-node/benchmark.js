import type { EventListener } from "../types/EventListener";
import type { Queue } from "./Queue";

export function enqueue(queue: Queue, bench: any, listener: EventListener) {
  queue.push(Object.assign(bench.clone(), {
    _original: bench,
    events: {
      abort: [listener],
      cycle: [listener],
      error: [listener],
      start: [listener]
    }
  }));
}
