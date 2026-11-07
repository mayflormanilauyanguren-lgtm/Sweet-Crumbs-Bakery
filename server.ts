import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { getAllProducts, getProductById } from './src/db/products.ts';
import { getAllReviews, addReview } from './src/db/reviews.ts';
import { createOrder, getOrdersByUser, getOrderById } from './src/db/orders.ts';
import { getOrCreateUser, getUserProfile, updateUserProfile } from './src/db/users.ts';
import { saveContactMessage } from './src/db/contact.ts';
import { requireAuth, optionalAuth, AuthRequest } from './src/middleware/auth.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json({ limit: '10mb' }));

  // ================= API ROUTES =================

  // Products from Database
  app.get('/api/products', async (_req, res) => {
    try {
      const products = await getAllProducts();
      res.json(products);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      res.status(500).json({ error: 'Failed to retrieve products' });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const product = await getProductById(req.params.id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      res.json(product);
    } catch (error: any) {
      console.error('Error fetching product:', error);
      res.status(500).json({ error: 'Failed to retrieve product' });
    }
  });

  // Reviews from Database
  app.get('/api/reviews', async (_req, res) => {
    try {
      const reviews = await getAllReviews();
      res.json(reviews);
    } catch (error: any) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ error: 'Failed to retrieve reviews' });
    }
  });

  app.post('/api/reviews', async (req, res) => {
    try {
      const { name, rating, text } = req.body;
      if (!name || !rating || !text) {
        return res.status(400).json({ error: 'Name, rating, and review text are required' });
      }
      const newReview = await addReview(name, Number(rating), text);
      res.status(201).json(newReview);
    } catch (error: any) {
      console.error('Error adding review:', error);
      res.status(500).json({ error: 'Failed to submit review' });
    }
  });

  // User Profile (Authenticated)
  app.get('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const email = req.user!.email || '';
      const name = req.user!.name || '';
      const user = await getOrCreateUser(uid, email, name);
      res.json(user);
    } catch (error: any) {
      console.error('Error fetching user profile:', error);
      res.status(500).json({ error: 'Failed to fetch user profile' });
    }
  });

  app.put('/api/user/profile', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user!.uid;
      const { name, phone, address } = req.body;
      const updated = await updateUserProfile(uid, { name, phone, address });
      res.json(updated);
    } catch (error: any) {
      console.error('Error updating user profile:', error);
      res.status(500).json({ error: 'Failed to update user profile' });
    }
  });

  // Orders in Database
  app.post('/api/orders', optionalAuth, async (req: AuthRequest, res) => {
    try {
      const {
        id,
        customerName,
        customerEmail,
        customerPhone,
        deliveryMethod,
        address,
        paymentMethod,
        paymentReference,
        items,
        subtotal,
        deliveryFee,
        discount,
        total,
      } = req.body;

      if (!id || !customerName || !customerEmail || !items || !total) {
        return res.status(400).json({ error: 'Missing required order fields' });
      }

      const userUid = req.user?.uid || req.body.userUid || null;

      const order = await createOrder({
        id,
        userUid,
        customerName,
        customerEmail,
        customerPhone: customerPhone || '',
        deliveryMethod: deliveryMethod || 'delivery',
        address: address || '',
        paymentMethod: paymentMethod || 'cod',
        paymentReference: paymentReference || null,
        items,
        subtotal: Number(subtotal),
        deliveryFee: Number(deliveryFee),
        discount: Number(discount || 0),
        total: Number(total),
      });

      res.status(201).json(order);
    } catch (error: any) {
      console.error('Error saving order to database:', error);
      res.status(500).json({ error: 'Failed to create order' });
    }
  });

  app.get('/api/orders', requireAuth, async (req: AuthRequest, res) => {
    try {
      const userUid = req.user!.uid;
      const orders = await getOrdersByUser(userUid);
      res.json(orders);
    } catch (error: any) {
      console.error('Error fetching user orders:', error);
      res.status(500).json({ error: 'Failed to retrieve orders' });
    }
  });

  app.get('/api/orders/:id', async (req, res) => {
    try {
      const order = await getOrderById(req.params.id);
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      res.json(order);
    } catch (error: any) {
      console.error('Error fetching order:', error);
      res.status(500).json({ error: 'Failed to retrieve order' });
    }
  });

  // Contact Messages in Database
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Name, email, and message are required' });
      }
      const saved = await saveContactMessage(name, email, message);
      res.status(201).json({ success: true, message: 'Message received', id: saved.id });
    } catch (error: any) {
      console.error('Error saving contact message:', error);
      res.status(500).json({ error: 'Failed to send message' });
    }
  });

  // ================= VITE DEV / PRODUCTION MIDDLEWARE =================
  const isProduction = process.env.NODE_ENV === 'production';

  if (!isProduction) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
