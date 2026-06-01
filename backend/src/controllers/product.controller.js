import { Product } from '../models/Product.js';
import { formatProduct } from '../utils/formatProduct.js';

export const getProducts = async (req, res) => {
  try {
    const filter = {};

    if (req.query.featured === 'true') {
      filter.featured = true;
    }

    if (req.query.category) {
      filter.category = req.query.category;
    }

    const products = await Product.find(filter).sort({ legacyId: 1 }).lean();
    res.json(products.map(formatProduct));
  } catch (error) {
    console.error('getProducts error:', error);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

export const getProductByLegacyId = async (req, res) => {
  try {
    const legacyId = Number(req.params.id);

    if (Number.isNaN(legacyId)) {
      return res.status(400).json({ message: 'Invalid product id' });
    }

    const product = await Product.findOne({ legacyId }).lean();

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const related = await Product.find({
      category: product.category,
      legacyId: { $ne: legacyId },
    })
      .sort({ legacyId: 1 })
      .limit(4)
      .lean();

    res.json({
      product: formatProduct(product),
      related: related.map(formatProduct),
    });
  } catch (error) {
    console.error('getProductByLegacyId error:', error);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};
