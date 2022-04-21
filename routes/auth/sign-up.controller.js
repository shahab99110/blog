const {postSignUp,existingUser,existingUserName} = require('../../model/auth');


async function httpGetSignUp(req, res) {
  let sessioninputData = req.session.inputData;
  if (!sessioninputData) {
    sessioninputData = {
      hasError: false,
      name: "",
      userName: "",
      email: "",
    };
  }
  req.session.inputData = null;
  res.render("sign-up", { inputData: sessioninputData });
}

async function httpPostSignUp(req,res){
    const userData = req.body;
    const enteredName = userData.name;
    const enteredUserName = userData.userName;
    const enteredEmail = userData.email;
    const enteredPassword = userData.password;
    const enteredConfirmPassword = userData.confirmPassword;

    try{
        await validateFormField(enteredName, enteredUserName, enteredEmail, enteredPassword);
        await postSignUp(enteredName, enteredUserName, enteredEmail, enteredPassword);
    } catch(error){
        return res.json({
            message: 'something went wrong'
        })
    }


    res.redirect("sign-in");
}

async function validateFormField(enteredName, enteredUserName, enteredEmail, enteredPassword){

// if (
  //   !enteredEmail ||
  //   !enteredConfirmPassword ||
  //   !enteredPassword ||
  //   enteredPassword.trim().length < 6 ||
  //   enteredPassword !== enteredConfirmPassword ||
  //   !enteredEmail.includes("@")
  // ) {
  //   req.session.inputData = {
  //     hasError: true,
  //     message: "invalid input- please try again",
  //     name:enteredName,
  //     userName: enteredUserName,
  //     email: enteredEmail,

  //   };
  //   req.session.save(function () {
  //     console.log("Incorrect data");
  //     res.redirect("/sign-up");
  //   });
  //   return;
  // }

  const existingUser = await existingUser(enteredEmail);

  if (existingUser) {
    req.session.inputData = {
      hasError: true,
      message: "Email already in use",
      name: enteredName,
      userName: enteredUserName,
      email: enteredEmail,
    };
    req.session.save(function () {
      console.log("Email already in use");
      return res.redirect("sign-up");
    });
   
   const existingUserName = await existingUserName(enteredUserName); 

   if (existingUserUserName) {
    req.session.inputData = {
      hasError: true,
      message: "User Name already in use",
      name: enteredName,
      userName: enteredUserName,
      email: enteredEmail,
    };
    req.session.save(function () {
      console.log("User Name already in use");
      return res.redirect("sign-up");
    });
  }


  }
}


module.exports = {
    httpGetSignUp,
    httpPostSignUp,
}