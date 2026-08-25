import api from '../utils/api';

/**
 * Product Service to handle all inventory catalog calls
 */
export const getProducts = async (params = {}) => {
  const res = await api.get('/products', { params });
  return res.data;
};

export const getProduct = async (id) => {
  const res = await api.get(`/products/${id}`);
  return res.data;
};

export const createProduct = async (data) => {
  const res = await api.post('/products', data);
  return res.data;
};

export const updateProduct = async (id, data) => {
  const res = await api.put(`/products/${id}`, data);
  return res.data;
};

export const deleteProduct = async (id) => {
  const res = await api.delete(`/products/${id}`);
  return res.data;
};

export const updateStock = async (id, data) => {
  // data should contain { type: 'add' | 'remove', quantity: number, reason: string }
  const res = await api.patch(`/products/${id}/stock`, data);
  return res.data;
};
