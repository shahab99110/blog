const db = require('../service/mongo');


async function postSignUp(enteredName, enteredUserName, enteredEmail, enteredPassword){
    
  const hashPassword = await bcrypt.hash(enteredPassword, 12);

  const user = {
    name: enteredName,
    userName: enteredUserName,
    email: enteredEmail,
    password: hashPassword,
  };

  await db.getDb().collection("users").insertOne(user);
  return;
}


async function existingUser(enteredEmail){
return await db
.getDb()
.collection("users")
.findOne({ email: enteredEmail });
}

async function existingUserName(enteredUserName){
    return await db
    .getDb()
    .collection("users")
    .findOne({ userName: enteredUserName });
}


module.exports = {
    postSignUp,
    existingUser,
    existingUserName,
}