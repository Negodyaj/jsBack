const express = require("express");
const fileUpload = require('express-fileupload');
var app = express();
var path = require('path');
var config = require('./setting.js'); //you have to create file which exports connection string
var sql = require('mssql');
var bodyParser = require('body-parser');
var moment = require('moment');

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname+'/view')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

//http://www.tutorialsteacher.com/nodejs/access-sql-server-in-nodejs
//https://github.com/patriksimek/node-mssql#connection-pools
//https://stackoverflow.com/questions/24582338/how-can-i-include-css-files-using-node-express-and-ejs
//https://tproger.ru/articles/localstorage/

const students = [
    {name: 'Сергей', githubAcc: 'S1111', score: 11},
    {name: 'Евгения', githubAcc: 'E2222', score: 15},
    {name: 'Илья', githubAcc: 't33333', score: 15},
    {name: 'Карина', githubAcc: 'l4444', score: 9},
    {name: 'Александра', githubAcc: 'p5555', score: 8},
    {name: 'Татьяна', githubAcc: 'P6666', score: 9},
];

function compare(a, b) {
    const scoreA = a.score;
    const scoreB = b.score;
  
    let comparison = 0;
    if (scoreA > scoreB) {
      comparison = 1;
    } else if (scoreA < scoreB) {
      comparison = -1;
    }
    return comparison * -1;
}

function getStudents(req, res) {


//    res.render(path.join(__dirname+'/view/index.ejs'), {students: students.sort(compare)});
//   const pool = new sql.ConnectionPool(config, err => {
//     var request = new sql.Request(pool);
//     request.query('select * from students ', function (err, recordset) {
//       res.render(path.join(__dirname+'/view/index.ejs'), {students: recordset});
//     });
//   });
}

app.get('/', function(req,res) {
//    this endpoint returns html:

  getStudents(req, res);
});

app.get('/students', function(req,res) {
//this endpoint returns array of json-objects:
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'origin, content-type, accept');
  res.send(students);
});

app.get('/api/getDictionaries', (req, res) => {
  const pool = new sql.ConnectionPool(config, err => {
    var request = new sql.Request(pool);
    var result = {};

    request.query('select Id, Caption as Value from dbo.ReqGroup order by Caption').then(groups => {
      result.groups = groups;
      return request.query('select Id, Caption as Value from dbo.RequirementType');
    }).then(types => {
      result.types = types;
      return request.query('select Id, Caption as Value from dbo.RequirementStatus');
    }).then(statuses => {
      result.statuses = statuses;
      res.send(result);
    })
  })
});

app.post('/api/getRequirementId', function(req, res) {
  const pool1 = new sql.ConnectionPool(config, err => {
    var request = new sql.Request(pool1);
    request.query('select * from backlog where id = ' + req.body.req_id + 'order by priority DESC', function (err, recordset) {
      res.send(recordset);
    });
  });
});

app.post('/api/login', function(req, res) {
  const pool1 = new sql.ConnectionPool(config, err => {
    var request = new sql.Request(pool1);
    request.query("select * from [User] where email = '" + req.body.email + "' and [password] = '" + req.body.pass+"'", function (err, recordset) {
      if (err) console.log(err);
      res.send(recordset);
    });
  });
});

app.post ('/api/getComment', (req, res)=>{
  var getCommentRequest = `
    select c.[Id]
      ,c.[Text]
      ,c.[Timestamp]
      ,u.[Name] as UserName from comment as c
      left join [User] as u on u.id = c.UserId
      where c.RequirementId = ${req.body.req_id} order by c.[Timestamp] DESC`;

  const pool = new sql.ConnectionPool(config, err => {
    var request = new sql.Request(pool);

    request.query(getCommentRequest, (err, recordset)=>{
      if (err) console.log(err);
      res.send(recordset);
    })
  })
})

app.post('/api/addcomment', function(req,res) {
  const pool = new sql.ConnectionPool(config, err=> {
    var request = new sql.Request(pool);
    var now = new Date();

    const queryInsert = `insert into Comment ([Text], [UserId], [Timestamp], [RequirementId])
      values (
        '${req.body.text}',
        ${req.body.user_id},
        '${moment().format('YYYY-MM-DD hh:mm:ss')}',
        ${req.body.req_id}
      )`;

    request.query(queryInsert, function(err, recordset){
      if (err) console.log(err);
      res.send(recordset);
    })
  })
});

app.post('/api/getAttachments', (req, res)=>{
  var getAttachmentRequest = `
    select Id
      ,RequirementId
      ,Name
      ,Path
      ,Timestamp
    from dbo.Attachment
    where RequirementId = ${req.body.req_id}
    order by Timestamp DESC`;

  const pool = new sql.ConnectionPool(config, err => {
    var request = new sql.Request(pool);

    request.query(getAttachmentRequest, (err, recordset)=>{
      if (err) console.log(err);
      res.send(recordset);
    })
  })
})

app.post('/api/addAttachment', function(req,res) {
  const pool = new sql.ConnectionPool(config, err=> {
    var request = new sql.Request(pool);
    var now = new Date();

    var reqId = req.header('Referer').substring(req.header('Referer').lastIndexOf('/') + 1);

    let sampleFile = req.files.sampleFile;
    let nameWithData = moment().format('YYYY-MM-DD_hh-mm-ss') + '_' + req.files.sampleFile.name;
    let pathToFileForDb = './attachments/' + nameWithData;
    let localPathToFile = 'view/attachments/' + nameWithData;

    const queryInsert = `insert into dbo.Attachment (RequirementId, Name, Path, Timestamp)
      values (
        ${reqId},
        '${sampleFile.name}',
        '${pathToFileForDb}',
        '${moment().format('YYYY-MM-DD hh:mm:ss')}'
      )`;

    request.query(queryInsert, function(err, recordset){
      if (err) console.log(err);
    })

    sampleFile.mv(localPathToFile, function(err) {
      if (err)
        return res.status(500).send(err);

      return res.status(200).redirect('/' + reqId);
    });
  })
});

app.listen(3000, function(){ //
    console.log('Server is started');
});
