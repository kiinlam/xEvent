;(function (window) {
    
    // xv constructor
    var xv = function (target) {
        
        // auto use new xv()
        if( !(this instanceof xv) ){
            return new xv(target);
        }
        
        // attach to dom elem
        target._xEvent = this;
        
        // dom elem access
        this.el = target;
        
        // manage event handlers
        this.handlers = {};
    };
    
    // find valid event type strings
    function findEvents (types) {
        return (types || '').split(/\s+/).filter(function(e){
            return !!e;
        });
    }
    
    // make a DocumentEvent
    xv.Event = function (type, props) {
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
    xv.prototype.findHandlers = function (type, fn) {
        var self = this;
        return (self.handlers[type] || []).filter(function (handler) {
            return handler && (!fn || fn === handler.fn);
        });
    };
    
    // find all added events
    xv.prototype.findAddedEvents = function () {
        return Object.keys(this.handlers);
    };
    
    // add event listener
    xv.prototype.on = function (types, callback, data, capture) {
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
    xv.prototype.off = function (types, callback, capture) {
        var self = this,
            elem = self.el;
        elem && (types ? findEvents(types) : Object.keys(self.handlers)).forEach(function(type){
            var handlers = self.handlers[type];
            self.findHandlers(type, callback).forEach(function(handler){
                delete handlers[handler.i];
                elem.removeEventListener(type, handler.proxy, !!capture);
            });
        });
        return self;
    };
    
    // fire events with given types
    xv.prototype.trigger = function (types, args) {
        var self = this,
            elem = self.el;
        elem && findEvents(types).forEach(function(type){
            event = xv.Event(type);
            event._args = args;
            elem.dispatchEvent(event);
        });
        return self;
    };
    
    // remove everything
    xv.prototype.destroy = function () {
        this.off();
        delete this.el._xEvent;
        this.el = undefined;
        delete this.el;
        this.handlers = undefined;
        delete this.handlers;
        this.constructor = Object;
    };
    
    window.xEvent = xv;
    window.XV === undefined && (window.XV = xv);
})(window);