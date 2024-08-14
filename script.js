

let currentTaskElement = null;    //for the current that needs to EDITED
let currentTaskToBeDeleted = null; // for tracking the task that needs to be deleted
let lastPinnedTaskOriginalIndex = null; // for preserving the last pinned item's index.


/* ---------------------------------------- LOAD from SESSIION Storage ---------------------------------------- */
function loadTasks() {
  let tasks = JSON.parse(sessionStorage.getItem("tasks")) || [];

  tasks.forEach(task => {
    let newTask = createTaskElement(task);
    newTask.style.opacity = task.opacity;
    newTask.style.textDecoration = task.textdecor;
    let currentTaskToggleClass = newTask.querySelector(".toggle-opacity");
    currentTaskToggleClass.className = task.currentToggleClass;
    document.getElementById("myList").appendChild(newTask);
  });

  emptyMessage();

  //update move-up and move-down states accordingly
  document.querySelectorAll("#myList li").forEach(moveUpDownState);
}






/* -------------------------------------- SAVE the tasks to SESSION Storage ---------------------------------------- */
function saveTasks() {
  let tasks = [];
  let taskElements = document.querySelectorAll("#myList li");

  taskElements.forEach((task) => {
    let currentTaskToggleClass = task.querySelector(".toggle-opacity");
    tasks.push({
      text: task.textContent.trim(),
      opacity: task.style.opacity,
      textdecor: task.style.textDecoration,
      currentToggleClass: currentTaskToggleClass.className,
      pinned: task.classList.contains('pinned')
    });
  });

  sessionStorage.setItem("tasks", JSON.stringify(tasks));

  taskElements.forEach(moveUpDownState);
}






/* ---------------------------------------- CREAT NEW TASK FUNCTION ---------------------------------------- */
function createTaskElement(text) {

  //(Initialize the task with CSS-style)
  let newTask = document.createElement("li");
  newTask.className =
    "my-1 list-group-item list-group-item-action list-group-item-light border border-0 border-bottom rounded ps-5 pe-4 pb-1 pt-4";
  newTask.href = "#";
  newTask.style.paddingLeft = "15%";
  newTask.style.paddingRight = "25%";

  //(task footer for placing all icons)
  let taskFooter = document.createElement("div");
  taskFooter.className = "task-footer";

  if (typeof text == "object") {
    newTask.textContent = text.text;
    newTask.style.opacity = text.opacity;
    newTask.style.textDecoration = text.textdecor;
    if (text.pinned) {
      newTask.classList.add('pinned');
    }
  } else {
    newTask.textContent = text;
  }

  //(Add All buttons)
  let moveUpIcon = document.createElement("i");
  moveUpIcon.className = "move-up bi bi-arrow-up mt-2";

  let moveDownIcon = document.createElement("i");
  moveDownIcon.className = "move-down bi bi-arrow-down mt-2";

  let closeicon = document.createElement("i");
  closeicon.className = "close bi bi-trash mt-2";

  let editicon = document.createElement("i");
  editicon.className = "edit bi bi-pencil-square mt-2";

  let toggleicon = document.createElement("i");
  if (text.currentToggleClass) {
    toggleicon.className = text.currentToggleClass;

  } else {
    toggleicon.className = "toggle-opacity bi bi-square mt-2";
 
  }

  let duplicateicon = document.createElement("i");
  duplicateicon.className = "duplicate bi bi-copy mt-2";

  let pinicon = document.createElement("i");
  pinicon.className = text.pinned ? "pin bi bi-pin-angle-fill mt-2" : "pin bi bi-pin mt-2";
  pinicon.style.cursor = "pointer";

  
  //(Button functionalities)
  moveUpIcon.onclick = () => {
    let prevElement = newTask.previousElementSibling;
    if (prevElement && prevElement.tagName === "LI") {
      newTask.parentNode.insertBefore(newTask, prevElement);
      saveTasks();
      moveUpDownState(newTask);
    }
  };

  moveDownIcon.onclick = () => {
    let nextElement = newTask.nextElementSibling;
    if (nextElement && nextElement.tagName === "LI") {
      newTask.parentNode.insertBefore(nextElement, newTask);
      saveTasks();
      moveUpDownState(newTask);
    }
  };

  closeicon.onclick = () => {
    currentTaskToBeDeleted = newTask;
    document.getElementById("deleteTaskHere").textContent = newTask.childNodes[0].textContent.trim();
    let deleteModal = new bootstrap.Modal(document.getElementById("deleteModal"));
    deleteModal.show();
  };

  editicon.onclick = (event) => {
    currentTaskElement = newTask;
    document.getElementById("editTaskInput").value = newTask.childNodes[0].textContent.trim();
    let editModal = new bootstrap.Modal(document.getElementById("editModal"));
    editModal.show();
  };

  toggleicon.onclick = () => {
    if (toggleicon.classList.contains("bi-square")) {
      newTask.style.opacity = "0.3";
      newTask.style.textDecoration = "line-through";
      toggleicon.className = "toggle-opacity bi bi-check-square-fill mt-2";
    } else {
      newTask.style.opacity = "1";
      newTask.style.textDecoration = "none";
      toggleicon.className = "toggle-opacity bi bi-square mt-2";
    }
  
    saveTasks();
  };

  duplicateicon.onclick = () => {
    let clonedTask = createTaskElement({
      text: newTask.childNodes[0].textContent.trim(),
      opacity: newTask.style.opacity,
      textdecor: newTask.style.textDecoration,
      currentToggleClass: newTask.querySelector(".toggle-opacity").className,
      pinned: newTask.classList.contains('pinned')
    });
    let parent = newTask.parentNode;
    parent.insertBefore(clonedTask, newTask.nextElementSibling);
    saveTasks();
    moveUpDownState(clonedTask);
  };

  pinicon.onclick = () => {
    pinTask(newTask);
  };

  //(Appending to the Tasks)
  taskFooter.appendChild(moveUpIcon);
  taskFooter.appendChild(moveDownIcon);
  taskFooter.appendChild(closeicon);
  taskFooter.appendChild(editicon);
  taskFooter.appendChild(duplicateicon);
  taskFooter.appendChild(toggleicon);
  taskFooter.appendChild(pinicon);

  //(Appending the footer to the task)
  newTask.appendChild(taskFooter);

  //(States of move-up and move-down buttons)
  moveUpDownState(newTask);

  //(return newly made task)
  return newTask;
}





