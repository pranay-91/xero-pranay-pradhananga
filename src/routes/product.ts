import { Router, Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status-codes';
import { productModel, ProductModel } from '@/models/product';
import { errorCodes } from '@/constants';
import { v4 as uuid } from 'uuid';
import { validateBody, validateParams, validateQuery } from '@/middlewares/request';
import { NotFoundError, ConflictError } from '@/helper/errors';
import schema from './schema/product';
import Joi from '@hapi/joi';
import { Product } from '@/types/shared';
import { productOptionModel } from '@/models/product-option';

const router = Router();

/** parse raw data from model
 * @param data raw data from model
 * @returns a product
 */
const parseProduct = (data: ProductModel): Product => {
  const { Id, Name, Description, Price, DeliveryPrice }: Product = data;
  return { Id, Name, Description, Price, DeliveryPrice };
};

/**
 * get all products
 */
router.get(
  '/',
  validateQuery(
    Joi.object().keys({
      name: schema.Name,
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { name, ...filter } = req.query;
      if (name) {
        filter['Name'] = name;
      }
      const products = await productModel.find(filter);
      res.status(HttpStatus.OK).json({ Items: products.map((p) => parseProduct(p)) });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * get a product by Id. Id is a GUID(uuidv4)
 */
router.get(
  '/:productId',
  validateParams(
    Joi.object().keys({
      productId: schema.Id.required(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const product = await productModel.findOne({ Id: productId });
      if (product === null) {
        next(new NotFoundError(`No Product found with id: ${productId}`));
        return;
      }
      res.status(HttpStatus.OK).json(parseProduct(product));
    } catch (error) {
      next(error);
    }
  },
);

/**
 * create a product
 */
router.post(
  '/',
  validateBody(
    Joi.object().keys({
      Name: schema.Name.required(),
      Description: schema.Description.required(),
      Price: schema.Price.required(),
      DeliveryPrice: schema.DeliveryPrice.required(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = uuid();
      const product = new productModel({ Id: id, ...req.body });
      await product.save();
      res.status(HttpStatus.CREATED).json(parseProduct(product));
    } catch (error: any) {
      if (error.code === errorCodes.duplicateKeyError) {
        next(new ConflictError(error.message));
        return;
      }
      next(error);
    }
  },
);

/**
 * update a product by Id
 */
router.put(
  '/:productId',
  validateBody(
    Joi.object().keys({
      Name: schema.Name.required(),
      Description: schema.Name,
      Price: schema.Price,
      DeliveryPrice: schema.DeliveryPrice,
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const update = req.body;
      const updatedProduct = await productModel.findOneAndUpdate({ Id: productId }, update, { new: true });
      if (updatedProduct === null) {
        next(new NotFoundError(`No Product found with id: ${productId}`));
        return;
      }
      res.status(HttpStatus.OK).json(parseProduct(updatedProduct));
    } catch (error) {
      next(error);
    }
  },
);

/**
 *  deletes a product by Id and its options. Id is a GUID(uuidv4)
 */
router.delete(
  '/:productId',
  validateParams(
    Joi.object().keys({
      productId: schema.Id.required(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const deletedProduct = await productModel.findOneAndDelete({ Id: productId });
      if (deletedProduct === null) {
        next(new NotFoundError(`No Product found with Id: ${productId}`));
        return;
      }
      await productOptionModel.deleteMany({ productId: productId });
      res.status(HttpStatus.NO_CONTENT).end();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
