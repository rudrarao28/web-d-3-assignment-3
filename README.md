**Project name:**  Inventory Management System
Name - Rudra Pratap Singh
Roll No - 2501730451


## Main features

- Add, view, edit and delete inventory products
- Store SKU, category, price, quantity, supplier and storage location
- Search products by name, SKU or description
- Filter by category, supplier, location, price range and stock status
- Paginate and sort product records
- Increase or decrease stock with quantity validation
- Generate low-stock and category-wise reports
- View dashboard totals for products, units, inventory value and stock alerts

## Technology stack

- Backend: Node.js and Express.js
- Database: MongoDB
- ODM: Mongoose
- Configuration: dotenv

## Requirements

- Node.js 18 or later
- MongoDB Community Server or MongoDB Atlas
- npm

## Installation and execution

1. Extract the ZIP and open the project folder in VS Code.
2. Install packages:

   ```bash
   npm install
   ```

3. Create a `.env` file by copying `.env.example`.
4. Set `MONGO_URI` to your MongoDB connection string.
5. Start the server:

   ```bash
   npm start
   ```

   For development:

   ```bash
   npm run dev
   ```

The API will run at `http://localhost:5000`.

## API endpoints

Base URL: `http://localhost:5000/api/products`

| Method | Endpoint | Description |
|---|---|---|
| POST | `/` | Add a product to inventory |
| GET | `/` | Get inventory list |
| GET | `/:id` | Get one product |
| PUT | `/:id` | Update product details |
| DELETE | `/:id` | Delete a product |
| PATCH | `/:id/stock` | Adjust stock quantity |
| GET | `/low-stock` | List products at/below reorder level |
| GET | `/summary` | Category-wise inventory summary |
| GET | `/dashboard` | Overall inventory dashboard totals |

### Useful list filters

The `GET /api/products` endpoint accepts:

- `search`: matches product name, SKU or description
- `category`, `supplier`, `location`
- `minPrice`, `maxPrice`
- `stockStatus`: `available`, `low` or `out`
- `page`, `limit`
- `sort`: `name`, `price`, `quantity`, `category`, `createdAt` or `updatedAt` (prefix with `-` for descending order)

### Example: create a product

Send a `POST` request to `/api/products` with JSON:

```json
{
  "name": "Wireless Mouse",
  "sku": "SS-1001",
  "category": "Computer Accessories",
  "description": "Optical wireless mouse",
  "price": 650,
  "quantity": 40,
  "reorderLevel": 8,
  "supplier": "Tech Supplies",
  "location": "Shelf A-2",
  "unit": "piece"
}
```

### Example: adjust stock

Send a `PATCH` request to `/api/products/<product-id>/stock`:

```json
{
  "change": 10
}
```

Use a positive number to add stock and a negative number to record stock issued or sold. The API prevents stock from becoming negative.

## Project structure

```text
store-inventory-management-system/
├── config/
│   └── db.js
├── controllers/
│   └── productController.js
├── middleware/
│   ├── errorHandler.js
│   └── validateObjectId.js
├── models/
│   └── Product.js
├── routes/
│   └── productRoutes.js
├── screenshots/
├── .env.example
├── .gitignore
├── package.json
├── package-lock.json
└── server.js
```

