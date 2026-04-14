import express from 'express';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Import routes (placeholder - will be implemented)
// import taskRoutes from './routes/tasks';

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes (placeholder)
// app.use('/api/v1/tasks', taskRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Not Found' });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
