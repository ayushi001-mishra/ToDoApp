const express = require('express');
const fs = require('fs');
var session = require('express-session');

const app = express();

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/toDoViews"));


app.use(session({
    secret: 'nothing',
    resave: false,
    saveUninitialized: true,
}));

// Load user data from JSON file
 let users = [];
fs.readFile('users.json', 'utf8', (err, data) => {
     if (!err) {
            if (data.length === 0) {
                data = "[]";
            }
         users = JSON.parse(data);
     }
 });


// let users = [];
// if (fs.existsSync('users.json')) {
//     userDetails(function (err, data) {
//         if (err) {
//             res.status(200).send("error")
//             return;
//         }
//         users = data;
// })}

// function userDetails(callback) {
//     fs.readFile("./users.json", "utf-8", function (err, data) {
//         if (err) {
//             callback(err);
//             return;
//         }
//         if (data.length === 0) {
//             data = "[]";
//         }
//         try {
//             data = JSON.parse(data);
//             callback(null, data);
//         } catch (err) {
//             callback(err);
//         }
//     });
// }


// Middleware to add loggedInUser to all templates
app.use((req, res, next) => {
    res.locals.loggedInUser = req.session.loggedInUser ? req.session.loggedInUser.username : null;
    next();
});

app.get("/home", function(req, res){
    if (req.session.loggedInUser) {
        fs.readFile('users.json', 'utf8', (err, data) => {
            if (!err) {
                const templateData = {
                    loggedInUser: req.session.loggedInUser.username,
                    data: JSON.parse(data) // Pass the data from users.json as a variable
                };
                res.render('home', templateData);
            } else {
                res.status(500).send('Error reading data from data.json.');
            }
        });
    } else {
        res.redirect('/login');
    }
    // if(!req.session.isLoggedIn){
    //     res.redirect("/login");
    //     return;
    // }
    //   res.render("home", {username: req.session.loggedInUser.username});
})

app.get("/todos", function (req, res) {
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    res.render("todo");
});

app.get("/about", function (req, res) {
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    res.render("about");
});
  
app.get("/contact", function (req, res) {
    if(!req.session.isLoggedIn){
        res.redirect("/login");
        return;
    }
    res.render("contact");
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
    res.render("index", {error: null});
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
    res.render("index", {error : "Invalid email or password"});
  }
});

app.get("/signup", function (req, res) {
    res.render("signup");
});

app.post('/create-account', (req, res) => {
  const username=req.body.username;
  const email=req.body.email;
  const password=req.body.password;

  if (users.some(u => u.email === email)) {
    res.send('An account with this email already exists. Please use a different email.');
  } else {
    const newUser = { username, email, password };
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