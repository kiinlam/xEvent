;(function (window) {
    
    // xEvent constructor
    var xEvent = function (target) {
        
        // auto use new xEvent()
        if( !(this instanceof xEvent) ){
            return new xEvent(target);
        }
        
        // attach to dom elem
        target.xEvent = this;
        
        // dom elem access
        this.el = target;
        
        // manage event handlers
        this.handlers = {};
    };
    
    // find valid event type strings
    function findEvents (types) {
        return (types || '').split(/\s/).filter(function(e){
            return !!e;
        });
    }
    
    // make a DocumentEvent
    xEvent.Event = function (type, props) {
        var event = document.createEvent('Event'), bubbles = true;
        if (props) {
            for (var name in props) {
                (name == 'bubbles') ? (bubbles = !!props[name]) : (event[name] = props[name]);
            }
        }
        event.initEvent(type, bubbles, true);
        return event;
    };
    
    // find all event handlers of given type
    xEvent.prototype.findHandlers = function (type, fn) {
        var self = this;
        return (self.handlers[type] || []).filter(function (handler) {
            return handler && (!fn || fn === handler.fn);
        });
    };
    
    // add event listener
    xEvent.prototype.on = function (types, callback, data, capture) {
        var self = this;
        var elem = self.el;
        elem && findEvents(types).forEach(function(type){
            var handlers = (self.handlers[type] || (self.handlers[type] = []));
            var handler = {
                i: handlers.length,
                fn: callback,
                target: elem,
                type: type,
                proxy: function(e) {
                    e.data = data;
                    var result = callback.apply(elem, e._args == undefined ? [e] : [e].concat(e._args));
                    if (result === false) {
                        e.preventDefault();
                        e.stopPropagation();
                    }
                    return result;
                }
            };
            handlers.push(handler);
            self.el.addEventListener(type, handler.proxy, !!capture);
        });
        return self;
    };
    
    // remove event listener
    xEvent.prototype.off = function (types, callback, capture) {
        var self = this,
            elem = self.el;
        elem && findEvents(types).forEach(function(type){
            var handlers = self.handlers[type];
            self.findHandlers(type, callback).forEach(function(handler){
                delete handlers[handler.i];
                elem.removeEventListener(type, handler.proxy, !!capture);
            });
        });
        return self;
    };
    
    // fire events with given types
    xEvent.prototype.trigger = function (types, args) {
        var self = this,
            elem = self.el;
            
        elem && findEvents(types).forEach(function(type){
            event = xEvent.Event(type);
            event._args = args;
            elem.dispatchEvent(event);
        });
        return self;
    };
    
    window.xEvent = xEvent;
})(window);