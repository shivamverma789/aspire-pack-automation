const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const slugify = require('slugify');
const { cloudinary } = require('../utils/cloudinary');

// CREATE Product (Admin)
exports.createProduct = async (req, res) => {
  try {
    const {
      productName,
      shortDescription,
      productDescription,
      productFeatures,
      productApplications,
      productParameters, // JSON stringified or array of { key, value }
      productModelNumber,
      mainCategory,
      subCategory,
      videoURL
    } = req.body;
    

    // Extract media files safely
    const coverImage = req.files?.coverImage?.[0]?.path || '';
    const productImages = req.files?.productImages?.map(file => file.path) || [];
    const specPDF = req.files?.specPDF?.[0]?.path || '';

    // Create product instance
    const newProduct = new Product({
      productName,
      slug: slugify(productName, { lower: true, strict: true }),
      shortDescription,
      productDescription,
      productModelNumber,
      productFeatures: productFeatures
        ? productFeatures.split(',').map(f => f.trim())
        : [],
      productApplications: productApplications
        ? productApplications.split(',').map(a => a.trim())
        : [],
      productParameters: typeof productParameters === 'string'
        ? JSON.parse(productParameters)
        : productParameters || [],
      categoryId: mainCategory,
      subCategoryId: subCategory || null,
      coverImage,
      productImages,
      videoURL,
      specPDF
    });

    await newProduct.save();

    // 👉 Update main category's product list
    await Category.findByIdAndUpdate(mainCategory, {
      $addToSet: { products: newProduct._id }
    });

    // 👉 Update subcategory’s product list if provided
    if (subCategory) {
      await Category.findByIdAndUpdate(subCategory, {
        $addToSet: { products: newProduct._id }
      });
    }

    res.redirect('/admin/products');
  } catch (err) {
    console.error('Product creation error:', err);
    res.status(500).send('Error creating product');
  }
};


exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      productName,
      shortDescription,
      productDescription,
      productFeatures,
      productApplications,
      productParameters,
      productModelNumber,
      mainCategory,
      subCategory,
      videoURL
    } = req.body;

    const product = await Product.findById(id);
    if (!product) return res.status(404).send('Product not found');

    const oldMain = product.categoryId?.toString();
    const oldSub = product.subCategoryId?.toString();
    const newMain = mainCategory;
    const newSub = subCategory || null;

    // 🗑 Helper function to delete from Cloudinary
    const deleteFromCloudinary = async (imageUrl) => {
      if (!imageUrl) return;
      const parts = imageUrl.split('/');
      const publicIdWithExt = parts.slice(-2).join('/'); // folder/filename.jpg
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'));
      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error(`Error deleting old image from Cloudinary:`, err);
      }
    };

    // ✅ If new coverImage uploaded → delete old one
    if (req.files.coverImage) {
      if (product.coverImage) {
        await deleteFromCloudinary(product.coverImage);
      }
      product.coverImage = req.files.coverImage[0].path;
    }

    // ✅ If new productImages uploaded → delete all old ones
    if (req.files.productImages) {
      if (product.productImages && product.productImages.length > 0) {
        for (const img of product.productImages) {
          await deleteFromCloudinary(img);
        }
      }
      product.productImages = req.files.productImages.map(file => file.path);
    }

    // ✅ If new specPDF uploaded → delete old one from Cloudinary
    if (req.files.specPDF) {
      if (product.specPDF) {
        await deleteFromCloudinary(product.specPDF);
      }
      product.specPDF = req.files.specPDF[0].path;
    }

    // ✅ Update fields
    product.productName = productName;
    product.slug = slugify(productName, { lower: true, strict: true });
    product.shortDescription = shortDescription;
    product.productDescription = productDescription;
    product.productFeatures = productFeatures
      ? productFeatures.split(',').map(f => f.trim())
      : [];
    product.productApplications = productApplications
      ? productApplications.split(',').map(a => a.trim())
      : [];
    product.productParameters =
      typeof productParameters === 'string'
        ? JSON.parse(productParameters)
        : productParameters || [];
    product.productModelNumber = productModelNumber;
    product.categoryId = newMain;
    product.subCategoryId = newSub;
    product.videoURL = videoURL;

    await product.save();

    // ✅ Update categories if changed
    if (oldMain && oldMain !== newMain) {
      await Category.findByIdAndUpdate(oldMain, {
        $pull: { products: product._id }
      });
    }
    if (newMain && oldMain !== newMain) {
      await Category.findByIdAndUpdate(newMain, {
        $addToSet: { products: product._id }
      });
    }
    if (oldSub && oldSub !== newSub) {
      await Category.findByIdAndUpdate(oldSub, {
        $pull: { products: product._id }
      });
    }
    if (newSub && oldSub !== newSub) {
      await Category.findByIdAndUpdate(newSub, {
        $addToSet: { products: product._id }
      });
    }

    res.redirect('/admin/products');
  } catch (err) {
    console.error('Product update error:', err);
    res.status(500).send('Error updating product');
  }
};



