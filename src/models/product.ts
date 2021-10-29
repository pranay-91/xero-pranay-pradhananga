import { Document, Schema } from 'mongoose';
import { dbConnection } from '@/connection';
import { Product } from '@/types/shared';

export type ProductModel = Document & Product;

export const ProductSchema = new Schema({
  Id: {
    type: Schema.Types.String,
    required: true,
  },
  Name: {
    type: Schema.Types.String,
    required: true,
  },
  Description: {
    type: Schema.Types.String,
    required: true,
  },
  Price: {
    type: Schema.Types.String,
    required: true,
  },
  DeliveryPrice: {
    type: Schema.Types.String,
    required: true,
  },
});

// Index of sort order ascending
ProductSchema.index({
  Id: 1,
});

export const productModel = dbConnection.model<ProductModel>('Product', ProductSchema, 'Product');