/* ---------------------------------------- ADDTASK FUNCTION ()  ---------------------------------------- */
// takes input field text and sends to createTaskElement() function for its styling etc.

function AddTask() {
  let text = document.getElementById("textTask").value;
  if (text === "") {
    insertTask();
    return;

  }
  let newTask = createTaskElement(text);
  document.getElementById("myList").appendChild(newTask);
  saveTasks();
  document.getElementById("textTask").value = "";
  emptyMessage();
}





/* ---------------------------------------- SAVETASK FUNCTION ()  ---------------------------------------- */
// when currentTaskElement is set (to-be-edited-task), gets new input text from MODAL & sets its updated textContent

function saveTask() {
  if (currentTaskElement) {
    let newText = document.getElementById("editTaskInput").value;
    if (newText.trim() !== "") {
      currentTaskElement.childNodes[0].textContent = newText;
      saveTasks();
    }
    let editModal = bootstrap.Modal.getInstance(
      document.getElementById("editModal")
    );
    editModal.hide();
  }
}




/* ---------------------------------------- DELETETASK FUNCTION ()  ---------------------------------------- */
// when currentTaskToBeDeleted is set (to-be-deleted-task), it deletes the task from memory/storage.

function deleteTask() {
  if (currentTaskToBeDeleted) {
    currentTaskToBeDeleted.remove();
    saveTasks();
    emptyMessage();
    let deleteModal = bootstrap.Modal.getInstance(document.getElementById("deleteModal"));
    deleteModal.hide();
  }
}






/* ---------------------------------------- INSERTTASK FUNCTION ()  ---------------------------------------- */
// when nothing is entered into the input field, it gives error in the form of modal.

function insertTask() {
    // let insertModal = bootstrap.Modal.getInstance(document.getElementById("insertModal"));
    let insertModalElement = document.getElementById("insertModal");
    let insertModal = bootstrap.Modal.getOrCreateInstance(insertModalElement);
    insertModal.show();
}





