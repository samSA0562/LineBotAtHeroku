// Load `*.js` under roll directory as properties
//  i.e., `User.js` will become `exports['User']` or `exports.User`
require('fs').readdirSync('./roll/').forEach(function(file) {
	if (file.match(/\.js$/) !== null && file !== 'index.js') {
	  var name = file.replace('.js', '');
	  exports[name] = require('../roll/' + file);
	}
  });

var ReplyCount = 0; //跟上回話用全域變數_整數
var ReplyString;    //跟上回話用全域變數_字串
//用來呼叫骰組,新增骰組的話,要寫條件式到下面呼叫 
//格式是 exports.骰組檔案名字.function名
function parseInputText(sourceId, userId, rplyToken, inputStr) {
	//console.log('InputStr: ' + inputStr);
	_isNaN = function(obj) 	{
	return isNaN(parseInt(obj));  
	}
	
	let msgSplitor = (/\S+/ig);	
	let mainMsg = inputStr.match(msgSplitor); //定義輸入字串
	let trigger = mainMsg[0].toString().toLowerCase(); //指定啟動詞在第一個詞&把大階強制轉成細階

	//在下面位置開始分析trigger

	//普通ROLL擲骰判定在此	
	if (inputStr.match(/\w/)!=null && inputStr.toLowerCase().match(/\d+d+\d/)!=null) return exports.rollbase.nomalDiceRoller(inputStr,mainMsg[0],mainMsg[1],mainMsg[2]);

	//xBy>A 指令開始於此
	if (trigger.match(/^(\d+)(b)(\d+)$/i)!= null) return exports.advroll.xBy(trigger,mainMsg[1],mainMsg[2]);
	//xUy 指令開始於此	
	if (trigger.match(/^(\d+)(u)(\d+)$/i)!= null && isNaN(mainMsg[1])== false) return exports.advroll.xUy(trigger,mainMsg[1],mainMsg[2],mainMsg[3]);
	
	if (trigger.match(/^ccb$|^cc$|^ccn[1-2]$|^cc[1-2]$/)!= null && mainMsg[1]<=1000 )
	{		
	//ccb指令開始於此
	if (trigger == 'ccb'&& mainMsg[1]<=99) return exports.coc.coc6(mainMsg[1],mainMsg[2]);
	
	//cc指令開始於此
	if (trigger == 'cc'&& mainMsg[1]<=1000) return exports.coc.coc7(mainMsg[1],mainMsg[2]);
	//獎懲骰設定於此	
	if (trigger == 'cc1'&& mainMsg[1]<=1000) return exports.coc.coc7bp(mainMsg[1],'1',mainMsg[2]); 
	if (trigger == 'cc2'&& mainMsg[1]<=1000) return exports.coc.coc7bp(mainMsg[1],'2',mainMsg[2]);	
	if (trigger == 'ccn1'&& mainMsg[1]<=1000) return exports.coc.coc7bp(mainMsg[1],'-1',mainMsg[2]);	
	if (trigger == 'ccn2'&& mainMsg[1]<=1000) return exports.coc.coc7bp(mainMsg[1],'-2',mainMsg[2]);	
	}
			
	if (trigger.match(/(^cc7版創角$|^cc七版創角$)/) != null && mainMsg[1] != NaN )	return exports.coc.build7char(mainMsg[1]);
	
	if (trigger.match(/(^cc6版創角$|^cc六版創角$)/) != null && mainMsg[1] != NaN )	return exports.coc.build6char(mainMsg[1]);
	
	if (trigger.match(/^coc7角色背景$/)!= null ) return exports.coc.PcBG();
  
	if (trigger.match(/^bothelp$|^bot幫助$/)!= null ) return exports.help.Help();
	
	
	//nc指令開始於此 來自Rainsting/TarotLineBot 
	if (trigger.match(/^[1-4]n[c|a][+|-][1-99]$|^[1-4]n[c|a]$/)!= null ) return exports.nc.nechronica(trigger,mainMsg[1]);

	//依戀
	if (trigger.match(/(^nm$)/) != null)	return exports.nc.nechronica_mirenn(mainMsg[1]);

	
	//wod 指令開始於此
	if (trigger.match(/^(\d+)(wd|wod)(\d|)((\+|-)(\d+)|)$/i)!= null)return exports.wod.wod(trigger,mainMsg[1]);

	//Dx3 指令開始於此
	if (trigger.match(/^(\d+)(dx)(\d|)(((\+|-)(\d+)|)((\+|-)(\d+)|))$/i)!= null)return exports.dx3.dx(trigger);

	//Fisher–Yates shuffle
 	//SortIt 指令開始於此
 	if (trigger.match(/排序/)!= null && mainMsg.length >= 3) return exports.funny.SortIt(inputStr,mainMsg);
 	if (trigger.match(/^d66$/)!= null ) return exports.advroll.d66(mainMsg[1]);
	if (trigger.match(/^d66s$/)!= null ) return exports.advroll.d66s(mainMsg[1]);

	
	//choice 指令開始於此
	if (trigger.match(/choice|隨機|選項|選1/)!= null && mainMsg.length >= 3) return exports.funny.choice(inputStr,mainMsg);
	
	//tarot 指令
	if (trigger.match(/tarot|塔羅牌|塔羅/) != null) {
		if (trigger.match(/^單張|^每日|^daily/)!= null) return exports.funny.NomalDrawTarot(mainMsg[1], mainMsg[2]);//預設抽 79 張
		if (trigger.match(/^時間|^time/)!= null) 	return exports.funny.MultiDrawTarot(mainMsg[1], mainMsg[2], 1);
		if (trigger.match(/^大十字|^cross/)!= null) return exports.funny.MultiDrawTarot(mainMsg[1], mainMsg[2], 2);
	}
	
	//FLAG指令開始於此
	if (trigger.match(/立flag|死亡flag/) != null) return exports.funny.BStyleFlagSCRIPTS() ;	
	
	//鴨霸獸指令開始於此
	if (trigger.match(/鴨霸獸|巴獸/) != null) return exports.funny.randomReply() ;	
	if (trigger.match(/運氣|運勢/) != null) return exports.funny.randomLuck(mainMsg) ; //占卜運氣		
	if (trigger.match(/幹話|江西話|榦話/) != null) return exports.SA_Script.BaKaLanguage(trigger);
	if (trigger.match(/小瑪莉/) != null) return exports.SA_Script.XiaoMary(userId, trigger);
	if (exports.SA_Script.textIsNeedReply(sourceId, trigger)) 
	{
		if (Math.floor(Math.random()*100) <= 87) //87%機率重覆回話)
			return exports.SA_Script.ReplyMsg(trigger); //重覆回話
		else
			return exports.funny.BStyleFlagSCRIPTS(); 
	}
	return exports.SA_Script.otherParse(inputStr);
	/*tarot 指令
	if (trigger.match(/猜拳/) != null) {
		return RockPaperScissors(inputStr, mainMsg[1]);
	}
*/

  
}

function parseInputSticker(sourceId, rplyToken, stickerId, packageId) {
	if (Math.floor(Math.random()*100) <= 30) //30%機率貼圖)
		if (stickerId == 3352108 && packageId == 1081469) return exports.SA_Script.stickerShruggie();
}
function InitializeAllSheetsData(Data, Sheet, auth) {
	//console.log("analytics pass sheet");
	exports.SA_Script.InitializeAllSheetsData(Data, Sheet, auth);
}

module.exports = {
	parseInputText,
	parseInputSticker,
	InitializeAllSheetsData
};

