import { Document, Schema } from 'mongoose';
import { dbConnection } from '@/connection';
import { ProductOption } from '@/types/shared';

export type ProductOptionModel = Document & ProductOption;

export const ProductOptionSchema = new Schema({
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
  ProductId: {
    type: Schema.Types.String,
    ref: 'Product', // Reference to releate Product by Id
  },
});

// Index of sort order ascending
ProductOptionSchema.index({
  Id: 1,
  ProductId: 1,
});

export const productOptionModel = dbConnection.model<ProductOptionModel>(
  'ProductOption',
  ProductOptionSchema,
  'ProductOption',
);
