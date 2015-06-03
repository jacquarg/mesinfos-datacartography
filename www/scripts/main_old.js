
var displayJSON = function(data) { console.log(JSON.stringify(data, null, 2));};

var g = {
  nodes: [],
  edges: [],
};
var nodePositionByIds = {};

async.parallel([
  function(cb) {
    $.getJSON(miConfig.positionsUri,
      function(data) { cb(null, data); });
  },
  function(cb) {
    $.get("templates/metadoctype_stamp.svg",
      function(svgSTR) { cb(null, svgSTR); });
  },
  function(cb) {
    $.get("templates/open_stamp.svg",
      function(svgSTR) { cb(null, svgSTR); });
  },
  function(cb) {
    $.get("templates/referencial_stamp.svg",
      function(svgSTR) { cb(null, svgSTR); });
  },
  ],
  function(err, results) {
    g.nodes = results[0];
    templates = {
        personnelle: results[1],
        open: results[2],
        referentiel: results[3],
    }

    // Skip, only on Spreadsheet load !
    /*
    var skip = {
'Risk':true,
'# Base object, user manage tasks':true,
'User':true,
'Album':true,
'HomeInsuranceContract':true,
'Client':true,
'RiskHome':true,
'Contract':true,
'Person':true,
'Mail':true,
'Contact':true,
'CarInsuranceContract':true,
'InsuranceScoring':true,
'Quittance':true,
'InsuranceClaim':true,
'Vehicle':true,
'RiskVehicle':true,
'Savings':true,
'InsuranceContract':true,
'Home':true,
'Premiums': true,
'Tarification': true,
'Notifications': true,
'Note': true,
'Photo': true,
'# Todo list contains tasks. Each tasks are linked inside todo list.': true,
'Notifications': true,
};

    // skip doctypes :
    metaDocTypes = metaDocTypes.filter(function(mDT) { return !(mDT.related in skip); })

    g.nodes = metaDocTypes.map(metaDocType2Node);
    // END skip
    */

    async.map(g.nodes, generateSVG, function(err, results) {
      show();});


    // $("#test").attr("src", data[0].stampImg.src);
    for (var i=0; i< g.nodes.length; i++) {
      var node = g.nodes[i];
      if (node.id in nodePositionByIds) {
        node.x = nodePositionByIds[node.id].x;
        node.y = nodePositionByIds[node.id].y;
      } else {
        nodePositionByIds[node.id] = {
          id: node.id,
          x: node.x,
          y: node.y,
        };
      }
    }
  });


var metaDocType2Node = function(metaDocType) {
  var node = {
    id: metaDocType.type,
    //label: metaDocType.related,
    // type: metaDocType.genre,
    type: "personnelle",

    x: Math.random(), //TODO
    y: Math.random(), // TODO
    size: 50,
    data: metaDocType,
  };

  return node;
};

var type2DisplayName = function(type) {
    if (type) {
        return type.replace(/[A-Z]/g, ' $&');
    } else {
        return "";
    }
};

