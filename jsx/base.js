var env = $ENV;
var param = $PARAM;
$.evalFile(env.jsxPath+"/underscore.min.js");
$.evalFile(env.jsxPath+"/json2.min.js");
var __result = {log:[]};
function log(str){
	if( typeof str === 'object' || typeof str === 'array' ){
		str = JSON.stringify(str);
	}
	__result.log.push(''+str);
}
try{
  function __f(){
	  $CODE
  };
	__result.result = __f();
}catch(ex){
	__result.err = ex.toString();
};
"RESULT:"+JSON.stringify(__result);
