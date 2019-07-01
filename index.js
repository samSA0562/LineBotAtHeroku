var express = require('express');
var bodyParser = require('body-parser');
var app = express();
var jsonParser = bodyParser.json();
var channelAccessToken = process.env.LINE_CHANNEL_ACCESSTOKEN;
var channelSecret = process.env.LINE_CHANNEL_SECRET;
var credentialsToken = JSON.parse(process.env.GOOGLE_CREDENTIALS_TOKEN);
var googleClientId = process.env.GOOGLE_CLIENT_ID;
var googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
var googleRedirectUrl = process.env.GOOGLE_REDIRECTURL;

var fs = require('fs');
var readline = require('readline');
const {google} = require('googleapis');
const {googleAuth} = require('google-auth-library');
var googleAuthData;

authorize(InitializeGoogleSheet);

function authorize(callback) {
  var oauth2Client  = new google.auth.OAuth2(googleClientId, googleClientSecret, googleRedirectUrl);

  oauth2Client.credentials = credentialsToken;
	googleAuthData = oauth2Client;
      callback(oauth2Client);

}
// Load `*.js` under modules directory as properties
//  i.e., `User.js` will become `exports['User']` or `exports.User`
require('fs').readdirSync(__dirname + '/modules/').forEach(function(file) {
  if (file.match(/\.js$/) !== null && file !== 'index.js') {
    var name = file.replace('.js', '');
    exports[name] = require('./modules/' + file);
  }
});

var rplyOptions = {
	host: 'api.line.me',
	port: 443,
	path: '/v2/bot/message/reply',
	method: 'POST',
	headers: {
	'Content-Type': 'application/json',
	'Authorization':'Bearer ' + channelAccessToken
	}
}
var sendOptions = {
	host: 'api.line.me',
	port: 443,
	path: '/v2/bot/message/push',
	method: 'POST',
	headers: {
	'Content-Type': 'application/json',
	'Authorization':'Bearer ' + channelAccessToken
	}
}
app.use(bodyParser.json());
app.set('port', (process.env.PORT || 5000));
// views is directory for all template files
app.get('/', function(req, res) {
	res.send('Hello');
});
app.post('/', jsonParser, function(req, res) {
	let event = req.body.events[0];
	let type = event.type;
	let msgType = event.message.type;
	let msg = event.message.text;
	let rplyToken = event.replyToken;
	let rplyVal = {};
	//console.log(msg);
	//訊息來到後, 會自動呼叫handleEvent 分類,然後跳到analytics.js進行骰組分析
	//如希望增加修改骰組,只要修改analytics.js的條件式 和ROLL內的骰組檔案即可,然後在HELP.JS 增加說明.
	try {
		handleEvent(event).then((rply) => {
			rplyVal=rply
			if (rplyVal) {
				console.log('=== rplyVal from index ===')
				console.log(rplyVal)
				exports.MsgToLine.replyMsgToLine(rplyToken, rplyVal, rplyOptions); 
			} else {
			//console.log('Do not trigger'); 
			}
			res.send('ok');
		});
	} 
	catch(e) {
		console.log('catch error');
		console.log('Request error: ' + e.message);
	}
	//把回應的內容,掉到MsgToLine.js傳出去
	
});
app.get('/FormReset', function(req, res, next){
	InitializeGoogleSheet(googleAuthData);
	res.send('Start Reset!!');
});
app.get('/SendMsgForm', function(req, res, next){
    res.sendfile('./views/SendMsgForm.html');
});
app.get('/cmdSend', function(req, res, next){
	//console.log(req.query);
	var cmdType = req.query.msgType,
	    cmdUser = req.query.User,
	    cmdText,
	    cmdStickerId, cmdPackageId,
	    cmdOriginalContentURL, cmdPreviewImageURL;
	if (!cmdUser) cmdUser = 'U08c1a7a2d49868a14f459e5a3b3854b8';
	if (!cmdType) cmdType = 'text';
	switch (cmdType) {
	case 'text':
		cmdText = req.query.text;
		exports.MsgToLine.sendMsgToLine(cmdUser, {"type": cmdType,"text": cmdText}, sendOptions);
		break;
	case 'sticker':
		cmdStickerId = req.query.sticker[0]; cmdPackageId = req.query.sticker[1];
		exports.MsgToLine.sendMsgToLine(cmdUser, {"type": cmdType, "stickerId": cmdStickerId, "packageId": cmdPackageId}, sendOptions);
		break;
	case 'image':
		cmdOriginalContentURL = req.query.image[0]; cmdPreviewImageURL = req.query.image[1];
		exports.MsgToLine.sendMsgToLine(cmdUser, {"type": cmdType, "originalContentUrl": cmdOriginalContentURL, "previewImageUrl": cmdPreviewImageURL}, sendOptions);
		break;
	}
	//res.send('ok');
	res.json(req.query);
});
app.post('/cmdSend', bodyParser, function(req, res) {
	//console.log(req);
	var cmdType = req.query.type,
		cmdUser = req.query.userId,
	    cmdMsg = req.query.msg,
	    cmdStickerId = req.query.stickerId,
	    cmdPackageId = req.query.packageId,
	    cmdOriginalContentURL = req.query.originalContentUrl,
	    cmdPreviewImageURL = req.query.previewImageUrl;
	if (!cmdUser) cmdUser = 'U08c1a7a2d49868a14f459e5a3b3854b8';
	if (!cmdType) cmdType = 'text';
	switch (cmdType) {
	case 'text':
		exports.MsgToLine.sendMsgToLine(cmdUser, {"type": cmdType,"text": cmdMsg}, sendOptions);
		break;
	case 'sticker':
		exports.MsgToLine.sendMsgToLine(cmdUser, {"type": cmdType, "stickerId": cmdStickerId, "packageId": cmdPackageId}, sendOptions);
		break;
	case 'image':
		exports.MsgToLine.sendMsgToLine(cmdUser, {"type": cmdType, "originalContentUrl": cmdOriginalContentURL, "previewImageUrl": cmdPreviewImageURL}, sendOptions);
		break;
	}
	res.send('ok');
});
app.use(function(err, req, res, next) {
	res.status(500);
	res.render('error', { error: err });
});
app.listen(app.get('port'), function() {
	console.log('Node app is running on port', app.get('port'));
});
async function handleEvent(event) {
	let sourceId;
	switch (event.source.type) {
	case 'user':
		sourceId = event.source.userId;
		break;
	case 'room':
		sourceId = event.source.roomId;
		break;
	case 'group':
		sourceId = event.source.groupId;
		break;
	}
	switch (event.type) {
	case 'message':
		const message = event.message;
		//console.log(message);
		switch (message.type) {
			case 'text':
				return exports.analytics.parseInputText(sourceId, event.source.userId, event.rplyToken, event.message.text); 
			case 'sticker':
				return exports.analytics.parseInputSticker(sourceId, event.rplyToken, event.message.stickerId, event.message.packageId); 
			default:
				break;
		}
	case 'follow':
		break;
	case 'unfollow':
		break;
	case 'join':
		break;
	case 'leave':
		break;
	case 'postback':
		break;
	case 'beacon':
		break;
	default:
		break;
  }
}

