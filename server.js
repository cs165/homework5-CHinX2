const express = require('express');
const bodyParser = require('body-parser');
const googleSheets = require('gsa-sheets');

const key = require('./privateSettings.json');

// TODO(you): Change the value of this string to the spreadsheet id for your
// GSA spreadsheet. See HW5 spec for more information.
const SPREADSHEET_ID = '1Mmi6o9yzli5CnpOLR20ZsuVeT6askJUc7gjg7V6tVbY';

const app = express();
const jsonParser = bodyParser.json();
const sheet = googleSheets(key.client_email, key.private_key, SPREADSHEET_ID);

app.use(express.static('public'));

async function onGet(req, res) {
  const result = await sheet.getRows();
  const rows = result.rows;
  const tag = Object.values(rows[0]);
  const info = [];
  var tcnt = tag.length;
  var rcnt = Object.values(rows).length;

  // TODO(you): Finish onGet.
  for(var i = 1; i<rcnt; i++) {
    var val = Object.values(rows[i]);
    var item = {};
    for(var j=0; j<tcnt; j++) {
      item[tag[j]] = val[j];
    }
    info.push(item);
  }
  //console.log(info);

  res.json( info );
}
app.get('/api', onGet);

async function onPost(req, res) {
  const messageBody = req.body;
  const key = Object.keys(messageBody);
  const value = Object.values(messageBody);
  var pcnt = value.length;

  const result = await sheet.getRows();
  const rows = result.rows;
  const tag = Object.values(rows[0]);
  var tcnt = tag.length;
  var rcnt = Object.values(rows).length;
  const item = [tcnt];
  var check = 0;
  var correspond = 0;

  // TODO(you): Implement onPost.
  for(var i=0; i<tcnt; i++) {
    if(correspond === 1)break;
    for(var j=0; j<pcnt; j++) {
      if(key[j].toLowerCase() === tag[i].toLowerCase()) {
        for(var k=0; k<rcnt; k++) {
          var val = Object.values(rows[k]);
          if(val[i].toLowerCase() === value[j].toLowerCase()) {
            correspond = 1;
            break;
          }
        }
        item[i] = value[j];
        check = check + 1;
      }
    }
  }
  //console.log(item);
  if(check === tcnt && correspond === 0) {
    var pro = await sheet.appendRow(item);
  }

  res.json( { response: 'success'} );
}
app.post('/api', jsonParser, onPost);

async function onPatch(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const messageBody = req.body;
  console.log(column);
  console.log(value);
  console.log(messageBody);

  // TODO(you): Implement onPatch.
  

  res.json( { status: 'unimplemented'} );
}
app.patch('/api/:column/:value', jsonParser, onPatch);

async function onDelete(req, res) {
  const column  = req.params.column;
  const value  = req.params.value;
  const result = await sheet.getRows();
  const rows = result.rows;
  const tag = Object.values(rows[0]);
  var tcnt = tag.length;
  var rcnt = Object.values(rows).length;

  // TODO(you): Implement onDelete.
  for(var j=0; j<tcnt; j++) {
      if(tag[j].toLowerCase() === column.toLowerCase())
        break;
  }
  for(var i = 1; i<rcnt; i++) {
    var val = Object.values(rows[i]);
    if(val[j].toLowerCase() === value.toLowerCase()) {
      var pro = await sheet.deleteRow(i);
    }
  }

  res.json( { response: 'success'} );
}
app.delete('/api/:column/:value',  onDelete);


// Please don't change this; this is needed to deploy on Heroku.
const port = process.env.PORT || 3000;

app.listen(port, function () {
  console.log(`Fullstack HW5: Server listening on port ${port}!`);
});
