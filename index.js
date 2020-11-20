const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const MongoClient = require("mongodb").MongoClient;
const ObjectId = require("mongodb").ObjectId;
require("dotenv").config();

const app = express();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.vpsgc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

app.use(cors());
app.use(bodyParser.json());
app.use(express.static("taskPics"));
app.use(fileUpload());

app.get("/", (req, res) => {
  res.send("Task Management");
});

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const taskCollection = client
    .db(process.env.DB_NAME)
    .collection("taskCollection");

  const submitTaskCollection = client
    .db(process.env.DB_NAME)
    .collection("submitTaskCollection");

  const taskScoreCollection = client
    .db(process.env.DB_NAME)
    .collection("taskScoreCollection");

  const registerCollection = client
    .db(process.env.DB_NAME)
    .collection("registerCollection");

  app.post("/createTask", (req, res) => {
    const file = req.files.file;
    const name = req.body.instructor_name;
    const email = req.body.instructor_email;
    const task_id = req.body.task_id;
    const task_name = req.body.task_name;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    taskCollection
      .insertOne({ name, email, task_id, task_name, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post("/submitTask", (req, res) => {
    const file = req.files.file;
    const name = req.body.student_name;
    const email = req.body.student_email;
    const task_id = req.body.task_id;
    const task_name = req.body.task_name;
    const description = req.body.description;
    const newImg = file.data;
    const encImg = newImg.toString("base64");

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, "base64"),
    };
    submitTaskCollection
      .insertOne({ name, email, task_id, task_name, description, image })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.post("/scoreTask", (req, res) => {
    const name = req.body.student_name;
    const email = req.body.student_email;
    const task_id = req.body.task_id;
    const task_name = req.body.task_name;
    const score = req.body.score;

    taskScoreCollection
      .insertOne({ name, email, task_id, task_name, score })
      .then((result) => {
        res.send(result.insertedCount > 0);
      });
  });

  app.get("/fullTaskList", (req, res) => {
    taskCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });

  app.get("/scoredTask", (req, res) => {
    taskScoreCollection
      .find({})
      .toArray((err, documents) => {
        res.send(documents);
      });
  }),
    app.get("/submittedTask", (req, res) => {
      submitTaskCollection.find({}).toArray((err, documents) => {
        res.send(documents);
      });
    });

  app.get("/my-task", (req, res) => {
    taskCollection
      .find({ email: req.query.email })
      .toArray((err, documents) => {
        res.send(documents);
      });
  });
  app.post("/registration", (req, res) => {
    let profession = req.body;
    registerCollection.insertOne(profession).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/registeredUser", (req, res) => {
    registerCollection.find({}).toArray((err, documents) => {
      res.send(documents);
    });
  });
  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminsCollection.find({ email: email })
        .toArray((err, admins) => {
            res.send(admins.length > 0);
        })
})
});

const port = process.env.PORT || 5000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
