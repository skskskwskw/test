class Task {

    // static id = localStorage.getItem("id") || 0 // will do when i implement json saving
    static id = 0
    static tasks = []
    static fromJSON(json) {
        return new Task(json.name, json.desc, json.image, json.state, json.creator)
    }

    constructor(name, desc = '', image = '', state, creator) {
        Task.id++
        this.name = name
        this.desc = desc
        this.image = image
        this.state = state
        this.creator = creator
        this.id = Task.id 

        Task.tasks.push(this)
    }

    update(
        name = this.name,
        desc = this.desc,
        image = this.image,
        state = this.state,
        creator = this.creator
    ) {
        this.name = name
        this.desc = desc
        this.image = image
        this.state = state
        this.creator = creator
    }

    get element() {
        const task = document.createElement("div");
        const content = document.importNode(document.getElementById("task-template").content, true)

        task.classList.add("task")
        task.setAttribute("data-id", `task-${this.id}`)
        task.appendChild(content)
        task.querySelector(".task-title").textContent = this.name
        task.querySelector(".task-id").textContent = "#" + this.id
        const creatorTxt = "By:"
        const descTxt = "Description:"
        const stateTxt = "Status:"

        addSpan(task.querySelector(".task-creator-text-wrapper"), creatorTxt)
        task.querySelector(".task-creator-text").textContent = this.creator

        if (this.image) {
            const image = document.createElement("img")
            image.classList.add("task-image")
            image.src = this.image
            image.alt = "task-image"
            task.querySelector(".task-content").appendChild(image)
        }

        if (this.desc) {
            const desc = document.createElement("div")
            desc.classList.add("task-desc-wrapper")
            addSpan(desc, descTxt)
            const descText = document.createElement("p")
            descText.classList.add("task-desc")
            descText.textContent = this.desc
            desc.appendChild(descText)
            task.querySelector(".task-content").appendChild(desc)            
        }

        addSpan(task.querySelector(".task-state-wrapper"), stateTxt)
        task.querySelector(".task-state").textContent = this.state  //will add a color indicator in the future.
        
                

        const buttons = document.importNode(document.getElementById("button-template").content, true)
        task.querySelector(".task-controls").appendChild(buttons)

        function addSpan(element, text) {
            const span = document.createElement("span")
            span.textContent = text
            element.insertAdjacentElement("afterbegin", span)
        }

        return task
    }
}

class TaskList {

    constructor(...tasks) {
        this.element = document.createElement("div")
        this.element.setAttribute("id", "task-list")
        if (Boolean(...tasks)) {
            tasks.forEach((task)=>{
                try {
                    this.element.appendChild(task.element)
                } catch (error) {
                    console.error("An error okuu'd. Posibly the task format is not correct:", error);
                }
            })
        } 
    }
    
    add(task) {
        this.element.appendChild(task)
        return task
    }

    delete(id) {
        document.querySelector(`[data-id="${id}"]`).remove()
    }
}

function deleteTask(button) {
    const task = button.closest(".task").dataset.id
    taskList.delete(task)
}