/* ---------------------------------------- MOVEUPDOWNSTATE FUNCTION ()  ---------------------------------------- */
// Checks if the task is either at the top/bottom -most index or not and disables the buttons accordingly.

function moveUpDownState(task) {
  const moveUpIcon = task.querySelector(".move-up");
  const moveDownIcon = task.querySelector(".move-down");

  // Get the previous and next sibling elements
  const prevElement = task.previousElementSibling;
  const nextElement = task.nextElementSibling;

  // Disable/Enable the move up button
  if (prevElement) {
    moveUpIcon.classList.remove("disabled-button");
  } else {
    moveUpIcon.classList.add("disabled-button");
  }

  // Disable/Enable the move down button
  if (nextElement) {
    moveDownIcon.classList.remove("disabled-button");
  } else {
    moveDownIcon.classList.add("disabled-button");
  }
}






/* ---------------------------------------- PINTASK FUNCTION ()  ---------------------------------------- */
// when when a task is pinned, it gets at the top of the list. when it is unpinned, it gets to its orignal index in the list/array
function pinTask(task) {

    let list = document.getElementById("myList");
    let taskList = Array.from(list.children);
    
    if (task.classList.contains("pinned")) {
      //  Unpin the task
      task.classList.remove('pinned');
      let pinIcon = task.querySelector(".pin");
      pinIcon.className = "pin bi bi-pin mt-2";

      if (lastPinnedTaskOriginalIndex !== null) {
        let originalPosition = taskList[lastPinnedTaskOriginalIndex];
        list.insertBefore(task, originalPosition.nextSibling);
      } else {
        list.appendChild(task);
      }
  
      lastPinnedTaskOriginalIndex = null;
      saveTasks();
    } else {
      // Pin the task
      lastPinnedTaskOriginalIndex = taskList.indexOf(task); //orignal index
      list.removeChild(task);
      task.classList.add('pinned');
      let pinIcon = task.querySelector(".pin");
      pinIcon.className = "pin bi bi-pin-angle-fill mt-2";
      list.insertBefore(task, list.firstChild);
      saveTasks();
    }

  
  // let list = document.getElementById("myList");
  // let taskList = Array.from(list.children);

  // list.removeChild(task);

  // task.classList.add('pinned');
  // let pinIcon = task.querySelector(".pin");
  // pinIcon.className = "pin bi bi-pin-angle-fill mt-2";
  
  // list.insertBefore(task, list.firstChild);

  // saveTasks();
}




/* ---------------------------------------- EMPTYMESSAGE FUNCTION ()  ---------------------------------------- */
// Checks if the task list is empty or not and displays message in div(message) accordingly.

function emptyMessage() {
  var list = document.querySelectorAll("#myList li");
  if (list.length === 0) {
    document.getElementById("message").textContent = "Task list is clear...";
  } else {
    document.getElementById("message").textContent = "";
  }
}





/* ---------------------------------------- CURRENT DATE AND TIME  ---------------------------------------- */
// Get the current date and time

function displayDate() {
  let current = new Date();
  let day = current.getDate();
  let month = current.getMonth() + 1; 
  let year = current.getFullYear(); 
  let hours = current.getHours(); 
  let minutes = current.getMinutes();
  let seconds = current.getSeconds(); 

  let ampm = hours >= 12 ? 'PM' : 'AM';
  let hours12 = hours % 12;
  hours12 = hours12 ? hours12 : 12; // the hour '0' should be '12'
  // Format the date and time string
  // let formattedDateTime = `${month}/${day}/${year} ${hours12}:${minutes}:${seconds} ${ampm}`;
  let formattedDateTime = `${month}/${day}/${year} ${hours12}:${minutes} ${ampm}`;
  document.getElementById("today").textContent = formattedDateTime;
}
setInterval(displayDate, 1000);
// displayDate();




/* ---------------------------------------- WINDOW.ONLOAD  ---------------------------------------- */
// Automatically previous session-stored tasks when the page/window is loaded
window.onload = loadTasks;
