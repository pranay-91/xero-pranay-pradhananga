import '../aliases';
import { expect } from 'chai';
import request from 'supertest';
import HttpStatus from 'http-status-codes';
import app from '@/app';
import { goodProduct, goodProductOption } from './fixtures';
import { productOptionModel } from '@/models/product-option';

describe('functional - Product Option', () => {
  let productId: string;
  beforeEach(async () => {
    const { Name, Description, Price, DeliveryPrice } = goodProduct;
    const body = { Name, Description, Price, DeliveryPrice };
    const res = await request(app).post('/products').send(body);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    productId = res.body.Id;
  });

  afterEach(async () => {
    await productOptionModel.deleteMany();
    await productOptionModel.deleteMany();
  });

  it('should add a new option for the specified product', async () => {
    const { Name, Description } = goodProductOption;
    const body = { Name, Description };
    const res = await request(app).post(`/products/${productId}/options`).send(body);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    expect(res.body.Name).to.deep.equal(goodProductOption.Name);
    expect(res.body.Description).to.deep.equal(goodProductOption.Description);
  });

  it('should not add a new option for a product that does not exist', async () => {
    const rogueProductId = '945ebfe7-2bc3-4258-93a5-ca04ac8d7ae1';
    const { Name, Description } = goodProductOption;
    const body = { Name, Description };
    const res = await request(app).post(`/products/${rogueProductId}/options`).send(body);
    expect(res.status).to.deep.equal(HttpStatus.NOT_FOUND);
  });

  it('finds all options for a specified product ', async () => {
    const goodProductOptions = [
      {
        Name: 'Test Name Option1',
        Description: 'Test Description Option2',
      },
      {
        Name: 'Test Name Option2',
        Description: 'Test Description Option3',
      },
      {
        Name: 'Test Name Option3',
        Description: 'Test Description Option3',
      },
    ];

    await Promise.all(
      goodProductOptions.map(
        async (productOption) => await request(app).post(`/products/${productId}/options`).send(productOption),
      ),
    );
    const res = await request(app).get(`/products/${productId}/options`);
    expect(res.body.Items.length).to.equal(3);
  });

  it('should find the specified product option for the specified product ', async () => {
    const { Name, Description } = goodProductOption;
    const body = { Name, Description };
    let res = await request(app).post(`/products/${productId}/options`).send(body);
    const productOptionId = res.body.Id;

    res = await request(app).get(`/products/${productId}/options/${productOptionId}`);
    expect(res.body.Id).to.deep.equal(productOptionId);
    expect(res.body.Name).to.deep.equal(goodProductOption.Name);
    expect(res.body.Description).to.deep.equal(goodProductOption.Description);
  });

  it('should throw a not found error if the specified product option does not exist. ', async () => {
    const rougueProductOptionId = '945ebfe7-2bc3-4258-93a5-ca04ac8d7ae1';
    const res = await request(app).get(`/products/${productId}/options/${rougueProductOptionId}`);
    expect(res.status).to.deep.equal(HttpStatus.NOT_FOUND);
  });

  it('should update the specified product option', async () => {
    const { Name, Description } = goodProductOption;
    const body = { Name, Description };
    let res = await request(app).post(`/products/${productId}/options`).send(body);
    const productOptionId = res.body.Id;

    const updateProductOption = { Name: 'Updated name', Description: 'Updated description' };
    res = await request(app).put(`/products/${productId}/options/${productOptionId}`).send(updateProductOption);
    expect(res.status).to.deep.equal(HttpStatus.OK);
    expect(res.body.Name).to.deep.equal(updateProductOption.Name);
    expect(res.body.Description).to.deep.equal(updateProductOption.Description);
  });

  it('should delete the specified product option', async () => {
    const { Name, Description } = goodProductOption;
    const body = { Name, Description };
    let res = await request(app).post(`/products/${productId}/options`).send(body);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    const productOptionId = res.body.Id;
    res = await request(app).delete(`/products/${productId}/options/${productOptionId}`);
    expect(res.status).to.deep.equal(HttpStatus.NO_CONTENT);
    res = await request(app).get(`/products/${productId}/options/${productOptionId}`);
    expect(res.status).to.deep.equal(HttpStatus.NOT_FOUND);
  });
});

describe('validation - Product Option', () => {
  let productId: string;
  before(async () => {
    const { Name, Description, Price, DeliveryPrice } = goodProduct;
    const body = { Name, Description, Price, DeliveryPrice };
    const res = await request(app).post('/products').send(body);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    productId = res.body.Id;
  });

  afterEach(async () => {
    await productOptionModel.deleteMany();
  });

  it('should validate fields when you create a new product option', async () => {
    const productOption = {
      Name: goodProductOption.Name,
      Description: goodProductOption.Description,
    };
    const defectProductOption = {
      Name: 'Defective Product',
      Quantity: '20',
    };
    let res = await request(app).post(`/products/${productId}/options`).send(productOption);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);

    res = await request(app).post(`/products/${productId}/options`).send(defectProductOption);
    expect(res.status).to.deep.equal(HttpStatus.BAD_REQUEST);
  });

  it('should validate fields when you update an existing product option', async () => {
    const productOption = {
      Name: goodProductOption.Name,
      Description: goodProductOption.Description,
    };
    let res = await request(app).post(`/products/${productId}/options`).send(productOption);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    const productOptionId = res.body.Id;
    const updateProductOption = {
      ...productOption,
      Name: 'Updated Name',
    };
    res = await request(app).put(`/products/${productId}/options/${productOptionId}`).send(updateProductOption);
    expect(res.status).to.deep.equal(HttpStatus.OK);

    const defectProductOption = {
      Name: 'Defective Product',
      Quantity: '20',
    };
    res = await request(app).put(`/products/${productId}/options/${productOptionId}`).send(defectProductOption);
    expect(res.status).to.deep.equal(HttpStatus.BAD_REQUEST);
  });

  it('should validate Id as a GUID v4 format when you get a product option by Id', async () => {
    const productOption = {
      Name: goodProductOption.Name,
      Description: goodProductOption.Description,
    };
    let res = await request(app).post(`/products/${productId}/options`).send(productOption);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    const productOptionId = res.body.Id;

    res = await request(app).get(`/products/${productId}/options/${productOptionId}`);
    expect(res.status).to.deep.equal(HttpStatus.OK);

    const defectProductOptionId = '594e7e3f-e6a5-4030-84ad';
    res = await request(app).get(`/products/${productId}/options/${defectProductOptionId}`);
    expect(res.status).to.deep.equal(HttpStatus.BAD_REQUEST);
  });

  it('should validate Id as a GUID v4 format when you delete a product option by Id', async () => {
    const productOption = {
      Name: goodProductOption.Name,
      Description: goodProductOption.Description,
    };
    let res = await request(app).post(`/products/${productId}/options`).send(productOption);
    expect(res.status).to.deep.equal(HttpStatus.CREATED);
    const productOptionId = res.body.Id;

    const defectProductId = '594e7e3f-e6a5-4030-84ad';
    res = await request(app).delete(`/products/${productId}/options/${defectProductId}`);
    expect(res.status).to.deep.equal(HttpStatus.BAD_REQUEST);

    res = await request(app).delete(`/products/${productId}/options/${productOptionId}`);
    expect(res.status).to.deep.equal(HttpStatus.NO_CONTENT);
  });
});
