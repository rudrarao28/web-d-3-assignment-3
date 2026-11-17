const router = require("express").Router();
const controller = require("../controllers/productController");
const validateObjectId = require("../middleware/validateObjectId");

router.get("/dashboard", controller.getDashboard);
router.get("/low-stock", controller.getLowStock);
router.get("/summary", controller.getSummary);

router.route("/")
  .post(controller.createProduct)
  .get(controller.getProducts);

router.route("/:id")
  .all(validateObjectId)
  .get(controller.getProduct)
  .put(controller.updateProduct)
  .delete(controller.deleteProduct);

router.patch("/:id/stock", validateObjectId, controller.adjustStock);

module.exports = router;
