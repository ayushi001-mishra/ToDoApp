const express = require('express');
const session = require('express-session');
const multer = require('multer');
const fs = require('fs');

const db = require('./models/db');
const UserModel = require("./models/users"); 
const TodoModel = require("./models/todo");

const app = express();
const upload = multer({dest : 'uploads/'}) ;

app.set("view engine", "ejs");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname + "/toDoViews"));
app.use(express.static(__dirname + "/uploads"));

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


// Middleware to add loggedInUser to all templates
app.use((req, res, next) => {
    res.locals.loggedInUser = req.session.loggedInUser ? req.session.loggedInUser.username : null;
    next();
});

app.get("/home", async function(req, res){
    try{
        if (req.session.loggedInUser) {
                const data= await UserModel.find({});
                const templateData = {
                    loggedInUser: req.session.loggedInUser.username,
                    data: data
                };
                res.render('home', templateData);
        }
        else 
            res.redirect('/');
    }
    catch(error){
        console.log("Error: ", error.message);
    }
});
        

app.get("/todos", function (req, res) {
    if(!req.session.isLoggedIn){
        res.redirect("/");
        return;
    }
    res.render("todo");
});

app.get("/about", function (req, res) {
    if(!req.session.isLoggedIn){
        res.redirect("/");
        return;
    }
    res.render("about");
});
  
app.get("/contact", function (req, res) {
    if(!req.session.isLoggedIn){
        res.redirect("/");
        return;
    }
    res.render("contact");
});

app.post("/todo", upload.single('task-image'), function (req, res) {
    const todoText = req.body.task;
    const image = req.file;

    const todo = {
        todoText: todoText,
        complete: false,
        image: image.filename
    };

    TodoModel.create(todo)
    .then(function(){
        res.render("todo.ejs");
    })
    .catch(function(err){
        res.status(500).send("Something while saving the todos.");
    });
});

app.get("/todo-data", async function (req, res) {
    try{
    const todos= await TodoModel.find({});
    res.status(200).json(todos);
    }
    catch(error){
        res.status(500).send("Error", error.message);
    }
});

app.put("/todo/:id", async function (req, res) {
    try{
        const {id} = req.params;
        const updatedTodo = req.body;
        
        const todo = await TodoModel.findByIdAndUpdate(id, updatedTodo);
        if(!todo){
            res.status(404).json({message: "Error"});
        }
        res.status(200).json({
            message: "ToDo updated successfully!"
        });
    }
    catch(error){
        console.log(error.message);
        res.status(500).json({message: error.message});
    } 
});

app.delete("/todo/:id", async function (req, res) {
    try{
        const {id} = req.params;
        const todo = await TodoModel.findByIdAndDelete(id);
        if(!todo){
            res.status(404).json({message: "Error"});
        }
        res.status(200).json({
            message: "ToDo deleted successfully!"
        });
    }
    catch(error){
        console.log(error.message);
        res.status(500).json({message: error.message});
    } 
});

//Authentication
app.get("/", function(req, res){
    res.render("login", {error: null});
})

app.post("/", (req, res) => {
  const username=req.body.username;
  const email=req.body.email;
  const password=req.body.password;

  UserModel.findOne({username: username, email: email, password: password})
    .then(function(user){
        if(user){
        req.session.isLoggedIn = true;
        req.session.loggedInUser = user;
        res.redirect('/home');
        return;
    }
    res.render("login", {error : "Username/Invalid email/password"});
  })
  .catch(function(err){
    res.render("login", {error : "Something went wrong"});
   });
});

app.get("/signup", function (req, res) {
    res.render("signup");
});

app.post('/create-account', (req, res) => {
    const username=req.body.username;
    const email=req.body.email;
    const password=req.body.password;
    const user={
        username,
        email,
        password,
    };
    UserModel.create(user)
    .then(function(){
        res.redirect("/");
    })
    .catch(function(err){
        res.render("signup",{error: "Something went during sign up."})
    });
});

app.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

app.get('/login-error', (req, res)=>{
    res.send("error");
});

db.init()
    .then(function(){
        console.log("Server on port 3000");

        app.listen(3000, function () {
            console.log("successful");
        });
    })
    .catch(function(err){
        console.log(err);
});
