var express= require('express');
var bp= require('body-parser');
var _=require('underscore');
var MongoClient= require('mongodb').MongoClient;
var cluster=require('cluster');

//new
var path = require('path');
var formidable = require('formidable');
var fs = require('fs');
//

var app= express();
//new
app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req, res){
  res.sendFile(path.join(__dirname, 'views/index.html'));
});

app.post('/upload', function(req, res){

  // create an incoming form object
  var form = new formidable.IncomingForm();

  // specify that we want to allow the user to upload multiple files in a single request
  form.multiples = true;

  // store all uploads in the /uploads directory
  form.uploadDir = path.join(__dirname, '/uploads');

  // every time a file has been uploaded successfully,
  // rename it to it's orignal name
  form.on('file', function(field, file) {
    fs.rename(file.path, path.join(form.uploadDir, file.name));
  });

  // log any errors that occur
  form.on('error', function(err) {
    console.log('An error has occured: \n' + err);
  });

  // once all the files have been uploaded, send a response to the client
  form.on('end', function() {
    res.end('success');
  });

  // parse the incoming request containing the form data
  form.parse(req);

});
//
if(cluster.isMaster){
    //count no. of cpus
    var cpuCount=require('os').cpus().length;

    //create worker for each cpu
    for(var i=0;i<cpuCount;i++)
    {
        cluster.fork();
    }

}else {

app.get('/getmydata',function(req,res){
    res.send('Hello from worker'+cluster.worker.id);
})

var db;

MongoClient.connect('mongodb://admin:admin@ds161551.mlab.com:61551/naredb',(err,database)=>{
    if(err){
        return console.log('error:'+err)
    }else{
        db=database;
    }
})

var pid=1;

var mypendings=[];

app.use(bp.json());
app.post('/postmydata',function(req,res){
    db.collection('mytasks').save(req.body,(err,result)=>{
        if(err) return console.log(err);
        console.log('Save to database');
    })
});


//app.use(express.static('public'));
app.get('/showmydata',function(req,res){
res.json(mypendings);
});

app.get('/getmydata', (req,res)=>{
    db.collection('mytasks').find().toArray((err,result)=>{
        if(err) return console.log(err)
        res.json(result)
    })
});

app.delete('/deletedata',function(req,res){
    db.collection('mytasks').findOneAndDelete({name: req.body.name},(err,result)=>{
      if(err) return console.log(err)
      res.send('record deleted')  
    })
});

app.listen(3000,function(){
    console.log('server is running');
});

}