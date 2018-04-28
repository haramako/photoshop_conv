//PNGで保存
function savePng(doc, path){
    var file = new File(path);
    var opt = new PNGSaveOptions();
    opt.compression = 9;
    opt.interlaced  = false;
    doc.saveAs(file, opt, true, Extension.LOWERCASE);
}

function _splitByLayerNamePattern(doc, path){
	var i;
	var docLayerSets= doc.layerSets;
	var layers = doc.layers;
	var groups = {ALL:[], DEFAULT:[]};
	var group;

	// レイヤーをグループごとに分ける
	for( i=0; i<layers.length; i++){
		var layer = layers[i];
		var mo = layer.name.match(/\[(.*)\]/);
		if( mo ){
			var names = mo[1].split(/,/);
			for( var j = 0; j<names.length; j++){
				group = names[j].replace(/\s+/,'');
				groups[group] = groups[group] || [];
				groups[group].push(layer);
			}
		}else{
			groups['DEFAULT'].push(layer);
		}
	}
	
	// グループごとにレイヤーの表示状態を変えつつ保存する
	for( var groupName in groups ){
		if( _.contains(['ALL','DEFAULT','HIDDEN'], groupName) ) continue;
		if( !groups.hasOwnProperty(groupName) ) continue;
		log('group:' + groupName);
		group = groups[groupName];
		_.each(layers, function(layer){
			if( !_.contains(groups['DEFAULT'], layer) ){
				if( _.contains(groups['HIDDEN'], layer) ){
					layer.visible = false;
				}else{
					layer.visible = _.contains(group, layer) || _.contains(groups['ALL'], layer);
				}
			}
		});
		
		var filepath = path.replace(/\*/, groupName);
		log('save to ' + filepath);
		savePng(doc, filepath);
	}
}

function _splitByLayer(doc, path){
	var i;
	var docLayerSets= doc.layerSets;
	var layers = doc.layers;
	var groups = _.map(layers, function(layer){ return layer.name; });

	// グループごとにレイヤーの表示状態を変えつつ保存する
	_.each(groups, function(groupName){
		if( groupName == 'bg' ) return;
		
		_.each(layers, function(layer){
			layer.visible = ( layer.name == groupName );
		});
		
		var filepath = path.replace(/\*/, groupName);
		log('save to ' + filepath);
		savePng(doc, filepath);
	});
}

function withOpen(path, func){
	log('withOpen() ' + path);
	var oldLen = app.documents.length;
	var doc = app.open(new File(path));
	var needClose = (oldLen != documents.length);
	try {
		var history = doc.activeHistoryState;
		doc.suspendHistory('自動スクリプト','');
		func(doc);
		doc.activeHistoryState = history;
	}catch(ex){
		if( needClose ) doc.close(SaveOptions.DONOTSAVECHANGES);
		throw ex;
	}
	if( needClose )	doc.close(SaveOptions.DONOTSAVECHANGES);
}

function splitByLayerNamePattern(){
	withOpen(param.file, function(doc){
		_splitByLayerNamePattern(doc, param.out);
	});
	return true;
}

function splitByLayer(){
	withOpen(param.file, function(doc){
		_splitByLayer(doc, param.out);
	});
	return true;
}
