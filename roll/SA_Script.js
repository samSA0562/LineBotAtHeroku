const {google} = require('googleapis')
const request = require('request')  
const tokenCWB = process.env.CWB_ACCESSTOKEN

var rply ={type : 'text'} //type是必需的,但可以更改
var ReplyString   //跟上回話用全域變數_字串
var ReplyCount=0
var SDMDSheet_BakaLang = []
var Sheet_MsgSourceLog = []
var googleAuthData;

var items=["A賞(0.01％) ", "B賞(0.99％)", "C賞(1.5％)", "D賞(2.5％)", "E賞(3％)" , "F賞(5％)", "G賞(87％)"];
var itemsWeight=[1, 99, 150, 250, 300, 500, 8700];

function analytics(trigger, inputStr) {
	if (trigger.match(/蘇卡|醋咔|酥卡/) != null && trigger.match(/聲音|身音/) != null) {
		return imageMessage('suika')
	} else if (trigger.match(/尻/) != null) {
		return flexMessage(trigger)
	} else if (trigger.match(/組成|成分|成份|生成/) != null) {
		return createPerson()
	} else if ( mode.match(/天氣/) != null ) {
			return weatherMessage(mode)
	} else {
		return otherParse(inputStr)
	}
}

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
	} else if (trigger.match('列表')!=null){
		for (i=1;i<100000;i++) {
			stringTemp = weightedRandom(items, itemsWeight);
			for (j=0;j<items.length;j++)
				if (stringTemp == items[j]) {
					count[j]++;
					break;
				}
			if (stringTemp == items[0]) break;
		}
		return {"type":"flex","altText":"Fap Fap Fap...","contents":{"type":"bubble","styles":{"footer":{"separator":true}},"body":{"type":"box","layout":"vertical","contents":[{"type":"text","text":"小瑪莉結果","weight":"bold","color":"#1DB446","size":"sm"},{"type":"text","text":"中獎啦","weight":"bold","size":"xxl","margin":"md"},{"type":"separator","margin":"xxl"},{"type":"box","layout":"vertical","margin":"xxl","spacing":"sm","contents":[{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"A賞(0.01%)","size":"sm","color":"#555555","flex":0},{"type":"text","text":"1","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"B賞(0.99％)","size":"sm","color":"#555555","flex":0},{"type":"text","text":count[1].toString(),"size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"C賞(1.5％)","size":"sm","color":"#555555","flex":0},{"type":"text","text":count[2].toString(),"size":"sm","color":"#111111","align":"end"}]},		{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"D賞(2.5％)","size":"sm","color":"#555555","flex":0},	{"type":"text","text":count[3].toString(),"size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"E賞(3％)","size":"sm","color":"#555555","flex":0},{"type":"text","text":count[4].toString(),"size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"F賞(5％)","size":"sm","color":"#555555","flex":0},{"type":"text","text":count[5].toString(),"size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"G賞(87％)","size":"sm","color":"#555555","flex":0},{"type":"text","text":count[6].toString(),"size":"sm","color":"#111111","align":"end"}]},{"type":"separator","margin":"xxl"},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"總計","size":"sm","color":"#555555"},{"type":"text","text":i.toString(),"size":"sm","color":"#111111","align":"end"}]}]},{"type":"separator","margin":"xxl"},{"type":"box","layout":"horizontal","margin":"md","contents":[{"type":"text","text":"賭命人品單據","size":"xs","color":"#aaaaaa","flex":0},{"type":"text","text":"#12340562213310925100","color":"#aaaaaa","size":"xs","align":"end"}]}]}}}
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

function imageMessage(mode) {
	rply.type = 'image'
	let rplyImage =''
	switch(mode) {
		case 'suika':	//我婆
			rplyImage = 'https://i.imgur.com/UGFJTbN.jpg'
			break
		case 'SSYT':	//雙手一攤
			rplyImage = 'https://i.imgur.com/LU1m6K5.jpg'
			break
	}
	rply.originalContentUrl = rply.previewImageUrl = rplyImage
	return rply
}

function createPerson(mode) {
//"type":"flex","altText":"Fap Fap Fap...","contents":{}	
	let rply = {type:'flex',altText:'Fap Fap Fap...'}
	let numMin = 1
	let numMax = 10
	let numRandomIndex = 0
	let numTarget = numMin + Math.floor(Math.random()*(numMax-numMin))

	let arrElementTag = [
	]
//個性
	let arrPersonality = [
		'自大', '怯懦', '貪婪', '邊緣', '弱智', '幹話', '不貞', '不忠', '清掃', '邪術', '無禮', '大聲', '黑洞', '多疑', '放空', '怠惰', 
		'歡笑', '大愛', '沒品', '浪漫', '信仰', '黑人', '膽小', '歡愉', '空虛', '信教', '路癡', '放空', '炫富', '蠢蛋', '睡眠', '空洞',
		'中二', '音樂', '笨蛋', '閒晃', '厭惡', '粗暴', '拉屎', '自戀', '邋塌', '留守', '竹鼠', '記者', '妓者', 
		'大頭症', '不可靠', '反社會', '強迫症', '妄想症', '神秘感', '鄉巴佬', '老馬王', '同性戀', 
		'不知所措', '無理取鬧', '搖擺不定', '說謊成性', '歇斯底里', '精神分裂', '五臟六腑', '令人反胃', '為了國王', '無法捉摸', 
		'容易中暑', '時常手滑', '幹話一哥', 
		'天生的蠢材', 
		'無法擔當要職', 
	]
//社交
	let arrWork = [
		'現充', '社畜', '吃土', '加班', '課金', '通勤', '單身', 
		'被二一', '重補修', '沒事做', '邊緣人'
	]
//物質
	let arrMaterial = [
		'濁液', '鼻涕', '肥油', '珍珠', '黴菌', '塑膠', '口水', '膝蓋', '檸檬', '農藥', '謎團', '果凍', '草包', '洗澡', '熱狗', '胖子', 
		'汙垢', '汗水', '淚水', '大麻', '奈米', '毒品', '蒸蚌', '爐渣', '怪獸', '兔肉', '煉乳', '空氣', 
		'重金屬', '銅臭味', '組織液', '空荷包', '中年禿', '鮪魚肚', '土豆粉', '矮冬瓜', '棉花糖', 
		'魑魅魍魎', '意大利麵', '雪明炭鐵', '黃色小鴨', 
	]
//Meme
	let arrMeme = [
		'貓咪', '彩虹', '人品', '晶礦', '貓派', '犬派', '奴性', '星爆', '珍奶', '假的', 
		'發大財', '八萬一', '空心菜', '大葛格', 
		'五倍鑽石', '兔子便便', '珍珠奶茶', '五顏六色', '諾羅病毒', '山豬騎士', '用愛發電', 
		'永遠的十八歲', 
	]
//奶子
	let arrAdult = [
		'尻尻', '髒髒', '老婆', '妹子', '公車', '胸部', '裸體', '奶子', '胖次', '內褲', '歐派', '足控', '貧乳', 
		'大歐派', '老司機', '粉紅色', '肉變器', '絲襪控', '奶子控', '貧乳控', 
		'為了奶子', '為了胸部', 'ㄋㄟㄋㄟ', 
	]
	if (!mode || mode.match(/個性|性格/) != null) arrElementTag = arrElementTag.concat(arrPersonality)
	if (!mode || mode.match(/社交|社畜|工作/) != null) arrElementTag = arrElementTag.concat(arrWork)
	if (!mode || mode.match(/原料|材料/) != null) arrElementTag = arrElementTag.concat(arrMaterial)
	if (!mode || mode.match(/迷因|爆紅/) != null) arrElementTag = arrElementTag.concat(arrMeme)
	if (!mode || mode.match(/奶子|ㄋㄟ|歐派|18|成人/) != null) arrElementTag = arrElementTag.concat(arrAdult)
	if (!arrElementTag[0]) return createPerson()

	let arrRplyElementSource = []
	let arrRplyElementContents = []
	
	for (i=0;i<numTarget;i++) {
		numRandomIndex = Math.floor(Math.random()*arrElementTag.length)
		arrRplyElementSource.push({text:arrElementTag[numRandomIndex]})
		arrElementTag.splice(numRandomIndex,1)
	}
	let numTotal = 100 - numTarget
	let numValue = 0
	arrRplyElementSource.forEach((value,index)=>{
		if (index != arrRplyElementSource.length - 1) {
			numValue = Math.floor(Math.random()*numTotal)
			value.value = numValue + 1
			numTotal -= numValue
		} else {
			value.value = numTotal + 1
		}
	})
	arrRplyElementSource = quickSort(arrRplyElementSource)
	let arrColorType = ['#FF0000','#F0E68C','#1E90FF','#32CD32','#555555', '#999999', '#aaaaaa']
	let arrSizeType = ['xl', 'lg', 'md', 'sm', 'xs',]
	let strColorType = ''
	let strSizeType = ''
	arrRplyElementSource.forEach((value) => {
		if (value.value > 80) {
				strColorType = arrColorType[0]
				strSizeType = arrSizeType[0]
		} else if (value.value > 60) {
				strColorType = arrColorType[1]
				strSizeType = arrSizeType[1]
		} else if (value.value > 40) {
				strColorType = arrColorType[2]
				strSizeType = arrSizeType[2]
		} else if (value.value > 15) {
				strColorType = arrColorType[3]
				strSizeType = arrSizeType[3]
		} else if (value.value > 7) {
			strColorType = arrColorType[4]
			strSizeType = arrSizeType[4]
		}  else if (value.value > 3) {
			strColorType = arrColorType[5]
			strSizeType = arrSizeType[4]
		} else {
			strColorType = arrColorType[6]
			strSizeType = arrSizeType[4]
		}
		arrRplyElementContents.push({
				type:"box",layout:"horizontal",contents:[
						{
								type:"text","text":value.text,size:strSizeType,color:strColorType,flex:0
						},
						{
								type:"text","text":value.value.toString(),size:strSizeType,color:"#111111",align:"end"
						}
				]
		})
	})

  rply.contents = {"type":"bubble","styles":{"footer":{"separator":true}},"body":{"type":"box","layout":"vertical","contents":[
    {"type":"text","text":"一生組成成分","weight":"bold","size":"xxl","margin":"md","align":"center"},
    {"type":"separator","margin":"md"},
    {"type":"box","layout":"vertical","margin":"md","spacing":"sm","contents":arrRplyElementContents},
    {"type":"separator","margin":"md"},
    {"type":"box","layout":"horizontal","margin":"md","contents":[
    {"type":"text","text":"單號","size":"xs","color":"#aaaaaa","flex":0},
    {"type":"text","text":`#2133${Math.floor(Math.random()*1000)}1092${Math.floor(Math.random()*1000)}5100`,"color":"#aaaaaa","size":"xs","align":"end"}]}
    ]}}

	return rply

	function quickSort(arrMain){
			return quickSortInside(arrMain, 0, arrMain.length - 1)
	
			function swap(arrSwap, idxLeft , idxRight) {
					[arrSwap[idxLeft], arrSwap[idxRight]] = [arrSwap[idxRight], arrSwap[idxLeft]]
			}
			function partition(arrPart, numStart, numEnd) {
					let idxSplit = numStart + 1;
					for (let i = numStart + 1; i <= numEnd; i++) {
							if (arrPart[i].value > arrPart[numStart].value) {
									swap(arrPart, i, idxSplit)
									idxSplit++
							}
					}
	
					swap(arrPart, numStart, idxSplit - 1)
					return idxSplit - 1
			}
			function quickSortInside(arrInside, numStart, numEnd) {
					if (numStart >= numEnd) return arrInside
	
					const middle = partition(arrInside, numStart, numEnd)
					quickSortInside(arrInside, numStart, middle - 1)
					quickSortInside(arrInside, middle + 1, numEnd)
					return arrInside
			}
	}
}

function flexMessage(mode) {
	rply = {type:"flex"}
	if ( mode.match(/醬油/) != null ) {
		rply.altText = '醬油 : Fap Fap Fap... '
		rply.contents = {"type":"carousel","contents":[{"type":"bubble","hero":{"type":"image","size":"full","aspectRatio":"20:13","aspectMode":"cover","url":"https://i.imgur.com/4rmbE.jpg"},"body":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"text","text":"陳年老醬油","wrap":true,"weight":"bold","size":"xl"},{"type":"box","layout":"baseline","contents":[{"type":"text","text":"495","wrap":true,"weight":"bold","size":"xl","flex":0},{"type":"text","text":"才","wrap":true,"weight":"bold","size":"sm","flex":0}]}]},"footer":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"button","style":"primary","action":{"type":"uri","label":"我她媽","uri":"https://i.imgur.com/4rmbE.jpg"}},{"type":"button","action":{"type":"uri","label":"射爆","uri":"https://i.imgur.com/4rmbE.jpg"}}]}},{"type":"bubble","hero":{"type":"image","size":"full","aspectRatio":"20:13","aspectMode":"cover","url":"https://i.imgur.com/8o3jJ.jpg"},"body":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"text","text":"小蘿莉醬油","wrap":true,"weight":"bold","size":"xl"},{"type":"box","layout":"baseline","flex":1,"contents":[{"type":"text","text":"6","wrap":true,"weight":"bold","size":"xl","flex":0},{"type":"text","text":"才","wrap":true,"weight":"bold","size":"sm","flex":0}]},{"type":"text","text":"晶礦不足","wrap":true,"size":"xxs","margin":"md","color":"#ff5551","flex":0}]},"footer":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"button","flex":2,"style":"primary","color":"#aaaaaa","action":{"type":"uri","label":"惡作劇","uri":"https://i.imgur.com/8o3jJ.jpg"}},{"type":"button","action":{"type":"uri","label":"尻尻","uri":"https://i.imgur.com/8o3jJ.jpg"}}]}},{"type":"bubble","body":{"type":"box","layout":"vertical","spacing":"sm","contents":[{"type":"button","flex":1,"gravity":"center","action":{"type":"uri","label":"幫我撐十秒","uri":"https://i.imgur.com"}}]}}]}
	} else if ( mode.match(/彈性/) != null ) {
		rply.altText = 'Fap Fap Fap...'
		rply.contents = {"type":"bubble","styles":{"footer":{"separator":true}},"body":{"type":"box","layout":"vertical","contents":[{"type":"text","text":"當前狀態","weight":"bold","color":"#1DB446","size":"sm"},{"type":"text","text":"機台名稱","weight":"bold","size":"xxl","margin":"md"},{"type":"text","text":"機台位置","size":"xs","color":"#aaaaaa","wrap":true},{"type":"separator","margin":"xxl"},{"type":"box","layout":"vertical","margin":"xxl","spacing":"sm","contents":[{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"執行時間","size":"sm","color":"#555555","flex":0},{"type":"text","text":"90分鐘","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"待機時間","size":"sm","color":"#555555","flex":0},{"type":"text","text":"20分鐘","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"停機時間","size":"sm","color":"#555555","flex":0},{"type":"text","text":"3分鐘","size":"sm","color":"#111111","align":"end"}]},{"type":"separator","margin":"xxl"},{"type":"box","layout":"horizontal","margin":"xxl","contents":[{"type":"text","text":"完工次數","size":"sm","color":"#555555"},{"type":"text","text":"3","size":"sm","color":"#111111","align":"end"}]},{"type":"box","layout":"horizontal","contents":[{"type":"text","text":"稼動率","size":"sm","color":"#555555"},{"type":"text","text":"13%","size":"sm","color":"#111111","align":"end"}]}]},{"type":"separator","margin":"xxl"},{"type":"box","layout":"horizontal","margin":"md","contents":[{"type":"text","text":"索取時間","size":"xs","color":"#aaaaaa","flex":0},{"type":"text","text":"YYYY/MM/DD HH:mm:ss","color":"#aaaaaa","size":"xs","align":"end"}]}]}}
	} 
	return rply
}

function weatherMessage(trigger) {
	rply = {type: "flex", altText: "我最愛看著天氣 Fap Fap Fap...", contents: "carousel"}
	let arrLocationNameTW = [
		'%E5%AE%9C%E8%98%AD%E7%B8%A3', //宜蘭縣
		'%E8%8A%B1%E8%93%AE%E7%B8%A3', //花蓮縣
		'%E8%87%BA%E6%9D%B1%E7%B8%A3', //臺東縣
		'%E6%BE%8E%E6%B9%96%E7%B8%A3', //澎湖縣
		'%E9%87%91%E9%96%80%E7%B8%A3', //金門縣
		'%E9%80%A3%E6%B1%9F%E7%B8%A3', //連江縣
		'%E8%87%BA%E5%8C%97%E5%B8%82', //臺北市
		'%E6%96%B0%E5%8C%97%E5%B8%82', //新北市
		'%E6%A1%83%E5%9C%92%E5%B8%82', //桃園市
		'%E8%87%BA%E4%B8%AD%E5%B8%82', //臺中市
		'%E8%87%BA%E5%8D%97%E5%B8%82', //臺南市
		'%E9%AB%98%E9%9B%84%E5%B8%82', //高雄市
		'%E5%9F%BA%E9%9A%86%E5%B8%82', //基隆市
		'%E6%96%B0%E7%AB%B9%E7%B8%A3', //新竹縣
		'%E6%96%B0%E7%AB%B9%E5%B8%82', //新竹市
		'%E8%8B%97%E6%A0%97%E7%B8%A3', //苗栗縣
		'%E5%8D%97%E6%8A%95%E7%B8%A3', //南投縣
		'%E9%9B%B2%E6%9E%97%E7%B8%A3', //雲林縣
		'%E5%98%89%E7%BE%A9%E7%B8%A3', //嘉義縣
		'%E5%98%89%E7%BE%A9%E5%B8%82', //嘉義市
		'%E5%B1%8F%E6%9D%B1%E7%B8%A3', //屏東縣
	]
	let strLocationName = ''
	if ( trigger.match(/宜蘭/) != null  ) strLocationName = arrLocationNameTW[0]
	else if ( trigger.match(/花蓮/) != null  ) strLocationName = arrLocationNameTW[1]
	else if ( trigger.match(/臺東|台東/) != null  ) strLocationName = arrLocationNameTW[2]
	else if ( trigger.match(/澎湖/) != null  ) strLocationName = arrLocationNameTW[3]
	else if ( trigger.match(/金門/) != null  ) strLocationName = arrLocationNameTW[4]
	else if ( trigger.match(/連江/) != null  ) strLocationName = arrLocationNameTW[5]
	else if ( trigger.match(/新北|台北縣/) != null  ) strLocationName = arrLocationNameTW[7]	
	else if ( trigger.match(/臺北|台北/) != null  ) strLocationName = arrLocationNameTW[6]
	else if ( trigger.match(/桃園/) != null  ) strLocationName = arrLocationNameTW[8]
	else if ( trigger.match(/臺中|台中/) != null  ) strLocationName = arrLocationNameTW[9]
	else if ( trigger.match(/臺南|台南/) != null  ) strLocationName = arrLocationNameTW[10]
	else if ( trigger.match(/高雄/) != null  ) strLocationName = arrLocationNameTW[11]
	else if ( trigger.match(/基隆/) != null  ) strLocationName = arrLocationNameTW[12]
	else if ( trigger.match(/新竹市/) != null  ) strLocationName = arrLocationNameTW[14]
	else if ( trigger.match(/新竹縣|新竹/) != null  ) strLocationName = arrLocationNameTW[13]
	else if ( trigger.match(/苗栗/) != null  ) strLocationName = arrLocationNameTW[15]
	else if ( trigger.match(/南投/) != null  ) strLocationName = arrLocationNameTW[16]
	else if ( trigger.match(/雲林/) != null  ) strLocationName = arrLocationNameTW[17]
	else if ( trigger.match(/嘉義市/) != null  ) strLocationName = arrLocationNameTW[19]	
	else if ( trigger.match(/嘉義縣|嘉義/) != null  ) strLocationName = arrLocationNameTW[18]
	else if ( trigger.match(/屏東/) != null  ) strLocationName = arrLocationNameTW[20]
	else strLocationName = arrLocationNameTW[Math.floor(Math.random()*arrLocationNameTW.length)]
	request({
		uri: `https://opendata.cwb.gov.tw/api/v1/rest/datastore/F-C0032-001?Authorization=${tokenCWB}&limit=1&offset=0&format=JSON&locationName=${strLocationName}`,
		method: "GET",
		timeout: 10000,
		followRedirect: true,
		maxRedirects: 3
	}, function(error, response, body) {
		body = JSON.parse(body)
		let weatherElement = body.records.location[0].weatherElement
		let arrTime = [`${weatherElement[0].time[0].startTime}-${weatherElement[0].time[0].endTime}`,`${weatherElement[0].time[1].startTime}-${weatherElement[0].time[1].endTime}`,`${weatherElement[0].time[2].startTime}-${weatherElement[0].time[2].endTime}`,]
		let arrMaxT = []
		let arrMinT = []
		let arrWx = []
		let arrCI = []
		let arrPoP = []
		let arrRplyContents = [{},{},{}]
		weatherElement.forEach((value)=>{
				switch (value.elementName) {    
						case 'MaxT': // 最高溫度
								for(i=0;i<value.time.length;i++) arrMaxT.push(value.time[i].parameter)
								break
						case 'MinT': // 最低溫度
								for(i=0;i<value.time.length;i++) arrMinT.push(value.time[i].parameter)
								break
						case 'Wx': // 天氣現象
								for(i=0;i<value.time.length;i++) arrWx.push(value.time[i].parameter)
								break
						case 'CI': // 舒適度
								for(i=0;i<value.time.length;i++) arrCI.push(value.time[i].parameter)
								break
						case 'PoP': // 降雨機率
								for(i=0;i<value.time.length;i++) arrPoP.push(value.time[i].parameter)
								break
				}
		})
		arrRplyContents.forEach((value,index)=>{
				let tempTime = []
				arrTime[index].split('-').forEach((value)=>{
						tempTime=tempTime.concat(value.split(' '))
				})
				value.type = "bubble"
				value.body = {type: "box",layout: "vertical",spacing: "sm",contents: [
						{type:"text",text:`民國 ${Number(tempTime[0])-1911} 年 ${tempTime[1]} 月 ${tempTime[2]} 日`,weight:"bold",align:"center",size:"xl"},
						{type:"text",text:`${tempTime[tempTime.length/2-1]} 至 ${tempTime[tempTime.length-1]}`,weight:"bold",align:"center",size:'md'},
						{type: "separator",margin: "md"},
						{type: "box",layout: "horizontal",contents: [
								{type: "text",text: "溫度",size: 'md',color: "#555555",flex: 0},
								{type: "text",text: `${arrMinT[index].parameterName}°${arrMaxT[index].parameterUnit} ~ ${arrMaxT[index].parameterName}°${arrMaxT[index].parameterUnit}`,size: 'md',color: "#555555",align: "end"} ] },
						{type: "box",layout: "horizontal",contents: [
								{type: "text",text: "降雨率",size: 'md',color: "#555555",flex: 0},
								{type: "text",text: `${arrPoP[index].parameterName} ${arrPoP[index].parameterUnit=='百分比'&&'%'}`,size: 'md',color: "#555555",align: "end"} ] },
						{type: "box",layout: "horizontal",contents: [
								{type: "text",text: "舒適度",size: 'md',color: "#555555",flex: 0},
								{type: "text",text: `${arrCI[index].parameterName}`,size: 'md',color: "#555555",align: "end"} ] },
						{type: "box",layout: "horizontal",contents: [
								{type: "text",text: "天氣現象",size: arrWx[index].parameterName.length > 8?'xs':'md',color: "#555555",flex: 0},
								{type: "text",text: `${arrWx[index].parameterName}`,size: arrWx[index].parameterName.length > 8?'xs':'md',color: "#555555",align: "end"} ] },

				] }
				value.footer = {type:"box",layout:"vertical",spacing:"sm",contents: [
						{type: "separator",margin: "md"},
						{type: "box",layout: "horizontal",margin: "md",contents: [
								{type: "text",text: "位置",size: "xs",color: "#aaaaaa",flex: 0},
								{type: "text",text: `中華民國臺灣省${body.records.location[0].locationName}`,color: "#aaaaaa",size: "xs",align: "end"} ] }
						]
				}
		})
		rply.contents.contents = arrRplyContents
		return rply
	});
}

module.exports = {
	analytics,
	BaKaLanguage,
	textIsNeedReply,
	ReplyMsg,
	InitializeAllSheetsData,
	stickerShruggie,
	SuikaEcho,
	XiaoMary,
	otherParse,
	flexMessage,
	imageMessage,
	weatherMessage,
};
