// Define spreadsheet URL.
var SPS_EXPE_MESINFOS = 'https://docs.google.com/a/hoodbrains.com/spreadsheets/d/11FHr8STCtM4M-Kd6jznsR9d5cP6_mzqAzlXsN5Us0PY/edit#gid=0'

// $('#graph-container').
function fetchFromSpreadsheet(callback) {
    sheetrock({
        url: SPS_EXPE_MESINFOS,
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
        fields: true,
        values: true,
    };
    var docTypes = [];

    for (i=0;i<rows.length;i++) { //
        row = rows[i].cells;
        if (row.comment) { continue; }

        docType = row.docType;
        if (row.docType && row.docType !== "" && currentDT.docType !== row.docType) {
            // New doctype
            if (currentDT.docType) {  // Initialization.
                docTypes.push(currentDT);
            }

            currentDT = $.extend({}, true, row);

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


