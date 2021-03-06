require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const { createClient } = require("redis");
const helmet = require("helmet");
const morgan = require("morgan");
const Joi = require("joi");
const cors = require("cors");

const app = express();
app.use(helmet());
app.use(morgan("dev"));
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5002;
const redisClient = createClient();

app.get("/", async (req, res) => {
  if (!redisClient.isOpen) {
    await redisClient.connect();
  }

  let dataCached = await redisClient.get("significados");

  if (!dataCached) {
    await mongoose.connect(
      `mongodb+srv://${process.env.ACCOUNT}:${process.env.PASSWORD}@apicluster.5xlor.mongodb.net/Gaules?retryWrites=true&w=majority`,
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );

    const client = await mongoose.connection;
    const data = await client.collection("significados").find({}).toArray();

    await redisClient.setEx("significados", 60, JSON.stringify(data));

    return res.json(data);
  } else {
    return res.json(JSON.parse(dataCached));
  }
});

app.post("/add", async (req, res) => {
  await mongoose.connect(
    `mongodb+srv://${process.env.ACCOUNT}:${process.env.PASSWORD}@apicluster.5xlor.mongodb.net/Gaules?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  const client = await mongoose.connection;

  const schema = Joi.object({
    word: Joi.string().required(),
    meaning: Joi.string().required(),
  });

  try {
    const value = await schema.validateAsync({
      word: req.body.word.toLowerCase(),
      meaning: req.body.meaning,
    });

    const data = await client.collection("significados").insertOne(value);

    return res.status(201).json({ message: "item created successfuly" });
  } catch (err) {
    return res.status(400).send(err);
  }

  //
});

app.get("/:word", async (req, res) => {
  const word = req.params.word;

  await mongoose.connect(
    `mongodb+srv://${process.env.ACCOUNT}:${process.env.PASSWORD}@apicluster.5xlor.mongodb.net/Gaules?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  );

  const client = await mongoose.connection;

  let data = await client
    .collection("significados")
    .find({ word: { $regex: word } })
    .toArray();
  console.log(data);

  // let data = await client
  //   .collection("significados")
  //   .findOne({ word: { $regex: word } });
  // console.log(data);

  // if (data) {
  //   data = capitalize(data);
  // }

  return res.status(200).json(data);
});

function capitalize(s) {
  return {
    _id: s._id,
    word: s.word[0].toUpperCase() + s.word.slice(1),
    meaning: s.meaning,
  };
}

app.listen(PORT, () => console.log(`server connect`));
