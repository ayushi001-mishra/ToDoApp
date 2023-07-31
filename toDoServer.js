const express = require('express');
var session = require('express-session');
const multer = require('multer');
const fs = require('fs');

const app = express();
const upload = multer({dest : 'uploads/'}) ;

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/toDoViews"));
app.use(express.static(__dirname + "/uploads"));


app.get("/", function (req, res) {
    res.sendFile(__dirname + "/toDoViews/index.html");
});

function generateId() {
    return Math.random().toString(36).substr(2, 9);
}

app.post("/todo", upload.single('task-image'), function (req, res) {
    const todoText = req.body.task;
    const image = req.file;

    const todo = {
        todoText: todoText,
        complete: false,
        id: generateId(),
        image: image.filename
    };

    saveToDoInFile(todo, function (err) {
        if (err) {
            res.status(500).send('error');
            return;
        }
    });
    res.sendFile(__dirname + "/toDoViews/index.html");
});

app.get("/todo-data", function (req, res) {
    readAllToDos(function (err, data) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        res.status(200).json(data);
    });
});

app.put("/todo/:id", function (req, res) {
    const todoId = req.params.id;
    const updatedTodo = req.body;
    readAllToDos(function (err, data) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        const updatedData = data.map(todo => {
            if (todo.id === todoId) {
                return { ...todo, ...updatedTodo };
            }
            return todo;
        });
        fs.writeFile("./data.json", JSON.stringify(updatedData), function (err) {
            if (err) {
                res.status(500).send("error");
                return;
            }
            res.status(200).json({
                message: "ToDo updated successfully!"
            });
        });
    });
});


app.delete("/todo/:id", function (req, res) {
    const todoId = req.params.id;
    readAllToDos(function (err, data) {
        if (err) {
            res.status(500).send("error");
            return;
        }
        const updatedData = data.filter(todo => todo.id !== todoId);
        fs.writeFile("./data.json", JSON.stringify(updatedData), function (err) {
            if (err) {
                res.status(500).send("error");
                return;
            }
            res.status(200).json({
                message: "ToDo deleted successfully!"
            });
        });
    });
});

function readAllToDos(callback) {
    fs.readFile("./data.json", "utf-8", function (err, data) {
        if (err) {
            callback(err);
            return;
        }
        if (data.length === 0) {
            data = "[]";
        }
        try {
            data = JSON.parse(data);
            callback(null, data);
        } catch (err) {
            callback(err);
        }
    });
}

function saveToDoInFile(todo, callback) {
    readAllToDos(function (err, data) {
        if (err) {
            callback(err);
            return;
        }

        data.push(todo);

        fs.writeFile("./data.json", JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }
            callback(null);
        });
    });
}


app.listen(3000, function () {
    console.log("successful");
});