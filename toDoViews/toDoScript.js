const submit = document.getElementById("submitToDo");
const userInput = document.getElementById("task");
const todoListNode = document.getElementById("todo-item");


var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

userInput.addEventListener("keypress", function(event) {
  if (event.key === "Enter") {
    document.getElementById("submitToDo").click();
  }
});


submit.addEventListener("click", function () {
  const todoText = userInput.value;

  if (!todoText) {
    alert("Please enter a todo:");
    return;
  }
  function generateId() {

    return Math.random().toString(36).substr(2, 9);
  }
  const todo = {
    todoText: todoText,
    complete: false,
    id: generateId(),
  };

  fetch("/todo", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })
    .then(function (response) {
      if (response.status === 200) {
        showToDoInUI(todo);
        todosData.push(todo); 
      } else {
        alert("Something went wrong!");
      }
    })
    .catch(function (error) {
      console.error("Error occurred while adding the todo:", error);
    });
});

function showToDoInUI(todo) {
  var li = document.createElement("li");
  li.className="liclass";
  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className="checkclass";
  checkbox.checked = todo.complete; 
 

  var t = document.createTextNode(todo.todoText);
  li.appendChild(t);
  li.appendChild(checkbox);
  document.getElementById("todo-item").appendChild(li);
  document.getElementById("task").value = "";

  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);
  li.appendChild(span);

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      var div = this.parentElement;
      div.style.display = "none";
    };
  }

  span.addEventListener("click", function () {
    deleteToDoInUI(todo, li); 
  });

 
  checkbox.addEventListener("change", function () {
    if(todo.complete===false){
      var list= this.parentElement;
      list.style.textDecoration = "line-through";
    }
    else{
      var list= this.parentElement;
      list.style.textDecoration = "none";
    }
    updateToDoInUI(todo, li, checkbox.checked); 
  });
}

function updateToDoInUI(todo, li, isComplete) {
  todo.complete = isComplete; 

 
  fetch(`/todo/${todo.id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })
    .then(function (response) {
      if (response.status !== 200) {
        alert("Something went wrong while updating the todo!");
      }
    })
    .catch(function (error) {
      console.error("Error occurred while updating the todo:", error);
    });
}

function deleteToDoInUI(todo, li) {
  fetch(`/todo/${todo.id}`, {
    method: "DELETE",
  })
    .then(function (response) {
      if (response.status === 200) {
       
        todosData = todosData.filter((item) => item.id !== todo.id);
        li.style.display = "none"; 
      } else {
        alert("Something went wrong while deleting the todo!");
      }
    })
    .catch(function (error) {
      console.error("Error occurred while deleting the todo:", error);
    });
}

fetch("/todo-data")
  .then(function (response) {
    if (response.status === 200) {
      return response.json();
    } else {
      alert("something went wrong in fetch toDoScript");
    }
  })
  .then(function (todos) {
    todosData = todos; 
    todos.forEach(function (todo) {
      showToDoInUI(todo);
    });
  });
