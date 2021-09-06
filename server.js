// import cái express cái mình vừa cài vào để dùng
const express = require('express')
const API_GET_ALL = 'http://localhost:3000/api/all'

// const axios = require('axios')

// tạo 1 cái app
const app = express()
// để có thể truyền dc giá trị vào body trong request
const bodyparser = require('body-parser');
const urlencodedParser = app.use(bodyparser.urlencoded({extended:true}))

// set view engine
app.set('view engine', 'ejs')

// khởi tạo 1 router, tên là route (từ cái express mà mk cài từ lúc đầu) npm i express
// route: kiểu điều hướng
const route = express.Router();

// cài đặt cho app sử dụng cái route này
app.use('/', route);



// điều hướng cho url /, ra view home
// route.get('/', (req, res) => {
//     res.render('home')
// });

/**
 * ROUTES
 * @param req
 * @param res
 */
const axios = require('axios')
homeRoute = (req, res) => {
    // gọi đến 1 api request get all tasks
    axios.get(API_GET_ALL)
        .then(function (response) {
            res.render('home', {tasks: response.data})
        })
        .catch(err => {
            throw err
        })
}
route.get('/', homeRoute);

homeRouteWithErrorMsg = (req, res) => {
    // gọi đến 1 api request get all tasks
    axios.get(API_GET_ALL)
        .then(function (response) {
            res.render('home', {tasks: response.data, errorMsg: 'Task name is required'})
        })
        .catch(err => {
            throw err
        })
}
route.get('/name-is-required', homeRouteWithErrorMsg);





/**
 * Database
 */
// import cái mongo db vào
const mongoose = require('mongoose')
// link connect to mongo db
const mongoConnection = "mongodb+srv://root:a12345@cluster0.xgvet.mongodb.net/myFirstDatabase?retryWrites=true&w=majority"
// tạo method connectDB để connect tới database
const connectDB = async() => {
    try {
        const con = await mongoose.connect(mongoConnection)
        console.log('MongoDB connected: ' + con.connection.host);
    } catch(err) {
        console.log('MongoDB connection error: ' + err);
    }
}
// gọi hàm để nó chạy
connectDB();

// để import dùng các file trong thư mục css
app.use(express.static(__dirname + '/css'));

// create table in database
var schema = new mongoose.Schema({
    taskName: {
        type: String,
        required: true
    },
    isDone: {
        type: String,
        default: 'false'
    },
})
const taskDB = mongoose.model('taskDB', schema)

/**
 * CONTROLLER
 * @type {string|number}
 */
const createTask = (req, res) => {
    if (!req.body.taskName) {
        return res.redirect('/name-is-required')
    }
    if (!req.body) {
        res.status(400).send({message: "controller create: req.body is empty"})
    }
    const newTask = new taskDB({
        taskName: req.body.taskName
    })
    newTask
        .save(newTask)
        .then(data => {
            // res.send(data)
            return res.redirect('/')
        })
        .catch(err => {
            res.status(500).send('controller create: error save to dbs: ' + err);
        })
}

const getAllTasks = (req, res) => {
    taskDB.find()
        .then(data => {
            res.send(data)
        })
        .catch(err => {
            res.status(500).send('Controller getAllTasks: ' + err)
        })
}

const deleteTask = (req, res) => {
    console.log('delete: vao day chua')
    let idTask = req.params.id;
    console.log('delete: id task: ' + idTask)
    taskDB.findByIdAndRemove(idTask)
        .then(data => {
            if (!data) {
                res.status(404).send({message: "can not delete challenge with " + idTask + " maybe challenge not found"})
            } else {
                // res.send(data)
                // res.json(req.body)
                return res.redirect('/');
            }
        })
        .catch(err => {
            res.status(500).send({message: "delete: error while deleting challenge"})
        })

}

const updateTask = (req, res) => {
    console.log('update: vao day chua')
    let idTask = req.params.id;
    console.log('update: id task: ' + idTask)
    taskDB.findByIdAndUpdate(idTask, req.body)
        .then(data => {
            if (!data) {
                res.status(404).send({message: "can not update task with " + idTask + " maybe task not found"})
            } else {
                return res.redirect('/');
            }
        })
        .catch(err => {
            res.status(500).send({message: "update: error while deleting task"})
        })

}


/**
 * API
 * @type {string|number}
 */
route.post('/api/create', createTask);
route.get('/api/all', getAllTasks);
route.post('/api/delete/:id', deleteTask);
route.post('/api/update/:id', updateTask);



const port = process.env.PORT || 3000;

app.listen(port, () => {
    console.log('server running at port: ' + port)
})


