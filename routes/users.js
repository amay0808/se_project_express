const router = require("express").Router();
const { getUser } = require("../controllers/users");

router.get("/:userId", getUser);

module.exports = router;
