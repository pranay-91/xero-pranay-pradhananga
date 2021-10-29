import '../aliases';
import { expect } from 'chai';
import request from 'supertest';
import HttpStatus from 'http-status-codes';
import app from '@/app';
import { goodProduct, goodProductOption } from './fixtures';
import { productModel } from '@/models/product';

describe('functional - Product', () => {
  afterEach(async () => {
    await productModel.deleteMany();
  });

  it('should create a new product', async () => {
    const { Name, Description, Price, DeliveryPrice } = goodProduct;
    const body = { Name, Description, Price, DeliveryPrice };
    const res = await request(app).post('/products').send(body);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    expect(res.body.Name).to.deep.equal(goodProduct.Name);
    expect(res.body.Description).to.deep.equal(goodProduct.Description);
    expect(res.body.Price).to.deep.equal(goodProduct.Price);
    expect(res.body.DeliveryPrice).to.deep.equal(goodProduct.DeliveryPrice);
  });

  it('should get all products', async () => {
    const goodProducts = [
      {
        Name: 'Test Product name 1',
        Description: 'Test Product description 1',
        Price: '123.45',
        DeliveryPrice: '12.34',
      },
      {
        Name: 'Test Product name 2',
        Description: 'Test Product description 2',
        Price: '123.45',
        DeliveryPrice: '12.34',
      },
      {
        Name: 'Test Product name 3',
        Description: 'Test Product description 3',
        Price: '123.45',
        DeliveryPrice: '12.34',
      },
    ];

    await Promise.all(goodProducts.map(async (product) => await request(app).post(`/products`).send(product)));
    const res = await request(app).get('/products');
    expect(res.body.Items.length).to.equal(3);
  });

  it('should find all products with the specified name', async () => {
    const goodProducts = [
      {
        Name: 'Test Product name',
        Description: 'Test Product description 1',
        Price: '123.45',
        DeliveryPrice: '12.34',
      },
      {
        Name: 'Test Product name',
        Description: 'Test Product description 2',
        Price: '123.45',
        DeliveryPrice: '12.34',
      },
      {
        Name: 'Test Product name 3',
        Description: 'Test Product description 3',
        Price: '123.45',
        DeliveryPrice: '12.34',
      },
    ];

    await Promise.all(goodProducts.map(async (product) => await request(app).post(`/products`).send(product)));
    const res = await request(app).get('/products').query({ name: 'Test Product name' });
    expect(res.body.Items.length).to.equal(2);
  });

  it('should get the product that matches the specified ID - ID is a GUID. ', async () => {
    const { Name, Description, Price, DeliveryPrice } = goodProduct;
    const body = { Name, Description, Price, DeliveryPrice };
    let res = await request(app).post('/products').send(body);
    const productId = res.body.Id;
    res = await request(app).get(`/products/${productId}`);
    expect(res.body.Id).to.deep.equal(productId);
  });

  it('should throw a not found error if the product does not matches the specified ID - ID is a GUID. ', async () => {
    const { Name, Description, Price, DeliveryPrice } = goodProduct;
    const body = { Name, Description, Price, DeliveryPrice };
    await request(app).post('/products').send(body);
    const res = await request(app).get(`/products/${goodProduct.Id}`);
    expect(res.status).to.deep.equal(HttpStatus.NOT_FOUND);
  });

  it('should update a product with new properties', async () => {
    const { Name, Description, Price, DeliveryPrice } = goodProduct;
    let body = { Name, Description, Price, DeliveryPrice };
    const res = await request(app).post('/products').send(body);
    body = { ...body, Name: 'test2' };
    const res2 = await request(app).put(`/products/${res.body.Id}`).send(body);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    expect(res2.body.Name).to.deep.equal('test2');
  });

  it('should delete a product and its options', async () => {
    const { Name, Description, Price, DeliveryPrice } = goodProduct;
    const body = { Name, Description, Price, DeliveryPrice };
    let res = await request(app).post('/products').send(body);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    const productId = res.body.Id;
    const productOptionBody = {
      Name: goodProductOption.Name,
      Description: goodProductOption.Description,
    };
    res = await request(app).post(`/products/${productId}/options`).send(productOptionBody);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    const productOptionId = res.body.Id;

    res = await request(app).delete(`/products/${productId}/`);
    expect(res.status).to.deep.equal(HttpStatus.NO_CONTENT);

    res = await request(app).get(`/products/${productId}/`);
    expect(res.status).to.deep.equal(HttpStatus.NOT_FOUND);

    res = await request(app).get(`/products/${productId}/options/${productOptionId}`);
    expect(res.status).to.deep.equal(HttpStatus.NOT_FOUND);
  });
});

describe('validation - Product', () => {
  afterEach(async () => {
    await productModel.deleteMany();
  });

  it('should validate fields when you create a new product', async () => {
    const product = {
      Name: goodProduct.Name,
      Description: goodProduct.Description,
      Price: goodProduct.Price,
      DeliveryPrice: goodProduct.DeliveryPrice,
    };
    const defectProduct = {
      Name: 'Defective Product',
      Quantity: '20',
    };
    let res = await request(app).post('/products').send(product);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);

    res = await request(app).post('/products').send(defectProduct);
    expect(res.status).to.deep.equal(HttpStatus.BAD_REQUEST);
  });

  it('should validate fields when you update an existing product', async () => {
    const product = {
      Name: goodProduct.Name,
      Description: goodProduct.Description,
      Price: goodProduct.Price,
      DeliveryPrice: goodProduct.DeliveryPrice,
    };
    let res = await request(app).post('/products').send(product);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    const productId = res.body.Id;
    const updateProduct = {
      ...product,
      Name: 'Updated Name',
    };
    res = await request(app).put(`/products/${productId}`).send(updateProduct);
    expect(res.status).to.deep.equal(HttpStatus.OK);

    const defectProduct = {
      Name: 'Defective Product',
      Quantity: '20',
    };
    res = await request(app).put(`/products/${productId}`).send(defectProduct);
    expect(res.status).to.deep.equal(HttpStatus.BAD_REQUEST);
  });

  it('should validate Id as a GUID v4 format when you get a product by Id', async () => {
    const product = {
      Name: goodProduct.Name,
      Description: goodProduct.Description,
      Price: goodProduct.Price,
      DeliveryPrice: goodProduct.DeliveryPrice,
    };

    let res = await request(app).post('/products').send(product);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    const productId = res.body.Id;

    res = await request(app).get(`/products/${productId}`);
    expect(res.status).to.deep.equal(HttpStatus.OK);

    const defectProductId = '594e7e3f-e6a5-4030-84ad';
    res = await request(app).get(`/products/${defectProductId}`);
    expect(res.status).to.deep.equal(HttpStatus.BAD_REQUEST);
  });

  it('should validate Id as a GUID v4 format when you delete a product by Id', async () => {
    const product = {
      Name: goodProduct.Name,
      Description: goodProduct.Description,
      Price: goodProduct.Price,
      DeliveryPrice: goodProduct.DeliveryPrice,
    };

    let res = await request(app).post('/products').send(product);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    const productId = res.body.Id;

    const defectProductId = '594e7e3f-e6a5-4030-84ad';
    res = await request(app).delete(`/products/${defectProductId}`);
    expect(res.status).to.deep.equal(HttpStatus.BAD_REQUEST);

    res = await request(app).delete(`/products/${productId}`);
    expect(res.status).to.deep.equal(HttpStatus.NO_CONTENT);
  });
});
