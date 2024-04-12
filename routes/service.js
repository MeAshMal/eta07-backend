const router = require("express").Router();

const {
  getServices,
  createService,
  getService,
} = require("../controllers/service");

router.get("/all", getServices);
router.post("/new", createService);
router.get("/:id", getService);

module.exports = router;
