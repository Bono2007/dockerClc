// svg.touch-draggable.js basé sur :
// svg.draggable.js 0.12 - Copyright (c) 2013 Wout Fierens - Licensed under the MIT license
//
SVG.extend(SVG.Element, {
  // Make element draggable
  touchDraggable: function(constraint) {
    var start, drag, end,
      element = this,
      parent  = this.parent._parent(SVG.Nested) || this._parent(SVG.Doc);
    
    /* remove draggable if already present */
    if (typeof this.fixed == 'function')
      this.fixed();
    
    /* ensure constraint object */
    constraint = constraint || {};
    
    /* start dragging */
    start = function(event) {
      event = event || window.event;
      console.log("eventType",event.type);
      /* prevent selection dragging */
      event.preventDefault ? event.preventDefault() : event.returnValue = false;
      
      var box;
      
      /* invoke any callbacks */
      if (element.beforedrag)
        element.beforedrag(event);
      
      /* get element bounding box */
      box = element.bbox();
      
      if (element instanceof SVG.G) {
        box.x = element.trans.x;
        box.y = element.trans.y;
        
      } else if (element instanceof SVG.Nested) {
        box = {
          x:      element.x(),
          y:      element.y(),
          width:  element.attr('width'),
          height: element.attr('height')
        };
      }
      
      /* store event */
      element.startEvent = event;
      if (event.type=="touchstart") {
        element.startPageX=event.touches[0].pageX;
        element.startPageY=event.touches[0].pageY;
      }
      
      
      /* store start position */
      element.startPosition = {
        x:        box.x,
        y:        box.y,
        width:    box.width,
        height:   box.height,
        zoom:     parent.viewbox().zoom,
        rotation: element.transform('rotation') * Math.PI / 180
      };
      
      //alert(element.startEvent.pageX +" "+element.startPosition.x )
      
      /* add while and end events to window */
      SVG.on(window, 'touchmove', drag);
      SVG.on(window, 'mousemove', drag);
      
      SVG.on(window, 'touchend',   end);
      SVG.on(window, 'mouseup',   end);

      /* invoke any callbacks */
      if (element.dragstart)
        element.dragstart({ x: 0, y: 0, zoom: element.startPosition.zoom }, event);
    };
    
    /* while dragging */
    drag = function(event) {
      event = event || window.event;
      /* prevent default */
      event.preventDefault ? event.preventDefault() : event.returnValue = false;
      
      if (element.startEvent) {
        
        /* calculate move position */
        var x, y, delta,
            rotation  = element.startPosition.rotation,
            width     = element.startPosition.width,
            height    = element.startPosition.height;
          
          if (event.type == "touchmove") {
            delta     = {
              x:    event.touches[0].pageX-(element.startPageX - element.startPosition.x),
              y:    event.touches[0].pageY -(element.startPageY - element.startPosition.y),
              zoom: element.startPosition.zoom
            };
          } else {
            delta     = {
              x:    event.pageX - (element.startEvent.pageX- element.startPosition.x),
              y:    event.pageY - (element.startEvent.pageY- element.startPosition.y),
              zoom: element.startPosition.zoom
            };
          }
        
        /* caculate new position [with rotation correction] */
        x = (delta.x * Math.cos(rotation) + delta.y * Math.sin(rotation))  / element.startPosition.zoom;
        //x = element.startPosition.x + (delta.x * Math.cos(rotation) + delta.y * Math.sin(rotation))  / element.startPosition.zoom
        y =  (delta.y * Math.cos(rotation) + delta.x * Math.sin(-rotation)) / element.startPosition.zoom;
        
        /* recalculate any offset */
        if (element._offset) {
          x -= element._offset.x;
          y -= element._offset.y;
        }
        
        
        
        /* keep element within constrained box */
        if (constraint.minX !== null && x < constraint.minX)
          x = constraint.minX;
        else if (constraint.maxX !== null && x > constraint.maxX - width)
          x = constraint.maxX - width;
        
        if (constraint.minY !== null && y < constraint.minY)
          y = constraint.minY;
        else if (constraint.maxY !== null && y > constraint.maxY - height)
          y = constraint.maxY - height;
        
        /* move the element to its new position */
        
        element.move(x, y);

        /* invoke any callbacks */
        if (element.dragmove)
          element.dragmove(delta, event);
      }
      
    };
    
    /* when dragging ends */
    end = function(event) {
      event = event || window.event;
      
      /* prevent default */
      event.preventDefault ? event.preventDefault() : event.returnValue = false  ;
      
      /* calculate move position */
      if (event.type == "mouseup") {
        var delta = {
            x:    event.pageX - element.startEvent.pageX,
            y:    event.pageY - element.startEvent.pageY,
            
            zoom: element.startPosition.zoom
        };
      }
      else if (event.type == "touchend") {
        var delta = {
            x:    event.changedTouches[0].pageX - element.startEvent.touches[0].pageX,
            y:    event.changedTouches[0].pageY - element.startEvent.touches[0].pageY,
            //x:    event.changedTouches[0].pageX - element.startPageX,
            //y:    event.changedTouches[0].pageY - element.startPageY,
            zoom: element.startPosition.zoom
        };
      }
      
      
      
      /* invoke any callbacks */
      if (element.dragend)
        element.dragend(delta, event);
      
      /* reset store */
      element.startEvent    = null;
      element.startPosition = null;

      /* remove while and end events to window */
      SVG.off(window, 'mousemove', drag);
      SVG.off(window, 'touchmove', drag);
      SVG.off(window, 'mouseup',   end);
      SVG.off(window, 'touchend',   end);

      
    };
    
    /* bind mousedown event */
    element.on('touchstart', start);
    element.on('mousedown', start);
    
    
    /* disable draggable */
    element.fixed = function() {
      element.off('mousedown', start);
      SVG.off(window, 'mousemove', drag);
      SVG.off(window, 'mouseup',   end);
      
      element.off('touchstart', start);
      SVG.off(window, 'touchmove', drag);
      SVG.off(window, 'touchend',   end);
      
      start = drag = end = null;
      
      return element;
    };
    
    return this;
  }
  
});