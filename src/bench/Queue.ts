import type { EventListener } from "../types/EventListener";

interface Entry {
    _original: any;
    events: {
        abort: EventListener[];
        cycle: EventListener[];
        error: EventListener[];
        start: EventListener[];
    };
}

export type Queue = Entry[];
