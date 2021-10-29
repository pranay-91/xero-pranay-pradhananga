import { Router, Request, Response } from 'express';
import productRouter from './product';
import productOptionRouter from '@/routes/product-option';
import HttpStatus from 'http-status-codes';

const routes = Router();

// Endpoint for health check.
routes.get('/healthz', (req: Request, res: Response) => {
  res.status(HttpStatus.OK).json();
});

// Product Endpoint
routes.use('/products', productRouter);

// Product Option Endpoint
routes.use('/products/:productId/options', productOptionRouter);

export default routes;
