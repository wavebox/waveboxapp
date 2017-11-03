import { EventEmitter } from 'events'
const emitter = new EventEmitter()

const events = {
  // Windows
  WB_WINDOW_CREATED: 'WB_WINDOW_CREATED',
  WB_WINDOW_DESTROYED: 'WB_WINDOW_DESTROYED',
  WB_WINDOW_FOCUSED: 'WB_WINDOW_FOCUSED',
  WB_WINDOW_BLURRED: 'WB_WINDOW_BLURRED',

  // Tabs
  WB_TAB_CREATED: 'WB_TAB_CREATED',
  WB_TAB_DESTROYED: 'WB_TAB_DESTROYED',
  WB_TAB_ACTIVATED: 'WB_TAB_ACTIVATED'
}

for (var k in events) {
  emitter[k] = events[k]
}

export default emitter
