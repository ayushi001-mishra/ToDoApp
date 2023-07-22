const submit = document.getElementById("submitToDo");
const userInput = document.getElementById("task");
const prioritySelector = document.getElementById("priority");
const todoListNode = document.getElementById("todo-item");

submit.addEventListener("click", function(){

    const todoText=userInput.value;
    //console.log(todoText);
    const priority=prioritySelector.value;

    if(!todoText || !priority){
        alert("Please enter a todo:");
        return;
    }

    const todo = {                        //shorthand writting for objects
        todoText,
        priority,
    };

    fetch("/todo", {
        method: "POST",
        headers:{
            "Content-Type": "application/json",
        },
        body: JSON.stringify(todo),
    }).then(function(response){
            if(response.status===200){
                showToDoInUI(todo);
            }
            else{
                alert("Something send wrong!");
            }
    })
});

function showToDoInUI(todo){
    const todoTextNode = document.createElement("ayushi");
    const priorityLevel = document.createElement("priority");

    todoTextNode.innerText  = todo.todoText; 
    priorityLevel.innerText = todo.priority;

    todoListNode.appendChild(todoTextNode);
    todoListNode.appendChild(priorityLevel);
}

fetch("/todo-data").then(function(response){
    if(response.status===200){
        return response.json();
    }else{
        alert("something went wrong in fetch toDoScript");
    }
})
.then(function(todos){
    todos.forEach(function(todo){
        showToDoInUI(todo);
    })
}); 