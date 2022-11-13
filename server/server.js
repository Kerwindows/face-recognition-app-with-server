const express = require("express");
const cors = require("cors");
const bcrypt = require("bcrypt");
const saltRounds = 10;
const knex = require("knex");
const db = knex({
  client: "pg",
  connection: {
    host: "localhost",
    user: "postgres",
    password: "",
    database: "smart-brain",
  },
});

// db.select("*")
//   .from("users")
//   .then((data) => {
//     console.log(data);
//   });

const app = express();
//app.use(express.urlencoded({ extended: false }));
app.use(express.json()); //<-- this is necessary when sending json post data
app.use(cors());
//DATABASE
const database = {
  users: [
    {
      id: "123",
      name: "Kerwin",
      email: "kerwindows@gmail.com",
      password: "puppies",
      entries: 0,
      joinded: new Date(),
    },
    {
      id: "124",
      name: "ben",
      email: "kerwindows@gmail.com",
      password: "puppies",
      entries: 0,
      joinded: new Date(),
    },
  ],
};

app.get("/", (req, res) => {
  //res.send("Homepage");
  res.send(database.users);
});

app.post("/signin", (req, res) => {
  //   // Load hash from your password DB.
  //   bcrypt.compare(myPlaintextPassword, hash, function (err, result) {
  //     // result == true
  //   });
  //   bcrypt.compare(someOtherPlaintextPassword, hash, function (err, result) {
  //     // result == false
  //   });
  // if (
  //   req.body.email == database.users[0].email &&
  //   req.body.password == database.users[0].password
  // ) {
  //   //res.send("signing in"); json is used instead of send
  //   res.json(database.users[0]);
  // } else {
  //   res.status(400).json("email and/or password do not");
  // }
  db.select("email", "hash")
    .from("login")
    .where("email", "=", req.body.email)
    .then((data) => {
      const isValid = bcrypt.compareSync(req.body.password, data[0].hash);
      if (isValid) {
        return db
          .select("*")
          .from("users")
          .where("email", "=", req.body.email)
          .then((user) => {
            res.json(user[0]);
          })
          .catch((err) => res.status(400).json("Unable to get user"));
      } else {
        res.status(400).jsonp("Wrong credentials");
      }
    })
    .catch((err) => res.status(400).json("Wrong credentials"));
});

app.post("/register", (req, res) => {
  const { email, name, password } = req.body;
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  // bcrypt.hash(password, saltRounds, function (err, hash) {
  //   const hashedPassword = hash;
  // });

  // database.users.push({
  //   id: "345",
  //   name: name,
  //   email: email,
  //   password: password,
  //   entries: 0,
  //   joined: new Date(),
  // }); //used to push users to the static array
  db.transaction((trx) => {
    trx
      .insert({
        hash: hashedPassword,
        email: email,
      })
      .into("login")
      .returning("email")
      .then((loginEmail) => {
        return trx("users")
          .returning("*")
          .insert({
            name: name,
            email: loginEmail[0].email,
            joined: new Date(),
          })
          .then((user) => {
            //res.json(database.users[database.users.length - 1]);
            //res.json(response);
            res.json(user[0]);
          });
      })
      .then(trx.commit)
      .catch(trx.rollback);
  }).catch((err) => res.status(400).json("Unable to register"));
});

app.get("/profile/:id", (req, res) => {
  const { id } = req.params;
  db.select("*")
    .from("users")
    .where({
      id: id,
    })
    .then((user) => {
      //console.log(user[0]);
      if (user.length) {
        res.json(user[0]);
      } else {
        res.status(404).json("no such user");
      }
    })
    .catch((err) => {
      res.status(404).json("error getting user");
    });
  // database.users.forEach((user) => {
  //   if (user.id === id) {
  //     found = true;
  //     return res.json(user);
  //   }
  // });//use for each when using a static datbase
});

app.put("/image", (req, res) => {
  const { id } = req.body;

  db("users")
    .where("id", "=", id)
    .increment({
      entries: "1",
    })
    .returning("entries")
    .then((entries) => {
      console.log("entries[0]", entries[0]); //entries[0] returns and array
      res.json(entries[0].entries);
    })
    .catch((err) => {
      res.status(400).json("Unable to get entries");
    });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`);
});