async function modifyTask(button) {

    const task = button.closest(".task")
    const taskObj = Task.tasks.find(obj => obj.id === Number(task.dataset.id.match(/\d/g).join("")))
    const content = task.querySelector(".task-inner-wrapper")
    const modifyForm = document.importNode(document.getElementById("modify-form-template").content, true)
    modifyForm.querySelector(".modify-form").style.height = content.getBoundingClientRect().height + "px"
    content.classList.add("hidden")

    task.insertBefore(modifyForm, content)

    const taskName = task.querySelector(".m-task-name")
    const taskCreator = task.querySelector(".m-task-creator")
    const taskState = task.querySelector(".m-task-state")
    const taskDesc = task.querySelector(".m-task-desc")
    const imageInput = task.querySelector(".m-task-image")
    const preview = task.querySelector(".m-task-image-preview")
    const form = task.querySelector(".modify-form")

    //setting the form values the same as the contents

    taskName.value = task.querySelector(".task-title").textContent
    taskCreator.value = task.querySelector(".task-creator-text").textContent
    taskState.value = task.querySelector(".task-state").textContent
    taskDesc.value = (task.querySelector(".task-desc")) ? task.querySelector(".task-desc").textContent : ""

    if (task.querySelector(".task-image")) {
        preview.src = task.querySelector(".task-image").src
        preview.classList.remove("hidden")
    }

    imageInput.onchange = function() {
        const reader = new FileReader()
        try {
            reader.readAsDataURL(this.files[0])
        } catch (error) {
            console.log(error);
            preview.classList.add("hidden")
        }
        reader.onload = () => {
            preview.src = reader.result
            preview.classList.remove("hidden")
        }
    }

    form.onsubmit = async (e) => {
        e.preventDefault()
        const title = taskName.value.trim()
        const creator = taskCreator.value.trim()
        const state = taskState.value.trim()
        const desc = taskDesc.value.trim()
        const image = await (() => {
    
            if (imageInput.files.length) {
                return new Promise((read, reject) => {
                    const reader = new FileReader()
                    try {
                        reader.readAsDataURL(imageInput.files[0]) 
                    } catch (error) {
                        console.error(error);
                        reject()
                    }
                    
                    reader.onload = () => {
                        read(reader.result)
                    }
                 })
            } else {
                console.log("no image m");
                return undefined
            }
        })()
        taskObj.update(title, desc, image, state, creator)
        task.replaceWith(taskObj.element)
    }
}

function closeModifyForm(button) {

    const task = button.closest(".task")
    task.querySelector(".task-inner-wrapper").classList.remove("hidden")
    button.closest(".modify-form").remove()
}

function collapseButton() {
    const mainTab = document.getElementById('main-tab'), button = document.getElementById('collapse-btn')
    mainTab.classList.toggle('hidden')
    button.classList.toggle('tab-hidden')
    //this was just a quick thing. i'll add a proper background later
    if (button.classList.contains('tab-hidden')) {
        button.innerHTML = '+'
    } else {
        button.innerHTML = '-'
    }
}

//image preview
document.getElementById("task-image").onchange = function() {
    const preview = document.getElementById("task-image-preview")
    const reader = new FileReader()
    try {
        reader.readAsDataURL(this.files[0])
    } catch (error) {
        console.log(error);
        preview.classList.add("hidden")
    }
    reader.onload = () => {
        preview.src = reader.result
        preview.classList.remove("hidden")
    }
}
 
document.getElementById("form").onsubmit = async (e) => {
    e.preventDefault()
    const title = document.getElementById("task-name").value.trim()
    const creator = document.getElementById("task-creator").value.trim()
    const state = document.getElementById("task-state").value.trim()
    const desc = document.getElementById("task-desc").value.trim()
    const image = await (() => {
        const imageInput = document.getElementById("task-image")

        if (imageInput.files.length) {
            return new Promise((read, reject) => {
                const reader = new FileReader()
                try {
                    reader.readAsDataURL(imageInput.files[0]) 
                } catch (error) {
                    console.error(error);
                    reject()
                }
                
                reader.onload = () => {
                    read(reader.result)
                }
             })
        } else {
            console.log("no image");
            return undefined
        }
    })()

    const task = new Task(title, desc, image, state, creator)
    taskList.add(task.element)
    
    document.getElementById("form-reset").click()
    document.getElementById("task-image-preview").classList.add("hidden")
}

const taskList = new TaskList()
document.getElementById("tasks").appendChild(taskList.element)

function saveTasks() {
    const id = Task.id
    const taskJSON = JSON.stringify(Task.tasks)
    localStorage.setItem("id", id)
    localStorage.setItem("tasks", taskJSON)
}

// function getTasks() {
//     return (()=>{
//         const tasks = []
//         for (const task of JSON.parse(localStorage.getItem("tasks"))) {
//             tasks.push(Task.fromJSON(task))
//         }
//         return tasks
//     })()
// }
