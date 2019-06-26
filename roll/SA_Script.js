var rply ={type : 'text'}; //type是必需的,但可以更改
var ReplyString,   //跟上回話用全域變數_字串
	ReplyCount=0;
var SDMDSheet_BakaLang = [];
var Sheet_MsgSourceLog = [];
var googleAuthData;

var items=["A賞(0.01％) ", "B賞(0.99％)", "C賞(1.5％)", "D賞(2.5％)", "E賞(3％)" , "F賞(5％)", "G賞(87％)"];
var itemsWeight=[1, 99, 150, 250, 300, 500, 8700];

const {google} = require('googleapis');

function BaKaLanguage(trigger)
{
	rply.type = 'text';
	if (SDMDSheet_BakaLang) {
		let array=[];
		for (i=0;i<SDMDSheet_BakaLang.length;i++){
			for (j=0;j<SDMDSheet_BakaLang[i][1].length;j++){
				if (SDMDSheet_BakaLang[i][1][j].match(trigger) != null){
					array.push(SDMDSheet_BakaLang[i]);
					break;
				}
				
			}
		}
		if (array.length>0){
			rply.text = array[Math.floor((Math.random() * (array.length)) + 0)][0];
		} else {
			rply.text = SDMDSheet_BakaLang[Math.floor((Math.random() * (SDMDSheet_BakaLang.length)) + 0)][0];
		}
		//console.log(rply);
	} else {
		let rplyArr = ['\
	「欣賞一個人, 始於顏值, 敬於才華, 合於性格, 久於善良, 終於人品」節錄自 八嘎語錄', '\
	「對方大了的話, 我會要她夾娃娃. 這就是負責的衣種方式好嗎」節錄自 八嘎語錄', '\
	「你家人知道你是個甲甲嗎? (知道/不知道)」節錄自 八嘎語錄', '\
	「存番號都來不及了, 哪有時間保存那玩意」節錄自 八嘎語錄', '\
	「是男人就勇於承認, 別老把過錯退給別人」節錄自 八嘎語錄', '\
	「我也要開始無課了」節錄自 八嘎語錄', '\
	「我真的不再課了」節錄自 八嘎語錄', '\
	「課金都是智障」節錄自 八嘎語錄', '\
	「小孩子說的話能信, 我煮的泡麵就會變拉麵了」節錄自 八嘎語錄', '\
	「我不看本子, 只看奶…」節錄自 羹莉語錄', '\
	「我只想上台女」節錄自 白黏語錄', '\
	「不討厭就可以舔爆」節錄自 世界樹語錄', '\
	「找丁丁少女」節錄自 教主語錄'];
		rply.text = rplyArr[Math.floor((Math.random() * (rplyArr.length)) + 0)];
		//console.log()
	}
	return rply;
}
function textIsNeedReply(sourceId, trigger)
{
	let index;
	ReplyCount++;
	if (ReplyCount > 10) {
		ReplyCount = 0;
		GoogleSheetUpdate('1p0A157mAYN9VyPrDHIZai-Uvd9nIbik2QVkbS_LimG8', 'MsgSourceLog!A2', {"values":Sheet_MsgSourceLog});
	}
	for(index=0;index<Sheet_MsgSourceLog.length;index++) {
		if(Sheet_MsgSourceLog[index][0] == sourceId) {
			break;
		}
	}
	if (index == Sheet_MsgSourceLog.length) {
		Sheet_MsgSourceLog[index] = [sourceId, trigger, 1];
		return false;
	} else {
		if (trigger != Sheet_MsgSourceLog[index][1])
		{
			//console.log(trigger);
			//console.log(ReplyString);
			Sheet_MsgSourceLog[index][1] = trigger;
			Sheet_MsgSourceLog[index][2] = 1;

		}
		else
		{
			//console.log(ReplyCount);
			Sheet_MsgSourceLog[index][2]++;
			if (Sheet_MsgSourceLog[index][2] >= 3) 
			{
				Sheet_MsgSourceLog[index][2] = 0;
				return true;
			}	
		}
	}
	return false;
}
function XiaoMary(userId, trigger) {
	let count=[0,0,0,0,0,0,0];
	let Results=[];
	let stringTemp;
	let i;
	let j;
	if (trigger.match('連抽')!=null) {
		for (i=1;i<100000;i++) {
			stringTemp = weightedRandom(items, itemsWeight);
			for (j=0;j<items.length;j++)
				if (stringTemp == items[j]) {
					count[j]++;
					break;
				}
			if (stringTemp == items[0]) break;
		}
		//console.log('連抽 i = %s',i);
		return {'type':'text', 'text':'抽了 '+i.toString()+' 次才獲得 '+stringTemp+'.\n['+count[1]+'次 B賞,'+count[2]+'次 C賞,'+count[3]+'次 D賞,'+count[4]+'次 E賞,'+count[5]+'次 F賞,'+count[6]+'次 G賞'+' ]'};
	} else if (trigger.match('單抽')!=null){
		return {'type':'text', 'text': weightedRandom(items, itemsWeight)};
	} else {
		for (i=0;i<10;i++)
			Results.push(weightedRandom(items, itemsWeight));
	}
	console.log('XiaoMary %s', userId);
	return {'type':'text', 'text': Results.toString()};
	function weightedRandom(items, itemsWeight) {
		var totalWeight=eval(itemsWeight.join("+"));
		//console.log(totalWeight);
		var randomArray=[];
		for(var i=0; i<items.length; i++)
		{
			for(var j=0; j<itemsWeight[i]; j++)
			{
				randomArray.push(i);
			}
		}
		var randomNumber=Math.floor(Math.random()*totalWeight);
		return items[randomArray[randomNumber]];
	}
}
function otherParse(trigger) {
	let splitArr=[',','.','_',' '], numberArr=[], stringArr=[], flag=false, tempPos=0, tempWord='', tempRply='';
		rply.type = 'text';

	for (i=0;i<trigger.length;i++) {
		tempWord=trigger.charAt(i);
		for (j=0;j<splitArr.length;j++) {
			if (tempWord == splitArr[j]) {
				stringArr.push(tempWord)
				if(!trigger.substring(tempPos,i)) flag=true; 
				numberArr.push(trigger.substring(tempPos,i))
				tempPos=i+1
			}
		}
	}
	if(numberArr.length<1) return;
	if(!trigger.substring(tempPos,i)) flag=true; 
	numberArr.push(trigger.substring(tempPos,i))
	for (i=0;i<numberArr.length;i++){
		if(isNaN(numberArr[i])) {
			flag=true; 
			break;
		}
	}
	if(!flag) {
		for(i=0;i<numberArr.length;i++) {
			//MathI = paddingLeft("1", numberArr[i].length)
			MathI = 1;
			numberArr[i]=numberArr[i] * 1 + MathI * 1;
			if(i+1==numberArr.length) tempRply+=numberArr[i]
			else tempRply+=numberArr[i]+stringArr[i]
		}
		rply.text = tempRply;
		return rply;
	}
	return;
	/*
	function paddingLeft(str,length){
		if(str.length >= length)
		return str;
		else
		return paddingLeft("1" +str,length);
	}
	*/
}

