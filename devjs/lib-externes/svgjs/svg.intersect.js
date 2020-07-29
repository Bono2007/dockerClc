// svg.intersect.js

SVG.extend(SVG.Element, {
  // returns true if elts bounding boxes intersect
  // retourne true si les bounding boxes des deux éléments se recouvrent
  intersect: function(targetElt) {
    var i = isPointInsideBBox;
    var bbox1 = this.bbox();
    var bbox2 = targetElt.bbox();
    function isPointInsideBBox(bbox,x,y) {
      return x >= bbox.x && x <= bbox.x+bbox.width && y >= bbox.y && y <= bbox.y+bbox.height;
    }
    return i(bbox2, bbox1.x, bbox1.y)
        || i(bbox2, bbox1.x+bbox1.width, bbox1.y)
        || i(bbox2, bbox1.x, bbox1.y+bbox1.height)
        || i(bbox2, bbox1.x2, bbox1.y+bbox1.height)
        || i(bbox1, bbox2.x, bbox2.y)
        || i(bbox1, bbox2.x+bbox2.width, bbox2.y)
        || i(bbox1, bbox2.x, bbox2.y+bbox2.height)
        || i(bbox1, bbox2.x+bbox2.width, bbox2.y+bbox2.height)
        || (bbox1.x < bbox2.x+bbox2.width && bbox1.x > bbox2.x || bbox2.x < bbox1.x+bbox1.width && bbox2.x > bbox1.x)
        && (bbox1.y < bbox2.y+bbox2.height && bbox1.y > bbox2.y || bbox2.y < bbox1.y+bbox1.height && bbox2.y > bbox1.y);
  }
});