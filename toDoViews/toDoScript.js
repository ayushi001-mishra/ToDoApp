const submit = document.getElementById("submitToDo");
const userInput = document.getElementById("task");
const todoListNode = document.getElementById("todo-item");


var myNodelist = document.getElementsByTagName("LI");
var i;
for (i = 0; i < myNodelist.length; i++) {
  var span = document.createElement("SPAN");
  var txt = document.createTextNode("\u00D7");
  span.className = "close";
  span.appendChild(txt);

  var checkbox = document.createElement('input');          
  // Assigning the attributes
  // to created checkbox
  checkbox.type = "checkbox";
  checkbox.id = "id";

  myNodelist[i].appendChild(span);
  myNodelist[i].appendChild(checkbox);
}

// Click on a close button to hide the current list item
var close = document.getElementsByClassName("close");
var i;
for (i = 0; i < close.length; i++) {
  close[i].onclick = function() {
    var div = this.parentElement;
    div.style.display = "none";
  }
}

// Add a "checked" symbol when clicking on a list item
var list = document.querySelector('ul');
list.addEventListener('click', function(ev) {
  if (ev.target.tagName === 'LI') {
    ev.target.classList.toggle('checked');
  }
}, false);


userInput.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      //event.preventDefault();
      // Trigger the button element with a click
      document.getElementById("submitToDo").click();
    }
  });

submit.addEventListener("click", function(){
    const todoText=userInput.value;
    //console.log(todoText);

    if(!todoText ){
        alert("Please enter a todo:");
        return;
    }

    const todo = {                        //shorthand writting for objects
        todoText
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
    //const todoTextNode = document.createElement("li");
    //const priorityLevel = document.createElement("li");

    //todoTextNode.innerText  = todo.todoText; 
    //priorityLevel.innerText = todo.priority;

    //todoListNode.appendChild(todoTextNode);
    //todoListNode.appendChild(priorityLevel);
    var li = document.createElement("li");
    var t = document.createTextNode(todo.todoText);
    li.appendChild(t);
    document.getElementById("todo-item").appendChild(li);

    document.getElementById("task").value = "";

    var span = document.createElement("SPAN");
    var txt = document.createTextNode("\u00D7");
    span.className = "close";
    span.appendChild(txt);
    li.appendChild(span);

    for (i = 0; i < close.length; i++) {
        close[i].onclick = function() {
        var div = this.parentElement;
        div.style.display = "none";
        }
    }
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