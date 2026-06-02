import { Product } from '../models/Product.js';
import { formatProduct } from '../utils/formatProduct.js';

const CATEGORIES = ['Sports', 'Gaming', 'Music', 'Travel'];

const parseOptionalNumber = (value, field) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  if (Number.isNaN(num)) {
    throw new Error(`Invalid ${field}`);
  }
  return num;
};

const normalizeProductInput = (body, { partial = false } = {}) => {
  const data = {};

  if (!partial || body.name !== undefined) {
    if (!body.name?.trim()) throw new Error('Name is required');
    data.name = body.name.trim();
  }

  if (!partial || body.category !== undefined) {
    if (!CATEGORIES.includes(body.category)) {
      throw new Error('Invalid category');
    }
    data.category = body.category;
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (Number.isNaN(price) || price < 0) throw new Error('Invalid price');
    data.price = price;
  }

  if (!partial || body.originalPrice !== undefined) {
    data.originalPrice = parseOptionalNumber(body.originalPrice, 'originalPrice');
  }

  if (!partial || body.tag !== undefined) {
    data.tag = body.tag?.trim() || null;
  }

  if (!partial || body.rating !== undefined) {
    const rating = Number(body.rating ?? 0);
    if (Number.isNaN(rating) || rating < 0 || rating > 5) throw new Error('Invalid rating');
    data.rating = rating;
  }

  if (!partial || body.reviews !== undefined) {
    const reviews = Number(body.reviews ?? 0);
    if (Number.isNaN(reviews) || reviews < 0) throw new Error('Invalid reviews count');
    data.reviews = reviews;
  }

  if (!partial || body.description !== undefined) {
    if (!body.description?.trim()) throw new Error('Description is required');
    data.description = body.description.trim();
  }

  if (!partial || body.featured !== undefined) {
    data.featured = Boolean(body.featured);
  }

  if (!partial || body.image !== undefined) {
    data.image = body.image?.trim() || null;
  }

  return data;
};

const getNextLegacyId = async () => {
  const latest = await Product.findOne().sort({ legacyId: -1 }).select('legacyId').lean();
  return (latest?.legacyId ?? 0) + 1;
};

export const listAdminProducts = async (_req, res) => {
  try {
    const products = await Product.find().sort({ legacyId: 1 }).lean();
    res.json(products.map(formatProduct));
  } catch (error) {
    console.error('listAdminProducts error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

export const createAdminProduct = async (req, res) => {
  try {
    const data = normalizeProductInput(req.body);
    const legacyId = await getNextLegacyId();

    const product = await Product.create({
      legacyId,
      ...data,
      featured: data.featured ?? false,
      rating: data.rating ?? 0,
      reviews: data.reviews ?? 0,
    });

    res.status(201).json(formatProduct(product));
  } catch (error) {
    if (error.message && !error.code) {
      return res.status(400).json({ message: error.message });
    }
    console.error('createAdminProduct error:', error);
    res.status(500).json({ message: 'Failed to create product' });
  }
};

export const updateAdminProduct = async (req, res) => {
  try {
    const legacyId = Number(req.params.id);
    if (Number.isNaN(legacyId)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const data = normalizeProductInput(req.body, { partial: true });
    const product = await Product.findOneAndUpdate({ legacyId }, data, {
      new: true,
      runValidators: true,
    }).lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json(formatProduct(product));
  } catch (error) {
    if (error.message && !error.code) {
      return res.status(400).json({ message: error.message });
    }
    console.error('updateAdminProduct error:', error);
    res.status(500).json({ message: 'Failed to update product' });
  }
};

export const deleteAdminProduct = async (req, res) => {
  try {
    const legacyId = Number(req.params.id);
    if (Number.isNaN(legacyId)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findOneAndDelete({ legacyId });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted', id: legacyId });
  } catch (error) {
    console.error('deleteAdminProduct error:', error);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};
