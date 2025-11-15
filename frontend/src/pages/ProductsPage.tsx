import React, { useState, useEffect, useCallback } from 'react';
import { productsAPI } from '../utils/api';
import styles from './DashBoard.module.css';
import productStyles from './ProductsPage.module.css';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock_quantity: number;
  category: string;
  sku: string;
  batch_no?: string;
  manufacturing_date?: string;
  expiry_date?: string;
  created_at: string;
  updated_at: string;
}

interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock_quantity: string;
  category: string;
  sku: string;
  batch_no: string;
  manufacturing_date: string;
  expiry_date: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  // Perishable categories that need expiry dates
  const perishableCategories = ['Food', 'Dairy', 'Bakery'];
  const isPerishable = (category: string) => perishableCategories.includes(category);
  
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    description: '',
    price: '',
    stock_quantity: '',
    category: '',
    sku: '',
    batch_no: '',
    manufacturing_date: '',
    expiry_date: ''
  });

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await productsAPI.getAll({
        search: searchQuery || undefined,
        category: selectedCategory || undefined,
        limit: 100
      });
      setProducts(response.products);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await productsAPI.getCategories();
      setCategories(response.categories);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [fetchProducts, fetchCategories]);

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: '',
      stock_quantity: '',
      category: '',
      sku: '',
      batch_no: '',
      manufacturing_date: '',
      expiry_date: ''
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const productData = {
        name: formData.name,
        description: formData.description || undefined,
        price: parseFloat(formData.price),
        stock_quantity: parseInt(formData.stock_quantity) || 0,
        category: formData.category || undefined,
        sku: formData.sku || undefined,
        batch_no: formData.batch_no || undefined,
        manufacturing_date: formData.manufacturing_date || undefined,
        expiry_date: formData.expiry_date || undefined
      };

      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
        setSuccess('Product updated successfully!');
      } else {
        await productsAPI.create(productData);
        setSuccess('Product created successfully!');
      }

      resetForm();
      fetchProducts();
      fetchCategories();
    } catch (error: any) {
      setError(error.message || 'Failed to save product');
    }
  };

  const handleEdit = (product: Product) => {
    setFormData({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      stock_quantity: product.stock_quantity.toString(),
      category: product.category || '',
      sku: product.sku || '',
      batch_no: product.batch_no || '',
      manufacturing_date: product.manufacturing_date || '',
      expiry_date: product.expiry_date || ''
    });
    setEditingProduct(product);
    setShowAddForm(true);
  };

  const handleDelete = async (product: Product) => {
    if (!window.confirm(`Are you sure you want to delete "${product.name}"?`)) {
      return;
    }

    try {
      await productsAPI.delete(product.id);
      setSuccess('Product deleted successfully!');
      fetchProducts();
    } catch (error: any) {
      setError(error.message || 'Failed to delete product');
    }
  };

  return (
    <div className={styles.dashboard}>
      <div className={styles.header}>
        <div>
          <h1>📦 Product Management</h1>
          <p>Manage your inventory and product catalog</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className={styles.addButton}
        >
          Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className={productStyles.filters}>
        <div className={productStyles.searchContainer}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={productStyles.searchInput}
          />
        </div>
        
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className={productStyles.categorySelect}
        >
          <option value="">All Categories</option>
          {categories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className={productStyles.modal}>
          <div className={productStyles.modalContent}>
            <div className={productStyles.modalHeader}>
              <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
              <button onClick={resetForm} className={productStyles.closeButton}>×</button>
            </div>
            
            <form onSubmit={handleSubmit} className={productStyles.form}>
              <div className={productStyles.formRow}>
                <div className={productStyles.inputGroup}>
                  <label>Product Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                
                <div className={productStyles.inputGroup}>
                  <label>SKU</label>
                  <input
                    type="text"
                    name="sku"
                    value={formData.sku}
                    onChange={handleInputChange}
                    placeholder="e.g., PROD001"
                  />
                </div>
              </div>

              <div className={productStyles.inputGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={3}
                />
              </div>

              <div className={productStyles.formRow}>
                <div className={productStyles.inputGroup}>
                  <label>Price *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
                
                <div className={productStyles.inputGroup}>
                  <label>Stock Quantity</label>
                  <input
                    type="number"
                    name="stock_quantity"
                    value={formData.stock_quantity}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>

              <div className={productStyles.inputGroup}>
                <label>Category</label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  placeholder="e.g., Electronics, Clothing"
                />
              </div>

              {isPerishable(formData.category) && (
                <>
                  <div className={productStyles.formRow}>
                    <div className={productStyles.inputGroup}>
                      <label>Batch Number</label>
                      <input
                        type="text"
                        name="batch_no"
                        value={formData.batch_no}
                        onChange={handleInputChange}
                        placeholder="e.g., BATCH001"
                      />
                    </div>
                  </div>

                  <div className={productStyles.formRow}>
                    <div className={productStyles.inputGroup}>
                      <label>Manufacturing Date</label>
                      <input
                        type="date"
                        name="manufacturing_date"
                        value={formData.manufacturing_date}
                        onChange={handleInputChange}
                      />
                    </div>
                    
                    <div className={productStyles.inputGroup}>
                      <label>Expiry Date</label>
                      <input
                        type="date"
                        name="expiry_date"
                        value={formData.expiry_date}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                  
                  <div className={productStyles.infoMessage}>
                    ℹ️ Expiry tracking enabled for perishable items (Food, Dairy, Bakery)
                  </div>
                </>
              )}

              <div className={productStyles.formActions}>
                <button type="button" onClick={resetForm} className={productStyles.cancelButton}>
                  Cancel
                </button>
                <button type="submit" className={productStyles.saveButton}>
                  {editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Products List */}
      <div className={productStyles.productsContainer}>
        {error && <div className={productStyles.error}>{error}</div>}
        {success && <div className={productStyles.success}>{success}</div>}

        {isLoading ? (
          <div className={productStyles.loading}>Loading products...</div>
        ) : products.length === 0 ? (
          <div className={productStyles.emptyState}>
            <p>No products found. {searchQuery || selectedCategory ? 'Try adjusting your filters.' : 'Add your first product to get started.'}</p>
          </div>
        ) : (
          <div className={productStyles.productsGrid}>
            {products.map(product => (
              <div key={product.id} className={productStyles.productCard}>
                <div className={productStyles.productHeader}>
                  <h3>{product.name}</h3>
                  <div className={productStyles.productActions}>
                    <button
                      onClick={() => handleEdit(product)}
                      className={productStyles.editButton}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      className={productStyles.deleteButton}
                    >
                      Delete
                    </button>
                  </div>
                </div>
                
                {product.description && (
                  <p className={productStyles.productDescription}>{product.description}</p>
                )}
                
                <div className={productStyles.productDetails}>
                  <div className={productStyles.priceStock}>
                    <span className={productStyles.price}>₹{product.price.toFixed(2)}</span>
                    <span className={`${productStyles.stock} ${product.stock_quantity < 10 ? productStyles.lowStock : ''}`}>
                      Stock: {product.stock_quantity}
                    </span>
                  </div>
                  
                  {product.category && (
                    <span className={productStyles.category}>{product.category}</span>
                  )}
                  
                  {product.sku && (
                    <span className={productStyles.sku}>SKU: {product.sku}</span>
                  )}
                  
                  {product.batch_no && (
                    <span className={productStyles.batch}>Batch: {product.batch_no}</span>
                  )}
                  
                  {product.expiry_date && (
                    <span className={productStyles.expiry}>
                      Expires: {new Date(product.expiry_date).toLocaleDateString()}
                    </span>
                  )}
                  
                  {product.manufacturing_date && (
                    <span className={productStyles.mfgDate}>
                      Mfg: {new Date(product.manufacturing_date).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductsPage;