var generateSVG = function(node, callback) {
    var metaDocType = node.data;
    var template = templates[metaDocType.genre];
  $.ajax({
      url: 'img/Logos_doctypes/' + metaDocType.type.toLowerCase() + '.svg',
      success: function(icon, status) {
    // var icon = new Image();
    // icon.src = 'img/cozycloud_big.jpeg';
    // icon.onload = function(icon, status) {

      mySVG = template.replace('xlink:href="mockdata-ICONURL"', 'xlink:href="data:image/svg+xml;base64,' + btoa(icon) + '"');
      // mySVG = mySVG.replace('mockdata-ICONURL', 'data:image/svg+xml;charset=utf-8,' + icon);
    setImg(mySVG);
      },
      error: function() {
        // var mySVG = STAMP_TMPL.replace('mockdata-DOCTYPE', metaDocType.displayName);
        setImg(template);
      },
    });


  var setImg = function(mySVG) {
  // console.log(mySVG);
  // Create a Data URI.
      var mySVG = mySVG.replace('mockdata-DOCTYPE', type2DisplayName(metaDocType.type));
      // set color, replcae default #6ea546 with speficied one :
      mySVG = mySVG.replace(/#6ea546/g, miConfig.framesColor);
    var mySrc = 'data:image/svg+xml;charset=utf-8,' + mySVG;

  // Load up our image.
  node.stampImg = new Image();

  if (callback) {
    node.stampImg.onload = callback;
  }

  node.stampImg.src = mySrc;
  // Then should wait for "onLoad"
  };
};

///////////////







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

$("#save").click(function() {

    // displayJSON(nodePositionByIds);
    // var blob = new Blob([JSON.stringify(nodePositionByIds, null, 2)], {type: "text/json;charset=utf-8"});
    // saveAs(blob, "disposition.json");
    var e = g.nodes.map(function(node) {
        var eNode = $.extend({}, true, node);
        eNode.stampImg = undefined;
        return eNode;
    });
    displayJSON(e);

    var blob = new Blob([JSON.stringify(e, null, 2)], {type: "text/json;charset=utf-8"});
    saveAs(blob, "datacarto.json");
});

$("#load").click(function() {
    updateDataModelFromSS();
});


var s;
$("#show").click(function() { show(); });

var show = function() {

    // Clean container
    $('#graph-container').empty();

  s = new sigma({
    graph: g,
    renderer: {
      // IMPORTANT:
      // This works only with the canvas renderer, so the
      // renderer type set as "canvas" is necessary here.
      container: document.getElementById('graph-container'),
      type: 'canvas'
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
  dragListener.bind('dragend', function(event) {
    console.log(event);
    var eN = event.data.node;
    var n = nodePositionByIds[eN.id];
    n.x = eN.x;
    n.y = eN.y;

  });

};

var updateDataModelFromSS = function() {
  fetchFromSpreadsheet(miConfig.spreadSheetUri, function(err, metaDocTypes) {

    // Skip, only on Spreadsheet load !
//     var skip = {
// 'Risk':true,
// '# Base object, user manage tasks':true,
// 'User':true,
// 'Album':true,
// 'HomeInsuranceContract':true,
// 'Client':true,
// 'RiskHome':true,
// 'Contract':true,
// 'Person':true,
// 'Mail':true,
// 'Contact':true,
// 'CarInsuranceContract':true,
// 'InsuranceScoring':true,
// 'Quittance':true,
// 'InsuranceClaim':true,
// 'Vehicle':true,
// 'RiskVehicle':true,
// 'Savings':true,
// 'InsuranceContract':true,
// 'Home':true,
// 'Premiums': true,
// 'Tarification': true,
// 'Notifications': true,
// 'Note': true,
// 'Photo': true,
// '# Todo list contains tasks. Each tasks are linked inside todo list.': true,
// 'Notifications': true,
// };

//     // skip doctypes :
//     metaDocTypes = metaDocTypes.filter(function(mDT) { return !(mDT.related in skip); })

    // g.nodes = metaDocTypes.map(metaDocType2Node);

    // update nodes with metadoctypes <--
    nodesByIds = {};
    g.nodes.forEach(function(node) { nodesByIds[node.id] = node; });

    metaDocTypes.forEach(function(metaDocType) {
        if (metaDocType.type in nodesByIds) {
            nodesByIds[metaDocType.type].data = metaDocType;
        } else {
            console.log(metaDocType);
            var node = metaDocType2Node(metaDocType)
            console.log(node);
            g.nodes.push(node);
        }
    });

    //Update view.
    async.map(g.nodes, generateSVG, function(err, results) {
      show();});

  });

};

// // Now that's the renderer has been implemented, let's generate a graph
// // to render:
// var i,
//     s,
//     img,
//     // N = 100,
//     N = 50,
//     E = 500,
//     g = {
//       nodes: [],
//       edges: []
//     },
//     urls = [
//       'img/alarm_ATTR.svg',
//       // 'img/Logos_doctypes/album_ATTR.svg',
//       //'img/Logos_doctypes/Anonymous_hot_surface_danger.svg',
//       // 'img/Logos_doctypes/application_ATTR.svg',
//       // 'img/Logos_doctypes/attachment_ATTR.svg',
//       // 'img/Logos_doctypes/bankaccount.svg',
//       // 'img/Logos_doctypes/banklog_ATTR.svg',
//       // 'img/Logos_doctypes/banklog_deprecated.svg',
//       // 'img/Logos_doctypes/bookmark.svg',
//       // 'img/Logos_doctypes/browsedcompany.svg',
//       // 'img/Logos_doctypes/buying_ATTR.svg',
//       // 'img/Logos_doctypes/carinsurancecontract.svg',
//       // 'img/Logos_doctypes/client.svg',
//       // 'img/Logos_doctypes/contact.svg',
//       // 'img/Logos_doctypes/contract_ATTR.svg',
//       // 'img/Logos_doctypes/geolocationlog.svg',
//       // 'img/Logos_doctypes/home.svg',
//       // 'img/Logos_doctypes/homeinsurancecontract.svg',
//       // 'img/Logos_doctypes/insuranceclaim_ATTR.svg',
//       // 'img/Logos_doctypes/insurancecontract.svg',
//       // 'img/Logos_doctypes/insurancescoring.svg',
//       // 'img/Logos_doctypes/LogoPartDonnees_sprite.svg',
//       // 'img/Logos_doctypes/loyaltycard.svg',
//       // 'img/Logos_doctypes/mail.svg',
//       // 'img/Logos_doctypes/map.svg',
//       // 'img/Logos_doctypes/note_ATTR.svg',
//       // 'img/Logos_doctypes/notification_ATTR.svg',
//       // 'img/Logos_doctypes/person.svg',
//       // 'img/Logos_doctypes/phonecommunicationlog_ATTR.svg',
//       // 'img/Logos_doctypes/photo_ATTR.svg',
//       // 'img/Logos_doctypes/quittance.svg',
//       // 'img/Logos_doctypes/receiptdetail_ATTR.svg',
//       // 'img/Logos_doctypes/risk.svg',
//       // 'img/Logos_doctypes/riskhome.svg',
//       // 'img/Logos_doctypes/riskvehicle.svg',
//       // 'img/Logos_doctypes/savings_ATTR.svg',
//       // 'img/Logos_doctypes/scale.svg',
//       // 'img/Logos_doctypes/shop.svg',
//       // 'img/Logos_doctypes/statistics.svg',
//       // 'img/Logos_doctypes/task_ATTR.svg',
//       // 'img/Logos_doctypes/todolist.svg',
//       // 'img/Logos_doctypes/traffic.svg',
//       // 'img/Logos_doctypes/trainticket_ATTR.svg',
//       // 'img/Logos_doctypes/user.svg',
//       // 'img/Logos_doctypes/vehicle.svg',
//       // 'img/Logos_doctypes/videoondemand_ATTR.svg',
//       // 'img/Logos_doctypes/weather.svg',
//       // 'img/Logos_doctypes/webbrowsinglog_ATTR.svg',
//       // 'img/Logos_doctypes/webinput_ATTR.svg',
//       // 'img/img1.png',
//       // 'img/img2.png',
//       // 'img/img3.png',
//       // 'img/img4.png'
//     ],
//     loaded = 0,
//     colors = [
//       '#617db4',
//       '#668f3c',
//       '#c6583e',
//       '#b956af'
//     ];

// // Generate a random graph, with ~30% nodes having the type "image":
// for (i = 0; i < N; i++) {
//   // img = Math.random() >= 0.7;
//   img = true;
//   g.nodes.push({
//     id: 'n' + i,
//     label: 'Node ' + i,
//     type: img ? 'image' : 'def',
//     url: img ? urls[Math.floor(Math.random() * urls.length)] : null,
//     customData: 'truc',
//     x: Math.random(),
//     y: Math.random(),
//     size: Math.random(),
//     color: colors[Math.floor(Math.random() * colors.length)]
//   });
// }

// for (i = 0; i < E; i++)
//   g.edges.push({
//     id: 'e' + i,
//     source: 'n' + (Math.random() * N | 0),
//     target: 'n' + (Math.random() * N | 0),
//     size: Math.random()
//   });

// // Then, wait for all images to be loaded before instanciating sigma:
// urls.forEach(function(url) {
//   sigma.canvas.nodes.image.cache(
//     url,
//     function() {
//       if (++loaded === urls.length)
//         // Instantiate sigma:
//         s = new sigma({
//           graph: g,
//           renderer: {
//             // IMPORTANT:
//             // This works only with the canvas renderer, so the
//             // renderer type set as "canvas" is necessary here.
//             container: document.getElementById('graph-container'),
//             type: 'canvas'
//           },
//           settings: {
//             minNodeSize: 20, //8,
//             maxNodeSize: 50, //16,
//           }
//         });

//         // // test events !
//         // s.bind('overNode clickNode', function(e) {
//         //   console.log(e.type, e.data.node.label, e.data.captor);
//         // });
//         // s.bind('clickNode', function(e) {
//         //   console.log(e);
//         //   var url;
//         //   if (e.data.node.oldUrl) {
//         //     url = e.data.node.oldUrl;
//         //   } else {
//         //     url = 'img/Logos_doctypes/Anonymous_hot_surface_danger.svg';
//         //   }
//         //   e.data.node.oldUrl = e.data.node.url;
//         //   e.data.node.url = url;

//         //   e.target.render();

//         //   console.log(e.type, e.data.node.label, e.data.captor);
//         //   // alert("ce que vous voulez !")
//         // });


//         // Initialize the dragNodes plugin:
//         var dragListener = sigma.plugins.dragNodes(s, s.renderers[0]);

//         dragListener.bind('startdrag', function(event) {
//           console.log(event);
//         });
//         dragListener.bind('drag', function(event) {
//           console.log(event);
//         });
//         dragListener.bind('drop', function(event) {
//           console.log(event);
//         });
//         dragListener.bind('dragend', function(event) {
//           console.log(event);
//         });
//     }
//   );
// });
