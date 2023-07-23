const express = require('express');
const fs = require('fs');

const app = express();

app.use(express.json());
app.use(express.static(__dirname + "/toDoViews"));

app.get("/", function (req, res) {
    res.sendFile(__dirname + "/toDoViews/index.html");
});

app.post("/todo", function (req, res) {
    saveToDoInFile(req.body, function (err) {
        if (err) {
            res.status(500).send('error');
            return;
        }

        res.status(200).send("success");
    });
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

        fs.writeFile("./treasure.txt", JSON.stringify(updatedData), function (err) {
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

        fs.writeFile("./treasure.txt", JSON.stringify(updatedData), function (err) {
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

app.listen(3000, function () {
    console.log("successful");
});

function readAllToDos(callback) {
    fs.readFile("./treasure.txt", "utf-8", function (err, data) {
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

        fs.writeFile("./treasure.txt", JSON.stringify(data), function (err) {
            if (err) {
                callback(err);
                return;
            }

            callback(null);
        });
    });
}
