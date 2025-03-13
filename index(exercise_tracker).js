const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const mongoose = require("mongoose");
mongoose.connect(process.env.MONGO_URI);
const Schema = mongoose.Schema;
const bodyParser = require("body-parser");

const User = mongoose.model("User", new Schema({username: String}), "users");
const Exercise = mongoose.model("Exercise", new Schema({username: String, description: String, duration: Number, date: String}), "exercises");
const Log = mongoose.model("Log", new Schema({username: String, count: Number, _id: String, log: [Object]}), "logs");

app.use(bodyParser.urlencoded({extended: false}));
app.use(cors())
app.use(express.static('public'))
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

app.post("/api/users", async (req, res) => {
  const userFound = await User.findOne({username: req.body.username})
  if(userFound) {
    res.json({username: userFound.username, _id: userFound._id});
  } else {
   const newUser = await User.create({username: req.body.username});
   await Log.create({username: newUser.username, count: 0, _id: newUser._id, log: []});
   res.json({username: newUser.username, _id: newUser._id});
  }
});

app.get("/api/users", async (req, res) => {
  const users = await User.find();
  res.json(users);
});

app.post("/api/users/:id/exercises", async (req, res) => {
  const user = await User.findOne({_id: req.params.id});
  const date = req.body.date ? new Date(req.body.date).toDateString() : new Date().toDateString();
  if(user) {
    const newExercise = await Exercise.create({username: user.username, description: req.body.description, duration: Number(req.body.duration), date: date});
    const log = await Log.findOne({_id: req.params.id});
    log.log.push({description: req.body.description, duration: Number(req.body.duration), date: date});
    log.count++;
    await log.save();
    res.json({username: user.username, description: req.body.description, duration: Number(req.body.duration), date: date, _id: user._id});
  } else {
    res.json({error: "user not found"});
  }
});

app.get("/api/users/:id/logs", async (req, res) => {
  const log = await Log.findOne({_id: req.params.id});
  let logArr = log.log
  if(req.query.from && req.query.to) {
    logArr = log.log.filter(log => new Date(log.date) >= new Date(req.query.from) && new Date(log.date) <= new Date(req.query.to));
  } else if (req.query.from) {
    logArr = log.log.filter(log => new Date(log.date) >= new Date(req.query.from));
  } else if (req.query.to) {
    logArr = log.log.filter(log => new Date(log.date) <= new Date(req.query.to));
  }
  if(req.query.limit) {
    logArr = logArr.slice(0, Number(req.query.limit));
  }
  res.json({username: log.username, count: log.count, _id: req.params.id, log: logArr});
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
})