// DELETE Product (Admin)

exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).send('Product not found');

    // Remove images from Cloudinary
    const deleteImageFromCloudinary = async (imageUrl) => {
      if (!imageUrl) return;

      // Extract public_id from the URL
      // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/folder/filename.jpg
      const parts = imageUrl.split('/');
      const publicIdWithExt = parts.slice(-2).join('/'); // folder/filename.jpg
      const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.')); // folder/filename

      try {
        await cloudinary.uploader.destroy(publicId);
      } catch (err) {
        console.error(`Error deleting image ${publicId} from Cloudinary:`, err);
      }
    };

    // Delete cover image
    await deleteImageFromCloudinary(product.coverImage);

    // Delete all product images
    for (const img of product.productImages) {
      await deleteImageFromCloudinary(img);
    }

    // Remove product from its main category
    if (product.categoryId) {
      await Category.findByIdAndUpdate(product.categoryId, {
        $pull: { products: product._id }
      });
    }

    // Remove product from its subcategory
    if (product.subCategoryId) {
      await Category.findByIdAndUpdate(product.subCategoryId, {
        $pull: { products: product._id }
      });
    }

    // Finally delete the product
    await Product.findByIdAndDelete(id);

    res.redirect('/admin/products');
  } catch (err) {
    console.error('Error deleting product:', err);
    res.status(500).send('Error deleting product');
  }
};



// GET All Products (Admin View)
exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({})
      .populate('categoryId')
      .populate('subCategoryId')
      .lean();

    const categories = await Category.find({ parentCategory: null }) // main categories
      .populate('subcategories')
      .lean();

    res.render('admin/products/list', {
      products,
      categories,  // ✅ Now categories is defined
      user: req.user // if you need user role for admin button
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Server error");
  }
};


// GET Public All Products
exports.getPublicProducts = async (req, res) => {
  try {
    const { slug } = req.params;

    const products = await Product.find({})
      .populate('categoryId')
      .populate('subCategoryId')
      .lean();

    const categories = await Category.find({ parentCategory: null })
      .populate('subcategories')
      .lean();

    // Ensure subcategories is always an array
    categories.forEach(cat => {
      if (!Array.isArray(cat.subcategories)) {
        cat.subcategories = [];
      }
    });

    res.render('products/allProducts', {
      products,
      categories,
      preselectedCategorySlug: slug || '' // for frontend filter
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
};


// GET Products by Category
exports.getProductsByCategory = async (req, res) => {
  try {
    const categorySlug = req.params.slug;
    const category = await Category.findOne({ slug: categorySlug });
    if (!category) return res.status(404).send('Category not found');

    const products = await Product.find({ categoryId: category._id });
    res.render('products/categoryProducts', { category, products });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading category');
  }
};

// GET Single Product with Similar
exports.getProductDetails = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('categoryId');
    if (!product) return res.status(404).send('Product not found');

    const similarProducts = await Product.find({
      categoryId: product.categoryId._id,
      _id: { $ne: product._id }
    }).limit(4);

    const user = req.user || null;

    res.render('products/singleProduct', { product, similarProducts, user });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error loading product details');
  }
};

// Like a Product
exports.likeProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const user = req.user;
    if (!user) return res.status(401).send('Login required');

    if (!user.likedProducts.includes(productId)) {
      user.likedProducts.push(productId);
      await user.save();
    }

    res.redirect('back');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error liking product');
  }
};
