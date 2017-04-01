//配列内にobjがあるかをチェック
function check_array(target_array,obj){
    for (var i in target_array){
        if (target_array[i] == obj){
            return true;
            break;
            }
    }
    return false;
 }

//名前の重複を調べて再割当て
function chack_name(array1,name1){
    if (! check_array(array1,name1)){
        return name1;
     }else{
         //序数
         var tag = 1;
         //同一名が100以上になることは考えない
         while (tag < 100){
            var name2 = name1 + "_" + tag;
            if (! check_array(array1,name2)){
                return name2;
            }
            tag += 1;
        }
    }
}

//PNGで保存
function savePng(doc, file_path){
    var pngFile = new File(file_path);
    var pngSaveOptions = new PNGSaveOptions();
    pngSaveOptions.compression = 9;
    pngSaveOptions.interlaced  = false;
    doc.saveAs(pngFile, pngSaveOptions, true, Extension.LOWERCASE);
}

function convert(doc, path){
	//作業するドキュメントを取得
	var i;
	var docLayerSets= doc.layerSets;
	var layers = doc.layers;
	var groups = {ALL:[], DEFAULT:[]};
	var group;
	var err;
	
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
	
	//全てのレイヤーの表示状態を保存
	var history = doc.activeHistoryState;
	doc.suspendHistory('自動スクリプト','');

	try {
		//log( groups.keys );
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
			//ファイル名の重複チェックのための配列
			var filepath = path.replace(/\*/, groupName);
			log('save to ' + filepath);
			savePng(doc, filepath);
		}
	}catch(ex){
		err = ex;
	}
	//レイヤの表示を元の様態に戻す
	doc.activeHistoryState = history;
	if( err ){
		throw err;
	}
}

function withOpen(path, func){
	var err;
	var oldLen = app.documents.length;
	var doc = app.open(new File(path));
	var needClose = (oldLen != documents.length);
	try {
		func(doc);
	}catch(ex){
		err = ex;
	}
	if( needClose ){
		doc.close(SaveOptions.DONOTSAVECHANGES);
	}
	if( err ){
		throw err;
	}
}

function hoge(){
	withOpen('/Users/makoto/psgen/hoge.psd', function(doc){
		convert(doc, '/Users/makoto/tt/fuga_*.png' );
	});
	return true;
}