function InitializeGoogleSheet(auth) {
  let strError = "";
  var sheets = google.sheets('v4');
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1p0A157mAYN9VyPrDHIZai-Uvd9nIbik2QVkbS_LimG8',
    range: 'sheet!A1:E',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows = response.data.values;
    if (rows.length == 0) {
      strError = strError + "(sheet) No Data found!! ";
    } else {
      //console.log('Name, Major:');
	  //console.log("sheet data found sucessful!");
	  /*
      for (var i = 0; i < rows.length; i++) {
        var row = rows[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        console.log('%s, %s', row[0], row[1]);
      }
	  */
    }
  });
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1p0A157mAYN9VyPrDHIZai-Uvd9nIbik2QVkbS_LimG8',
    range: 'SDMD_BaKaLang!A1:E',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows2 = response.data.values;
    if (rows2.length == 0) {
	  strError = strError + "(SDMD_BaKaLang) No Data found!! "
    } else {
      //console.log('Name, Major:');
	  //console.log("sheet data found sucessful!");
	  /*
      for (var i = 0; i < rows2.length; i++) {
        var row = rows2[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        console.log('%s, %s', row[0], row[1]);
      }
	  */
	  exports.analytics.InitializeAllSheetsData(rows2, "SDMDSheet_BakaLang", googleAuthData); 
    }
  });
  sheets.spreadsheets.values.get({
    auth: auth,
    spreadsheetId: '1p0A157mAYN9VyPrDHIZai-Uvd9nIbik2QVkbS_LimG8',
    range: 'MsgSourceLog!A2:C',
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var rows3 = response.data.values;
    if (rows3.length == 0) {
      strError = strError + "(MsgSourceLog) No Data found!! "
    } else {
      //console.log('Name, Major:');
	  //console.log("sheet data found sucessful!");
	  /*
      for (var i = 0; i < rows2.length; i++) {
        var row = rows2[i];
        // Print columns A and E, which correspond to indices 0 and 4.
        console.log('%s, %s', row[0], row[1]);
      }
	  */
	  exports.analytics.InitializeAllSheetsData(rows3, "MsgSourceLog", googleAuthData); 
    }
  });
  if (strError)
	console.log(strError);
  else
    console.log("Get All Sheet Data Sucessful!!");
}
