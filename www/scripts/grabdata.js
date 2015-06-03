// Define spreadsheet URL.
//var SPS_EXPE_MESINFOS = 'https://docs.google.com/a/hoodbrains.com/spreadsheets/d/11FHr8STCtM4M-Kd6jznsR9d5cP6_mzqAzlXsN5Us0PY/edit#gid=128913589'
var SPS_EXPE_MESINFOS = 'https://docs.google.com/a/hoodbrains.com/spreadsheets/d/11FHr8STCtM4M-Kd6jznsR9d5cP6_mzqAzlXsN5Us0PY/edit#gid=1283790985'

// $('#graph-container').
function fetchFromSpreadsheet(spreadSheetUri, callback) {
    // STUB
    // $.getJSON('data/MIS-datamodel.json', function(json) { callback(null, json); });
    // return
    // // END Stub

    sheetrock({
        url: spreadSheetUri,
        callback: function (error, options, response) {
            if (error) { return callback(error); }
            var metaDoctypes, err;
            try {
                metaDoctypes = rows2MetaDoctype(response.rows);
                callback(err, metaDoctypes);
            } catch (e) {
                err = e
                console.log(e);
            }
            // callback(err, metaDoctypes);
      }
    });
}

var rows2MetaDoctype = function(rows) {
    var i, row, currentDT = {}, docType, k, v;

    var fieldsCol = {
        champs: true,
        champsValeur: true,
        champsType: true,
        champsDescription: true,
    };
    var docTypes = [];

    for (i=0;i<rows.length;i++) { //
        row = rows[i].cells;
        if (row.commentaires) { continue; }

        if (row.type && row.type !== "" && currentDT.type !== row.type) {
            // New doctype
            if (currentDT.type) {  // Initialization.
                docTypes.push(currentDT);
            }

            currentDT = $.extend({}, true, row);

            // Clean empty keys
            for (k in currentDT) {
                if (currentDT[k] == null || currentDT[k] === "") {
                    delete currentDT[k];
                }
            }
            for (k in fieldsCol) {
                delete currentDT[k];
            }
            currentDT.fields = [];

        }

        // extract data of a field
        field = {};
        for (k in fieldsCol) {
            field[k] = row[k];
        }

        currentDT.fields.push(field);

    }
    // add last document.
    docTypes.push(currentDT);
    //console.log(docTypes);
    return docTypes;
};


