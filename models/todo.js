const mongoose = require("mongoose");

const todoSchema = new mongoose.Schema({
    todoText: String,
    complete: Boolean,
    image: String
});

const Todo = mongoose.model("Todo", todoSchema);

module.exports =Todo;