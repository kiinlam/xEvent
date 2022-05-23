# xEvent

一个基于DocumentEvent的简易事件处理器。

`event.initEvent` 已被废弃，使用新的 `Event` 构造函数代替，参见：

https://developer.mozilla.org/en-US/docs/Web/Events/Creating_and_triggering_events

eg:

```
const event = new Event('build');

// Listen for the event.
elem.addEventListener('build', function (e) { /* ... */ }, false);

// Dispatch the event.
elem.dispatchEvent(event);
```
