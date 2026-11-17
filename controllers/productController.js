const Product = require("../models/Product");

const httpError = (status, message) => Object.assign(new Error(message), { status });
const wrap = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
const escape = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

exports.createProduct = wrap(async (req, res) => {
  const product = await Product.create(req.body);
  res.status(201).json({ message: "Inventory item created successfully", product });
});

exports.getProducts = wrap(async (req, res) => {
  const { category, supplier, search, minPrice, maxPrice, inStock, stockStatus, location, sort } = req.query;
  const filter = {};

  if (category) filter.category = new RegExp(`^${escape(category)}$`, "i");
  if (supplier) filter.supplier = new RegExp(escape(supplier), "i");
  if (location) filter.location = new RegExp(escape(location), "i");
  if (search) {
    const term = new RegExp(escape(search), "i");
    filter.$or = [{ name: term }, { sku: term }, { description: term }];
  }
  if (minPrice !== undefined || maxPrice !== undefined) {
    filter.price = {};
    if (minPrice !== undefined) filter.price.$gte = Number(minPrice);
    if (maxPrice !== undefined) filter.price.$lte = Number(maxPrice);
  }

  if (stockStatus === "out") filter.quantity = 0;
  else if (stockStatus === "low") filter.$expr = { $and: [{ $gt: ["$quantity", 0] }, { $lte: ["$quantity", "$reorderLevel"] }] };
  else if (stockStatus === "available" || inStock === "true") filter.quantity = { $gt: 0 };

  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
  const allowedSortFields = ["name", "price", "quantity", "category", "createdAt", "updatedAt"];
  const sortField = sort && allowedSortFields.includes(sort.replace(/^-/, "")) ? sort : "-createdAt";

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter).sort(sortField).skip((page - 1) * limit).limit(limit),
  ]);

  res.json({
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
    count: products.length,
    products,
  });
});

exports.getProduct = wrap(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) throw httpError(404, "Inventory item not found");
  res.json(product);
});

exports.updateProduct = wrap(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!product) throw httpError(404, "Inventory item not found");
  res.json({ message: "Inventory item updated successfully", product });
});

exports.adjustStock = wrap(async (req, res) => {
  const { change } = req.body;
  if (!Number.isInteger(change) || change === 0) {
    throw httpError(400, "'change' must be a non-zero integer");
  }

  const filter = { _id: req.params.id };
  if (change < 0) filter.quantity = { $gte: -change };

  const product = await Product.findOneAndUpdate(
    filter,
    { $inc: { quantity: change } },
    { new: true, runValidators: true }
  );

  if (!product) {
    const exists = await Product.exists({ _id: req.params.id });
    throw exists ? httpError(400, "Insufficient stock for this adjustment") : httpError(404, "Inventory item not found");
  }

  res.json({ message: "Stock quantity adjusted successfully", product });
});

exports.deleteProduct = wrap(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id);
  if (!product) throw httpError(404, "Inventory item not found");
  res.json({ message: "Inventory item deleted successfully", id: product.id });
});

exports.getLowStock = wrap(async (req, res) => {
  const lowStockItems = await Product.find({
    $expr: { $lte: ["$quantity", "$reorderLevel"] },
  }).sort({ quantity: 1, name: 1 });

  res.json({ count: lowStockItems.length, lowStockItems });
});

exports.getSummary = wrap(async (req, res) => {
  const summary = await Product.aggregate([
    {
      $group: {
        _id: "$category",
        totalProducts: { $sum: 1 },
        totalQuantity: { $sum: "$quantity" },
        totalStockValue: { $sum: { $multiply: ["$price", "$quantity"] } },
        averagePrice: { $avg: "$price" },
      },
    },
    { $sort: { totalStockValue: -1 } },
  ]);

  res.json({ categoryCount: summary.length, summary });
});

exports.getDashboard = wrap(async (req, res) => {
  const [totals] = await Product.aggregate([
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        totalUnits: { $sum: "$quantity" },
        inventoryValue: { $sum: { $multiply: ["$price", "$quantity"] } },
        lowStockCount: {
          $sum: { $cond: [{ $lte: ["$quantity", "$reorderLevel"] }, 1, 0] },
        },
        outOfStockCount: {
          $sum: { $cond: [{ $eq: ["$quantity", 0] }, 1, 0] },
        },
      },
    },
  ]);

  res.json(totals || {
    totalProducts: 0,
    totalUnits: 0,
    inventoryValue: 0,
    lowStockCount: 0,
    outOfStockCount: 0,
  });
});
