const express = require('express');
const fs = require('fs');
var session = require('express-session');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/toDoViews"));


app.use(session({
    secret: 'nothing',
    resave: false,
    saveUninitialized: true,
}));
  
let users = [];
if (fs.existsSync('users.json')) {
    userDetails(function (err, data) {
        if (err) {
            res.status(200).send("error")
            return;
        }
        users = data;
})}

function userDetails(callback) {
    fs.readFile("./users.json", "utf-8", function (err, data) {
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
app.get("/home", function(req, res){
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
      res.sendFile(__dirname + "/toDoViews/home.html");
})

app.get("/todos", function (req, res) {
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    res.sendFile(__dirname + "/toDoViews/index.html");
});

app.get("/about", function (req, res) {
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    res.sendFile(__dirname + "/toDoViews/about.html");
});
  
app.get("/contact", function (req, res) {
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    res.sendFile(__dirname + "/toDoViews/contact.html");
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


// Authentication
app.get("/login", function(req, res){
    res.sendFile(__dirname+"/toDoViews/login.html");
})


app.post('/login', (req, res) => {

  const email=req.body.email;
  const password=req.body.password;

  const user = users.find(u => u.email === email);
  if (user && user.password===password) {
    req.session.isLoggedIn = true;
    req.session.loggedInUser = user;
    res.redirect('/home');
  } else {
    res.redirect('/login-error');
  }
});

app.post('/create-account', (req, res) => {
  const email=req.body.email;
  const password=req.body.password;

  if (users.some(u => u.email === email)) {
    res.send('An account with this email already exists. Please use a different email.');
  } else {
    const newUser = { email, password };
    users.push(newUser);
    fs.writeFileSync('users.json', JSON.stringify(users));
    res.redirect('/login');
  }
});


app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

app.get('/login-error', (req, res)=>{
    res.send("error");
});


  app.listen(3000, function () {
    console.log("successful");
});