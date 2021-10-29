import { Router, Request, Response, NextFunction } from 'express';
import HttpStatus from 'http-status-codes';
import { productOptionModel, ProductOptionModel } from '@/models/product-option';
import { ProductModel, productModel } from '@/models/product';
import { validateBody, validateParams } from '@/middlewares/request';
import schema from './schema/product-option';
import productSchema from './schema/product';
import { v4 as uuid } from 'uuid';
import { errorCodes } from '@/constants';
import Joi from '@hapi/joi';
import { ProductOption } from '@/types/shared';
import { ConflictError, NotFoundError } from '@/helper/errors';

const router = Router({ mergeParams: true });

/**
 * parse raw data from model
 * @param data Raw data from model
 * @returns a product option
 */
const parseProductOption = (data: ProductOptionModel): ProductOption => {
  const { Id, Name, Description }: ProductOption = data;
  return { Id, Name, Description };
};

/**
 * finds all product options for a specified product.
 */
router.get(
  '/',
  validateParams(
    Joi.object().keys({
      productId: productSchema.Id.required(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId } = req.params;
      const productOptions = await productOptionModel.find({ ProductId: productId });
      res.status(HttpStatus.OK).json({ Items: productOptions.map((p) => parseProductOption(p)) });
    } catch (error) {
      next(error);
    }
  },
);

/**
 * finds the specified product option for the specified product. Id is a GUID(uuidv4)
 */
router.get(
  '/:productOptionId',
  validateParams(
    Joi.object().keys({
      productId: productSchema.Id.required(),
      productOptionId: schema.Id.required(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productId, productOptionId } = req.params;
      const productOption: ProductOptionModel | null = await productOptionModel.findOne({
        Id: productOptionId,
        ProductId: productId,
      });
      if (productOption === null) {
        next(new NotFoundError(`Product Option with Id: ${productOptionId} does not exist!`));
        return;
      }
      res.status(HttpStatus.OK).json(parseProductOption(productOption));
    } catch (error) {
      next(error);
    }
  },
);

/**
 * adds a new product option to the specified product
 */
router.post(
  '/',
  validateParams(
    Joi.object().keys({
      productId: productSchema.Id,
    }),
  ),
  validateBody(
    Joi.object().keys({
      Name: schema.Name.required(),
      Description: schema.Description.required(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = uuid();
      const { productId } = req.params;
      const product: ProductModel | null = await productModel.findOne({ Id: productId });
      if (product === null) {
        next(new NotFoundError(`Product ID:  ${productId} does not exist!`));
        return;
      }
      const productOption = new productOptionModel({ Id: id, ProductId: product.Id, ...req.body });
      await productOption.save();
      res.status(HttpStatus.CREATED).json(parseProductOption(productOption));
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
 * update the specified product option. Id is a GUID(uuidv4)
 */
router.put(
  '/:productOptionId',
  validateBody(
    Joi.object().keys({
      Name: schema.Name,
      Description: schema.Description,
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productOptionId } = req.params;
      const update = req.body;
      const updatedProductOption: ProductOptionModel | null = await productOptionModel.findOneAndUpdate(
        { Id: productOptionId },
        update,
        { new: true },
      );
      if (updatedProductOption === null) {
        next(new NotFoundError(`Product Option with Id: ${productOptionId} does not exist!`));
        return;
      }
      res.status(HttpStatus.OK).json(parseProductOption(updatedProductOption));
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
 * deletes the specified product
 */
router.delete(
  '/:productOptionId',
  validateParams(
    Joi.object().keys({
      productId: productSchema.Id.required(),
      productOptionId: schema.Id.required(),
    }),
  ),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { productOptionId } = req.params;
      const deletedProductOption = await productOptionModel.findOneAndDelete({ Id: productOptionId });
      if (deletedProductOption === null) {
        next(new NotFoundError(`No Product Option found with Id: ${productOptionId}`));
        return;
      }
      res.status(HttpStatus.NO_CONTENT).end();
    } catch (error) {
      next(error);
    }
  },
);

export default router;
