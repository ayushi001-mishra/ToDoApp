const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json())              //middleware: since it is global so it works before every request gets request and parses it  and adds in inside request by the name body
app.use(express.static(__dirname+"/toDoViews")) 

app.get("/", function(req, res){
    res.sendFile(__dirname + "/toDoViews/index.html");
});


app.post("/todo", function(req, res){           
    //console.log(req.body);
    saveToDoInFile(req.body, function(err){
        if(err){
            res.status(500).send('error');
            retrun;
        }

        res.status(200).send("success");
    })
});

app.get("/todo-data", function(req, res){
    readAllToDos(function(err,data){
        if(err){
        res.status(500).send("error");
        return;
    }
    res.status(200).json(data);
    //res.status(200).send(JSON.stringify(data));
    });
});


//app.get("/toDoScript.js", function(req, res){
//    res.sendFile(__dirname + "/toDoViews/toDoScript.js");
//});


app.listen(3000, function(){
    console.log("successful");
});


function readAllToDos(callback){
    fs.readFile("./treasure.txt", "utf-8", function(err, data){
        if(err){
            callback(err);
            return;
        }
        if(data.length===0){
            data="[]";
        }
        try{
            data = JSON.parse(data);
            callback(null, data);
        }catch(err){
            callback(err);
        }
    });
}

function saveToDoInFile(todo, callback){

    readAllToDos(function(err, data){
        if(err){
            callback(err);
            return;
        }

        data.push(todo);
 
        fs.writeFile("./treasure.txt", JSON.stringify(data), function(err){
            if(err){
                callback(err);
                return;
            }

            callback(null);
        });
    });
} 
/**
 * 
 * fs.readFile("./treasure.mp4", "utf-8", function(err, data){
        if(err){
            res.status(500).json({
                massage:"Internal server error";
            });
            return;
        }

        if(data.length===0){
            data="[]";
        }
        try{
            data = JSON.parser(data);
            data.push(req.body);

            fs.writeFile("./treasure.mp4", JSON.stringify(data), function(req, res){
                if(err){
                    res.status(500).json({
                        message: "Internal  server error"
                    });
                    return;
                }
                res.status(200).json({
                    message: "ToDo saved successfully!"
                });
            });
        }
        catch(err){
            res.status(500).json({
                massage:"Internal server error";
            });
        }
    })
 */