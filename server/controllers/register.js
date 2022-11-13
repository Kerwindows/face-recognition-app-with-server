const handleRegister = (req, res, db, bcrypt) => {
  const { email, name, password } = req.body;
  if (!email || !name || !password) {
    return res.status(400).json("Incorrect form submission");
  }
  const hashedPassword = bcrypt.hashSync(password, saltRounds);

  // bcrypt.hash(password, saltRounds, function (err, hash) {
  //   const hashedPassword = hash;
  // });

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
};

module.exports = {
  handleRegister,
};
