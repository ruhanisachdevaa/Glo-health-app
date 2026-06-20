import { Router } from "express";
import { db } from "@workspace/db";
import { productsTable, cartItemsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { GetProductParams, AddToCartBody, RemoveFromCartParams } from "@workspace/api-zod";

const router = Router();

router.get("/marketplace/products", async (req, res) => {
  try {
    const products = await db.select().from(productsTable).orderBy(productsTable.category);
    return res.json(products.map(p => ({ ...p, price: parseFloat(p.price) })));
  } catch (err) {
    req.log.error({ err }, "Failed to get products");
    return res.status(500).json({ error: "Failed to get products" });
  }
});

router.get("/marketplace/products/:id", async (req, res) => {
  try {
    const { id } = GetProductParams.parse({ id: parseInt(req.params.id) });
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, id));
    if (!product) return res.status(404).json({ error: "Not found" });
    return res.json({ ...product, price: parseFloat(product.price) });
  } catch (err) {
    req.log.error({ err }, "Failed to get product");
    return res.status(400).json({ error: "Invalid input" });
  }
});

router.get("/marketplace/cart", async (req, res) => {
  try {
    const cartItems = await db
      .select()
      .from(cartItemsTable)
      .leftJoin(productsTable, eq(cartItemsTable.productId, productsTable.id))
      .orderBy(desc(cartItemsTable.createdAt));
    
    return res.json(cartItems.map(row => ({
      ...row.cart_items,
      product: { ...row.products!, price: parseFloat(row.products!.price) },
    })));
  } catch (err) {
    req.log.error({ err }, "Failed to get cart");
    return res.status(500).json({ error: "Failed to get cart" });
  }
});

router.post("/marketplace/cart", async (req, res) => {
  try {
    const body = AddToCartBody.parse(req.body);
    const [item] = await db.insert(cartItemsTable).values(body).returning();
    const [product] = await db.select().from(productsTable).where(eq(productsTable.id, item.productId));
    return res.status(201).json({ ...item, product: { ...product, price: parseFloat(product.price) } });
  } catch (err) {
    req.log.error({ err }, "Failed to add to cart");
    return res.status(400).json({ error: "Invalid input" });
  }
});

router.delete("/marketplace/cart/:id", async (req, res) => {
  try {
    const { id } = RemoveFromCartParams.parse({ id: parseInt(req.params.id) });
    await db.delete(cartItemsTable).where(eq(cartItemsTable.id, id));
    return res.status(204).send();
  } catch (err) {
    req.log.error({ err }, "Failed to remove from cart");
    return res.status(400).json({ error: "Invalid input" });
  }
});

export default router;
