const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Product name is required"], trim: true, minlength: 2, maxlength: 100 },
    sku: { type: String, required: [true, "SKU is required"], unique: true, uppercase: true, trim: true },
    category: { type: String, required: [true, "Category is required"], trim: true },
    description: { type: String, trim: true, maxlength: 500, default: "" },
    price: { type: Number, required: [true, "Price is required"], min: [0, "Price cannot be negative"] },
    quantity: { type: Number, required: [true, "Quantity is required"], min: [0, "Quantity cannot be negative"], validate: { validator: Number.isInteger, message: "Quantity must be an integer" } },
    reorderLevel: { type: Number, default: 10, min: 0, validate: { validator: Number.isInteger, message: "Reorder level must be an integer" } },
    supplier: { type: String, trim: true, default: "Not specified" },
    location: { type: String, trim: true, default: "Main Store" },
    unit: { type: String, trim: true, default: "piece" },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual("stockValue").get(function () {
  return this.price * this.quantity;
});

productSchema.virtual("stockStatus").get(function () {
  if (this.quantity === 0) return "Out of Stock";
  if (this.quantity <= this.reorderLevel) return "Low Stock";
  return "In Stock";
});

module.exports = mongoose.model("Product", productSchema);
