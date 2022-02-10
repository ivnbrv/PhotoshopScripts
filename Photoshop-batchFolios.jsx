var doc;

try {
    doc = app.activeDocument;
} catch(e) {}



var folioText = doc.layers.getByName('CONSECUTIVO_TALON');
var qrLayer = doc.layers.getByName('QR_BOLETO');
var saveDir =  decodeURI(doc.path) + '/BOLETOS';
var qrDir =  decodeURI(doc.path) + '/QR_BOLETOS';


if (folioText) {

    if ($.os.search(/windows/i) != -1) {
            var qrFiles = File.openDialog("please select files", "*.psd;*.png;*.jpg", true)
    } else {
        var qrFiles = File.openDialog("please select files", getFiles, true)

    };


    for (var consecutivo = 250; consecutivo < qrFiles.length; consecutivo++) {

        
        folio = pad((consecutivo+1),3);

        if (qrLayer.kind != "LayerKind.SMARTOBJECT") {
            alert("selected layer is not a smart object")
        } else {

            
            if (qrFiles) {


                var smartObject = openSmartObject(qrLayer);
                var newSO = placeScaleRotateFile(qrFiles[consecutivo], 0, 0, 180, 180, 0);
                scaleLayerToFitCanvas();
                hideOthers();
                saveSmartObject(smartObject);


                app.activeDocument = doc;

                if(qrFiles[consecutivo].name ==='ticket-' + folio + '.png'){

                    folioText.textItem.contents = '0' + folio;

                    fileName = saveDir + '/BOLETO_'+folio+'.jpg'
                    
                    try{
                        exportJPEG(fileName)
                    } catch(e) {
                        alert(e)
                    }

                }
            }
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

function openSmartObject(smartObjectLayer){

    if (smartObjectLayer.kind == "LayerKind.SMARTOBJECT")

    {

        var idplacedLayerEditContents = stringIDToTypeID("placedLayerEditContents");

        var desc2 = new ActionDescriptor();

        executeAction(idplacedLayerEditContents, desc2, DialogModes.NO);

    };

    return app.activeDocument

};

function getFiles(theFile) {
    if (theFile.name.match(/\.(psd|tif|jpg)$/i) != null || theFile.constructor.name == "Folder") {
        return true
    };
};

function placeScaleRotateFile(file, xOffset, yOffset, theXScale, theYScale, theAngle)

{

    var idPlc = charIDToTypeID("Plc ");

    var desc5 = new ActionDescriptor();

    var idnull = charIDToTypeID("null");

    desc5.putPath(idnull, new File(file));

    var idFTcs = charIDToTypeID("FTcs");

    var idQCSt = charIDToTypeID("QCSt");

    var idQcsa = charIDToTypeID("Qcsa");

    desc5.putEnumerated(idFTcs, idQCSt, idQcsa);

    var idOfst = charIDToTypeID("Ofst");

    var desc6 = new ActionDescriptor();

    var idHrzn = charIDToTypeID("Hrzn");

    var idPxl = charIDToTypeID("#Pxl");

    desc6.putUnitDouble(idHrzn, idPxl, xOffset);

    var idVrtc = charIDToTypeID("Vrtc");

    var idPxl = charIDToTypeID("#Pxl");

    desc6.putUnitDouble(idVrtc, idPxl, yOffset);

    var idOfst = charIDToTypeID("Ofst");

    desc5.putObject(idOfst, idOfst, desc6);

    var idWdth = charIDToTypeID("Wdth");

    var idPrc = charIDToTypeID("#Prc");

    desc5.putUnitDouble(idWdth, idPrc, theYScale);

    var idHght = charIDToTypeID("Hght");

    var idPrc = charIDToTypeID("#Prc");

    desc5.putUnitDouble(idHght, idPrc, theXScale);

    var idAngl = charIDToTypeID("Angl");

    var idAng = charIDToTypeID("#Ang");

    desc5.putUnitDouble(idAngl, idAng, theAngle);

    var idLnkd = charIDToTypeID("Lnkd");

    desc5.putBoolean(idLnkd, true);

    executeAction(idPlc, desc5, DialogModes.NO);

    return app.activeDocument.activeLayer;

};


function scaleLayerToFitCanvas(){

    var ref = new ActionReference();

    ref.putProperty(stringIDToTypeID("property"), stringIDToTypeID("bounds"));

    ref.putEnumerated(charIDToTypeID("Lyr "), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

    var layerDesc = executeActionGet(ref);

    var theBounds = layerDesc.getObjectValue(stringIDToTypeID("bounds"));

    var layerX = theBounds.getUnitDoubleValue(stringIDToTypeID("left"));

    var layerY = theBounds.getUnitDoubleValue(stringIDToTypeID("top"));

    var layerWidth = theBounds.getUnitDoubleValue(stringIDToTypeID("right")) - layerX;

    var layerHeight = theBounds.getUnitDoubleValue(stringIDToTypeID("bottom")) - layerY;

    var ref1 = new ActionReference();

    ref1.putEnumerated(charIDToTypeID("Dcmn"), charIDToTypeID("Ordn"), charIDToTypeID("Trgt"));

    var docDesc = executeActionGet(ref1);

    var docWidth = docDesc.getUnitDoubleValue(stringIDToTypeID("width"));

    var docHeight = docDesc.getUnitDoubleValue(stringIDToTypeID("height"));

    var docRes = docDesc.getInteger(stringIDToTypeID("resolution"));

    var scaleX = docWidth / layerWidth * docRes / 72 * 85;

    var scaleY = docHeight / layerHeight * docRes / 72 * 85;

    var theScale = Math.min(scaleX, scaleY);

    layerX = ((docWidth * docRes / 144) - (layerX + layerWidth / 2));

    layerY = ((docHeight * docRes / 144) - (layerY + layerHeight / 2));

    var idTrnf = charIDToTypeID("Trnf");

    var desc24 = new ActionDescriptor();

    desc24.putEnumerated(charIDToTypeID("FTcs"), charIDToTypeID("QCSt"), charIDToTypeID("Qcsa"));

    var idOfst = charIDToTypeID("Ofst");

    var desc25 = new ActionDescriptor();

    var idHrzn = charIDToTypeID("Hrzn");

    var idPxl = charIDToTypeID("#Pxl");

    desc25.putUnitDouble(idHrzn, idPxl, layerX);

    var idVrtc = charIDToTypeID("Vrtc");

    desc25.putUnitDouble(idVrtc, idPxl, layerY);

    desc24.putObject(idOfst, idOfst, desc25);

    var idWdth = charIDToTypeID("Wdth");

    var idPrc = charIDToTypeID("#Prc");

    desc24.putUnitDouble(idWdth, idPrc, theScale);

    var idHght = charIDToTypeID("Hght");

    desc24.putUnitDouble(idHght, idPrc, theScale);

    executeAction(idTrnf, desc24, DialogModes.NO);

};

function saveSmartObject(document){

    document.save();
    document.close();
}

function hideOthers()

{

    var idShw = charIDToTypeID("Shw ");

    var desc2 = new ActionDescriptor();

    var idnull = charIDToTypeID("null");

    var list1 = new ActionList();

    var ref1 = new ActionReference();

    var idLyr = charIDToTypeID("Lyr ");

    var idOrdn = charIDToTypeID("Ordn");

    var idTrgt = charIDToTypeID("Trgt");

    ref1.putEnumerated(idLyr, idOrdn, idTrgt);

    list1.putReference(ref1);

    desc2.putList(idnull, list1);

    var idTglO = charIDToTypeID("TglO");

    desc2.putBoolean(idTglO, true);

    executeAction(idShw, desc2, DialogModes.NO);

};

function exportJPEG(fileName){

    jpg = new JPEGSaveOptions();  
    jpg.embedColorProfile = true;  
    jpg.formatOptions = FormatOptions.STANDARDBASELINE;  
    jpg.matte = MatteType.NONE;  
    jpg.quality = 12;  

    doc.saveAs((new File(fileName)), jpg, true, Extension.LOWERCASE);

}