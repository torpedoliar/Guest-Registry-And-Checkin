import { EventEmitter } from 'events';

export type ServerEvent =
  | { type: 'checkin'; data: any }
  | { type: 'uncheckin'; data: any }
  | { type: 'config'; data: any }
  | { type: 'preview'; data: any | null };

const emitter = new EventEmitter();
emitter.setMaxListeners(1000);

export function emitEvent(ev: ServerEvent) {
  emitter.emit('event', ev);
}

export function onEvent(listener: (ev: ServerEvent) => void) {
  const wrapped = (ev: ServerEvent) => listener(ev);
  emitter.on('event', wrapped);
  return () => emitter.off('event', wrapped);
}