//回話
function ReplyMsg(trigger) {
	rply.text = trigger;
return rply;
}

function InitializeAllSheetsData(Data, Sheet, auth) {
	googleAuthData = auth;
	switch (Sheet){
	case "SDMDSheet_BakaLang": 
		for (i=0;i<Data.length;i++)
		{
			SDMDSheet_BakaLang[i] = [Data[i][1] + "節錄自 " + Data[i][0], Data[i][2].split(",")];
		}
		//console.log(SDMDSheet_BakaLang);
		break;
	case "MsgSourceLog":
		Sheet_MsgSourceLog = Data;
		//console.log(Data);
		break;
	default:
		console.log("function InitializeAllSheetsData(Data, %s) : " , Sheet);
	}
}
function GoogleSheetGet(spreadsheetId, range) {
	var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: googleAuthData,
    spreadsheetId: spreadsheetId,
    range: range, //'sheet!A2:C'
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.data.values;
    if (rows.length == 0) {
      console.log('No data found.');
	  return ;
    } else {
	  //console.log(rows);
	  return rows;
	}
  });
}

function GoogleSheetUpdate(spreadsheetId, range, resource) {
  var sheets = google.sheets('v4');
  var request = {
      auth: googleAuthData,
      spreadsheetId: spreadsheetId,
      range:encodeURI(range),
      valueInputOption: 'RAW',
      resource: resource
   };
   sheets.spreadsheets.values.update(request, function(err, response) {
      if (err) {
         console.log('The API returned an error: ' + err);
         return;
      }
   });
}

function GoogleSheetInsert(spreadsheetId, range, resource) {
  var sheets = google.sheets('v4');
  var request = {
      auth: googleAuthData,
      spreadsheetId: spreadsheetId,
      range:encodeURI(range), //'Sheet!A2'
      valueInputOption: 'RAW',
      resource: resource
   };
	//console.log(request);
   sheets.spreadsheets.values.append(request, function(err, response) {
      if (err) {
         console.log('The API returned an error: ' + err);
         return;
      }
   });
}

