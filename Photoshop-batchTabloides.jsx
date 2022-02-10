var doc;

try {
    doc = app.activeDocument;
} catch(e) {}


if ($.os.search(/windows/i) != -1) {
    var ticketFiles = File.openDialog("please select files", "*.psd;*.png;*.jpg", true)
} else {
    var ticketFiles = File.openDialog("please select files", getFiles, true)
};

var consecutivo=0;
var saveDir =  decodeURI(doc.path) + '/TABLOIDES';

for (var ticketIndex = 0; ticketIndex < ticketFiles.length; ticketIndex++) {


    consecutivo++;

    var ticketLayer = doc.layers.getByName('BOLETO_' + pad(consecutivo,3));

    if (ticketLayer.kind != "LayerKind.SMARTOBJECT") {
        alert("selected layer is not a smart object")
    } else {
        var replacedTicketLayer = replaceContents(ticketFiles[ticketIndex], ticketLayer);

        app.activeDocument.activeLayer.name = 'BOLETO_' + pad(consecutivo,3)

    }

    if( consecutivo == 16  ){
        consecutivo=0;

        page = (ticketIndex+1) / 16
        fileName = saveDir + '/TABLOIDE_'+pad(page,3)+'.jpg'
                    
        try{
            exportJPEG(fileName)
        } catch(e) {
            alert(e)
        }
        
    }

}

function pad(number, length) {
   
    var str = '' + number;
    while (str.length < length) {
        str = '0' + str;
    }
   
    return str;

}

function getFiles(theFile) {
    if (theFile.name.match(/\.(psd|tif|jpg)$/i) != null || theFile.constructor.name == "Folder") {
        return true
    };
};

// Via @Circle B: https://graphicdesign.stackexchange.com/questions/92796/replacing-a-smart-object-in-bulk-with-photoshops-variable-data-or-scripts/93359

function replaceContents(newFile, theSO) {
    app.activeDocument.activeLayer = theSO;
    // =======================================================
    var idplacedLayerReplaceContents = stringIDToTypeID("placedLayerReplaceContents");
    var desc3 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    desc3.putPath(idnull, new File(newFile));
    var idPgNm = charIDToTypeID("PgNm");
    desc3.putInteger(idPgNm, 1);
    executeAction(idplacedLayerReplaceContents, desc3, DialogModes.NO);
    return app.activeDocument.activeLayer
}

function exportJPEG(fileName){

    jpg = new JPEGSaveOptions();  
    jpg.embedColorProfile = true;  
    jpg.formatOptions = FormatOptions.STANDARDBASELINE;  
    jpg.matte = MatteType.NONE;  
    jpg.quality = 8;  

    doc.saveAs((new File(fileName)), jpg, true, Extension.LOWERCASE);

}