
var displayJSON = function(data) { console.log(JSON.stringify(data, null, 2));};

var carto = null;

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
    var options = $.extend(miConfig, {
        saved: results[0],
        templates: {
            personnelle: results[1],
            open: results[2],
            referentiel: results[3],
        },
    });

    carto = new ModelsCartography(options);
    carto.draw();

$("#save").click(carto.save.bind(carto));

$("#load").click(carto.updateFromGSS.bind(carto));

});
