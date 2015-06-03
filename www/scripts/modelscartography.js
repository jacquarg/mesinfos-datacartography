/**
 * This is a basic example on how to develop a custom node renderer. In
 * this example, the renderer will display an image clipped in a disc,
 * with a border colored according the node's "color" value.
 *
 * If a node as the value "image" to its attribute "type", then it will
 * displayed with the node renderer "sigma.canvas.nodes.image", with the
 * url being its "url" value.
 *
 * IMPORTANT: This node renderer just works with the canvas renderer. If
 * you do want to display images with the WebGL renderer, you will have
 * to develop a specific WebGL node renderer.
 */
sigma.utils.pkg('sigma.canvas.nodes');
sigma.canvas.nodes.personnelle = (function() {

  // Return the renderer itself:
  var renderer = function(node, context, settings) {

    var args = arguments,
        prefix = settings('prefix') || '',
        size = node.size;
        // color = node.color || settings('defaultNodeColor'),
        // url = node.url;

    context.save();
    try {
    context.drawImage(
        node.stampImg,
        node[prefix + 'x'] - size,
        node[prefix + 'y'] - size,
        2 * size,
        2 * size
      );
  } catch (e) {
    console.log(e);
    // console.log(node.data.related);
  }
  context.restore();
  };

  return renderer;
})();

// End renderer..



// options : { saved, templates, }
function ModelsCartography(options) {

    this.g = {
        nodes: [],
        edges: [],
    };

    if (options.saved) {
        this.g.nodes = options.saved;
    }

    this.fileName = options.fileName || "datacarto.json";
    this.containerId = options.containerId || "graph-container";
    this.templates = options.templates;
    this.framesColor = options.framesColor;


    // this.randomEdges();
};


ModelsCartography._class2Node = function(c) {
  var node = {
    id: c.type,
    //label: metaDocType.related,
    // type: metaDocType.genre,
    type: "personnelle",

    x: Math.random(), //TODO
    y: Math.random(), // TODO
    size: 50,
    data: c,
  };

  return node;
};

ModelsCartography._type2DisplayName = function(type) {
    if (type) {
        return type.replace(/[A-Z]/g, ' $&');
    } else {
        return "";
    }
};

ModelsCartography.prototype._setThumb = function(svg, node, callback) {
    // Create a Data URI.
    var mySVG = svg.replace('mockdata-DOCTYPE',
            ModelsCartography._type2DisplayName(node.data.type));

    // set color, replcae default #6ea546 with speficied one :
    mySVG = mySVG.replace(/#6ea546/g, this.framesColor);
    var mySrc = 'data:image/svg+xml;charset=utf-8,' + mySVG;

    // Load up our image.
    node.stampImg = new Image();

    if (callback) {
        node.stampImg.onload = callback;
    }

    node.stampImg.src = mySrc;
    // Then should wait for "onLoad"
};

ModelsCartography.prototype._generateThumb = function(node, callback) {
    var self = this;
    var metaDocType = node.data;
    var template = this.templates[metaDocType.genre];
    $.ajax({
        url: 'img/Logos_doctypes/' + metaDocType.type.toLowerCase() + '.svg',
        success: function(icon, status) {
            mySVG = template.replace('xlink:href="mockdata-ICONURL"', 'xlink:href="data:image/svg+xml;base64,' + btoa(icon) + '"');
            self._setThumb(mySVG, node, callback);
        },
        error: function() {
            // var mySVG = STAMP_TMPL.replace('mockdata-DOCTYPE', metaDocType.displayName);
            self._setThumb(template, node, callback);
        },
    });
};

ModelsCartography.prototype.randomEdges = function() {
    var nodesByIds = this.getNodesByIds();
    var prev;
    for (var nodeId in nodesByIds) {
        if (prev) {

            this.g.edges.push(
            {
                id: prev + nodeId,
                source: prev,
                target: nodeId,
                size: 5,
            });
        }
        prev = nodeId;

    }
};


ModelsCartography.prototype.draw = function() {
    console.log(this);
    async.each(this.g.nodes, this._generateThumb.bind(this), function(err, results) {

        // Clean container
        $('#' + this.containerId).empty();

        var s = new sigma({
            graph: this.g,
            renderer: {
              container: document.getElementById(this.containerId),
              type: 'canvas'
            },
            settings: {
            minNodeSize: 30, //8,
            maxNodeSize: 30, //16,
          },
        });

        //Initialize the dragNodes plugin:
        var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

        // dragListener.bind('startdrag', function(event) {
        //   console.log(event);
        // });
        // dragListener.bind('drag', function(event) {
        //   console.log(event);
        // });
        // dragListener.bind('drop', function(event) {
        //   console.log(event);
        // });
        //dragListener.bind('dragend', function(event) {
        //console.log(event);
        // var eN = event.data.node;
        // var n = nodePositionByIds[eN.id];
        // n.x = eN.x;
        // n.y = eN.y;
        //});
    }.bind(this));
};

ModelsCartography.prototype.getNodesByIds = function() {
    var nodesByIds = {};
    this.g.nodes.forEach(function(node) { nodesByIds[node.id] = node; });

    return nodesByIds;
};


ModelsCartography.prototype.update = function(classes) {
    var nodesByIds = this.getNodesByIds();

    classes.forEach(function(c) {
        if (c.type in nodesByIds) {
            nodesByIds[c.type].data = c;
        } else {
            var node = ModelsCartography._class2Node(c);
            this.g.nodes.push(node);
        }
    });

    //Update view
    this.draw();
};

ModelsCartography.prototype.updateFromGSS = function(classes) {
    fetchFromSpreadsheet(this.spreadSheetUri, this.update.bind(this));
};



ModelsCartography.prototype.save = function() {
    var e = this.g.nodes.map(function(node) {
        var eNode = $.extend({}, true, node);
        eNode.stampImg = undefined;
        return eNode;
    });
    displayJSON(e);

    var blob = new Blob([JSON.stringify(e, null, 2)], {type: "text/json;charset=utf-8"});
    saveAs(blob, this.fileName);

};

