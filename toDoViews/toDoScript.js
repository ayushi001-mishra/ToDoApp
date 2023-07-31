function showToDoInUI(todo) {
  var li = document.createElement("li");
  li.className="liclass";

  var t = document.createTextNode(todo.todoText);
  li.appendChild(t);

  var span1 = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span1.className = "close";
  span1.appendChild(txt);
  li.appendChild(span1);


  var checkbox = document.createElement("input");
  checkbox.type = "checkbox";
  checkbox.className="checkclass";
  checkbox.checked = todo.complete; 
 
  var span2 = document.createElement("SPAN");
  span2.appendChild(checkbox);
  li.appendChild(span2);

  var pic = new Image(25, 25);
  pic.src=todo.image;
  li.appendChild(pic);

  document.getElementById("todo-item").appendChild(li);
  document.getElementById("task").value = "";
  document.getElementById("task-image").value = "";

  for (i = 0; i < close.length; i++) {
    close[i].onclick = function () {
      var div = this.parentElement;
      div.style.display = "none";
    };
  }

  span1.addEventListener("click", function () {
    deleteToDoInUI(todo, li); 
  });

  if(todo.complete===true){
    var list= checkbox.parentElement.parentElement;
    list.style.textDecoration = "line-through";
  }
  else{
    var list= checkbox.parentElement.parentElement;
    list.style.textDecoration = "none";
  }

  checkbox.addEventListener("change", function () {
    if(todo.complete===false){
      var list= checkbox.parentElement.parentElement;
      list.style.textDecoration = "line-through";
    }
    else{
      var list= checkbox.parentElement.parentElement;
      list.style.textDecoration = "none";
    }
    updateToDoInUI(todo, li, !todo.complete); 
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