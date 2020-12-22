const express = require('express');
const methodOverride = require('method-override');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const app = express();

//APP OPTIONS
app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(methodOverride('_method'));

//DATA MODEL
const { Schema } = mongoose;
const ToDoItem = mongoose.model('ToDoItem', new Schema({
    title:  {
        type: String,
    },
    isComplete: {
        type: Boolean,
        default: false,
    },
}));

//MIDDLWARES & ROUTES
app.use(function (req, res, next) {
    console.log('METHOD: ', req.method);
    console.log('REQUEST: ', req.body);
    next();
});

app.get('/', async function (req, res) {
    res.render('index', {
        items: await ToDoItem.find({}).sort({_id: 'desc'}),
    });
});

app.post('/', async function (req, res) {
    await ToDoItem.create({
        title:  req.body.item,
        isComplete: false,
    });
    res.redirect('/');
});

app.patch('/', async function (req, res) {
    const item = await ToDoItem.findOne({_id: req.body.id});
    item.isComplete = !item.isComplete;
    await item.save();
    res.redirect('/');
});

app.delete('/', async function (req, res) {
    await ToDoItem.findOneAndDelete({_id: req.body.id});
    res.redirect('/');
});

app.use(function (req, res) {
    res.status(404).send('Not Found');
});

//CONNECTION TO DATA BASE
connectToDataBase()
    .on('error', console.log)
    .on('disconnected', connectToDataBase)
    .once('open', function () {
        app.listen(process.env.PORT || 3000, function() {
            console.log('ToDo App listening');
        });
    });

function connectToDataBase() {
    mongoose.connect(
        'mongodb+srv://kulakov:1@cluster0.pnfnf.mongodb.net/todo-list-tutorial-training?retryWrites=true&w=majority',
        {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            useFindAndModify: false,
        });
    return mongoose.connection;
}