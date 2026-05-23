export interface Product {
  id: number;
  name: string;
  price: number;
  image: string;
}

export interface CheckoutPayload {
  productId: number;
  amount: number;
  signature: string;
  hmac: string;
}