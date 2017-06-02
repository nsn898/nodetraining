var express= require('express');
var bp= require('body-parser');
var _=require('underscore');
var app= express();

var pid=1;

var mypendings=[];

app.use(bp.json());
app.post('/postmydata',function(req,res){
var body=req.body;
body.id=pid++;
mypendings.push(body);
res.json(body);
});

app.use(express.static('public'));
app.get('/showmydata',function(req,res){
res.json(mypendings);
});

app.get('/getmydata/:id',function(req,res){
    var todoId=parseInt(req.params.id,10);
    var matchedToDo=_.findWhere(mypendings,{id:todoId});
    if(matchedToDo)
    {
        res.json(matchedToDo);
    }else
    {
        res.status(400).send();
    }
});

app.delete('/deletemydata/:id',function(req,res){
    var todoId=parseInt(req.params.id,10);
    var matchedTodo = _.findWhere(mypendings,{id:todoId}); 

    if(matchedTodo) {
    mypendings=_.without(mypendings,matchedTodo);
        res.json(matchedTodo);
    } else {
        res.status(404).json({"Error":"Id not found"});
    }
});

app.listen(3000,function(){
    console.log('server is running');
});

