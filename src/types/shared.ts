// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type JSONObject = Record<string, any>;

export interface Payload extends JSONObject {
  name: string;
  valueType: string;
  value: Payload[] | string;
}

export interface Data extends JSONObject {
  payload: Payload;
  referenceData: JSONObject;
}

export interface Product {
  Id: string;
  Name: string;
  Description: string;
  Price: string;
  DeliveryPrice: string;
}

export interface ProductOption {
  Id: string;
  Name: string;
  Description: string;
}
