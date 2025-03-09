require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const dns = require("dns");

app.use(cors());

mongoose.connect(process.env.MONGO_URI);
const Schema = mongoose.Schema;
console.log("Connected to MongoDB");

let ShortURL = mongoose.model("ShortURL", new Schema({
  "url": {type: String, required: true},
  "shortUrl": {type: Number, required: true}
}, {"collection": "URLs"}))

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({extended: false}))

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/shorturl/:URL', async (req, res) => {
  if (!/[0-9]+/.test(req.params.URL)) {
    res.json({error: "invalid url"});
  } else {
    let url = await ShortURL.findOne({shortUrl: req.params.URL});
    if (url) {
      console.log(url.url);
      res.redirect(url.url);
    } else {
      res.json({error: "invalid url"});
    }
  }
});

app.post("/api/shorturl", async (req, res) => {
  if (/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/.test(req.body.url)) {
    let doc = await ShortURL.findOne({url: req.body.url}) 
    if (doc) {
      res.json({original_url: doc.url, short_url: doc.shortUrl});
    } else {
      let count = await ShortURL.countDocuments({}) + 1;
      console.log(count);
      ShortURL.create({url: req.body.url, shortUrl: count});
      res.json({original_url: req.body.url, short_url: count});
    }
  } else {
    res.json({"error": "invalid url"});
  }
})

app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});
