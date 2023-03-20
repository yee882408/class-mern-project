const router = require("express").Router();
const registerValidation = require("../validation").registerValidation;
const loginValidation = require("../validation").loginValidation;
const User = require("../models").user;
const jwt = require("jsonwebtoken");

router.use((req, res, next) => {
  console.log("auth...");
  next();
});

router.get("/testAPI", (req, res) => {
  return res.send("成功連結auth");
});

router.post("/register", async (req, res) => {
  // 檢查輸入格式是否正確
  const { error } = registerValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // 檢查信箱是否註冊過
  const emailExist = await User.findOne({ email: req.body.email });
  if (emailExist) return res.status(400).send("此信箱已被註冊過囉!!");

  // 創建使用者資訊
  let { email, username, password, role } = req.body;
  let newUser = new User({ email, username, password, role });

  try {
    let savedUser = await newUser.save();
    return res.send({
      msg: "成功創建新帳號",
      savedUser,
    });
  } catch (e) {
    return res.status(500).send("無法創建新帳號");
  }
});

router.post("/login", async (req, res) => {
  // 檢查輸入格式是否正確
  const { error } = loginValidation(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  // 檢查信箱是否註冊過
  const foundUser = await User.findOne({ email: req.body.email });
  if (!foundUser)
    return res.status(401).send("無法找到此使用者，請確認信箱是否填寫正確!!");

  foundUser.comparePassword(req.body.password, (err, isMatch) => {
    if (err) return res.status(500).send(err);

    if (isMatch) {
      // 製作 JWT
      const tokenObj = { _id: foundUser._id, email: foundUser.email };
      const token = jwt.sign(tokenObj, process.env.PASSPORT_SECRET);
      return res.send({
        message: "成功登入",
        token: "JWT " + token,
        user: foundUser,
      });
    } else {
      return res.status(401).send("密碼錯誤");
    }
  });
});

module.exports = router;