function stickerShruggie()  {
	rply.type = 'image';
	rply.originalContentUrl = rply.previewImageUrl = 'https://i.imgur.com/LU1m6K5.jpg';
	return rply;
}

function SuikaEcho() {
	rply.type = 'image'
	rply.originalContentUrl = rply.previewImageUrl = 'https://i.imgur.com/UGFJTbN.jpg'
	return rply 
}

function flexMessage(mode) {
	switch (mode) {
		case '醬油尻':
			return {"type":"flex","altText":"Fap Fap Fap...","contents":{"type":"carousel","contents":[{"type":"bubble","hero":{"type":"image","size":"full","aspectRatio":"20:13","aspectMode":"cover","url":"https://i.imgur.com/4rmbE.jpg"},"body":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"text","text":"陳年老醬油","wrap":true,"weight":"bold","size":"xl"},{"type":"box","layout":"baseline","contents":[{"type":"text","text":"495","wrap":true,"weight":"bold","size":"xl","flex":0},{"type":"text","text":"才","wrap":true,"weight":"bold","size":"sm","flex":0}]}]},"footer":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"button","style":"primary","action":{"type":"uri","label":"我她媽","uri":"https://i.imgur.com/4rmbE.jpg"}},{"type":"button","action":{"type":"uri","label":"射爆","uri":"https://i.imgur.com/4rmbE.jpg"}}]}},{"type":"bubble","hero":{"type":"image","size":"full","aspectRatio":"20:13","aspectMode":"cover","url":"https://i.imgur.com/8o3jJ.jpg"},"body":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"text","text":"小蘿莉醬油","wrap":true,"weight":"bold","size":"xl"},{"type":"box","layout":"baseline","flex":1,"contents":[{"type":"text","text":"6","wrap":true,"weight":"bold","size":"xl","flex":0},{"type":"text","text":"才","wrap":true,"weight":"bold","size":"sm","flex":0}]},{"type":"text","text":"晶礦不足","wrap":true,"size":"xxs","margin":"md","color":"#ff5551","flex":0}]},"footer":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"button","flex":2,"style":"primary","color":"#aaaaaa","action":{"type":"uri","label":"惡作劇","uri":"https://i.imgur.com/8o3jJ.jpg"}},{"type":"button","action":{"type":"uri","label":"尻尻","uri":"https://i.imgur.com/8o3jJ.jpg"}}]}},{"type":"bubble","body":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"button","flex":1,"gravity":"center","action":{"type":"uri","label":"幫我撐十秒","uri":"https://i.imgur.com"}}]}}]}}
			break
		case '彈性尻':
			return {"type":"flex","altText":"Fap Fap Fap...","contents":{"type":"bubble","styles":{"footer":{"separator":true}},"body":{"type":"box","layout":"vertical","contents":[{"type":"text","text":"當前狀態","weight":"bold","color":"#1DB446","size":"sm"},{"type":"text","text":"機台名稱","weight":"bold","size":"xxl","margin":"md"},{"type":"text","text":"機台位置","size":"xs","color":"#aaaaaa","wrap":true},{"type":"separator","margin":"xxl"},{"type":"box","layout":"vertical","margin":"xxl","spacing":"sm","contents":[{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"執行時間","size":"sm","color":"#555555","flex":0},{"type":"text","text":"90分鐘","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"待機時間","size":"sm","color":"#555555","flex":0},{"type":"text","text":"20分鐘","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"停機時間","size":"sm","color":"#555555","flex":0},{"type":"text","text":"3分鐘","size":"sm","color":"#111111","align":"end"}]},{"type":"separator","margin":"xxl"},{"type":"box","layout":"horizontal","margin":"xxl","contents":[{"type":"text","text":"完工次數","size":"sm","color":"#555555"},{"type":"text","text":"3","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"稼動率","size":"sm","color":"#555555"},{"type":"text","text":"13%","size":"sm","color":"#111111","align":"end"}]}]},{"type":"separator","margin":"xxl"},{"type":"box","layout":"horizontal","margin":"md","contents":[{"type":"text","text":"索取時間","size":"xs","color":"#aaaaaa","flex":0},{"type":"text","text":"YYYY/MM/DD HH:mm:ss","color":"#aaaaaa","size":"xs","align":"end"}]}]}}}
			break
	}
	return 
}
module.exports = {
	BaKaLanguage,
	textIsNeedReply,
	ReplyMsg,
	InitializeAllSheetsData,
	stickerShruggie,
	SuikaEcho,
	XiaoMary,
	otherParse,
	flexMessage,
};
