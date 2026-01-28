'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './products.module.css';
import toast from 'react-hot-toast';

interface Product {
    _id: string;
    name: string;
    price: number;
    category: any;
    stock: number;
    images?: Array<{ url: string; alt: string }>;
    imageUrl?: string;
}

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState<'published' | 'draft'>('published');
    const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());

    useEffect(() => {
        fetchProducts();
    }, [activeTab]);

    useEffect(() => {
        // Filter logic
        if (!searchQuery) {
            setFilteredProducts(products);
        } else {
            const lowerQ = searchQuery.toLowerCase();
            const filtered = products.filter(p => {
                const catName = typeof p.category === 'string' ? p.category : (p.category?.name || '');
                return p.name.toLowerCase().includes(lowerQ) ||
                    catName.toLowerCase().includes(lowerQ);
            });
            setFilteredProducts(filtered);
        }
    }, [searchQuery, products]);

    // Clear selection when changing tabs or filtering
    useEffect(() => {
        setSelectedProducts(new Set());
    }, [activeTab, searchQuery]);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/api/products?status=${activeTab}`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
                setFilteredProducts(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch products', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;

        const deletePromise = async () => {
            const res = await fetch(`/api/products?id=${id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete');

            const updated = products.filter(p => p._id !== id);
            setProducts(updated);
            setSelectedProducts(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        };

        toast.promise(deletePromise(), {
            loading: 'Deleting product...',
            success: 'Product deleted',
            error: 'Failed to delete product'
        });
    };

    const handleBatchDelete = async () => {
        if (selectedProducts.size === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedProducts.size} products? This cannot be undone.`)) return;

        const deletePromise = async () => {
            const ids = Array.from(selectedProducts).join(',');
            const res = await fetch(`/api/products?ids=${ids}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete');

            const data = await res.json();

            // Update local state
            const updated = products.filter(p => !selectedProducts.has(p._id));
            setProducts(updated);
            setSelectedProducts(new Set());
            return data;
        };

        toast.promise(deletePromise(), {
            loading: 'Deleting products...',
            success: 'Products deleted successfully',
            error: 'Failed to delete products'
        });
    };

    const toggleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.checked) {
            const allIds = filteredProducts.map(p => p._id);
            setSelectedProducts(new Set(allIds));
        } else {
            setSelectedProducts(new Set());
        }
    };

    const toggleSelectProduct = (id: string) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return newSet;
        });
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <div className={styles.leftSection}>
                    <h1 className={styles.title}>Products</h1>

                    {/* Tabs */}
                    <div className={styles.tabs}>
                        <button
                            onClick={() => setActiveTab('published')}
                            className={`${styles.tabBtn} ${activeTab === 'published' ? styles.tabBtnActive : styles.tabBtnInactive}`}
                        >
                            Published
                        </button>
                        <button
                            onClick={() => setActiveTab('draft')}
                            className={`${styles.tabBtn} ${activeTab === 'draft' ? styles.draftActive : styles.tabBtnInactive}`}
                        >
                            Drafts
                        </button>
                    </div>
                </div>
                <div className={styles.actions}>
                    {selectedProducts.size > 0 && (
                        <button
                            onClick={handleBatchDelete}
                            className={styles.dangerBtn}
                        >
                            🗑️ Delete Selected ({selectedProducts.size})
                        </button>
                    )}
                    <button
                        onClick={fetchProducts}
                        disabled={loading}
                        className={styles.refreshBtn}
                        title="Reload Inventory"
                    >
                        {loading ? '↻' : '↻ Refresh'}
                    </button>
                    <Link href="/admin/products/new">
                        <button className={styles.addBtn}>
                            + Add Product
                        </button>
                    </Link>
                </div>
            </div>

            <div className={styles.searchContainer}>
                <input
                    type="text"
                    placeholder="Search by name or category..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className={styles.searchInput}
                />
            </div>

            {loading ? (
                <div style={{ color: '#666' }}>Loading inventory...</div>
            ) : (
                <>
                    <div className={styles.tableContainer}>
                        <table className={styles.table}>
                            <thead className={styles.thead}>
                                <tr className={styles.tr}>
                                    <th className={styles.th} style={{ width: '40px' }}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                                            onChange={toggleSelectAll}
                                        />
                                    </th>
                                    <th className={styles.th}>Image</th>
                                    <th className={styles.th}>Name</th>
                                    <th className={styles.th}>Category</th>
                                    <th className={styles.th}>Price</th>
                                    <th className={styles.th}>Stock</th>
                                    <th className={styles.th}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts.map((product) => {
                                    const productImage = product.images?.[0]?.url || product.imageUrl;
                                    const catName = typeof product.category === 'string' ? product.category : (product.category?.name || 'Uncategorized');
                                    const isSelected = selectedProducts.has(product._id);

                                    return (
                                        <tr key={product._id} className={`${styles.tr} ${isSelected ? styles.rowSelected : ''}`}>
                                            <td className={styles.td}>
                                                <input
                                                    type="checkbox"
                                                    className={styles.checkbox}
                                                    checked={isSelected}
                                                    onChange={() => toggleSelectProduct(product._id)}
                                                />
                                            </td>
                                            <td className={styles.td}>
                                                <div style={{ width: '40px', height: '40px', background: '#333', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                                                    {productImage ? (
                                                        <img src={productImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                                    ) : (
                                                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📱</div>
                                                    )}
                                                </div>
                                            </td>
                                            <td className={styles.td} style={{ fontWeight: '500' }}>{product.name}</td>
                                            <td className={styles.td} style={{ color: '#888' }}>{catName}</td>
                                            <td className={styles.td}>KES {product.price.toLocaleString()}</td>
                                            <td className={styles.td}>
                                                <span style={{
                                                    padding: '2px 8px',
                                                    borderRadius: '4px',
                                                    background: product.stock > 0 ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)',
                                                    color: product.stock > 0 ? '#4caf50' : '#f44336',
                                                    fontSize: '0.85rem'
                                                }}>
                                                    {product.stock}
                                                </span>
                                            </td>
                                            <td className={styles.td}>
                                                <div style={{ display: 'flex', gap: '10px' }}>
                                                    <Link href={`/admin/products/${product._id}`}>
                                                        <button
                                                            style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                                                            title="Edit"
                                                        >
                                                            ✏️
                                                        </button>
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(product._id)}
                                                        style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '1.1rem' }}
                                                        title="Delete"
                                                    >
                                                        🗑️
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                        {filteredProducts.length === 0 && (
                            <div style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>
                                {searchQuery ? 'No matching products.' : 'No products found. Add your first one!'}
                            </div>
                        )}
                    </div>

                    {/* Mobile View: Cards */}
                    <div className={styles.productCardGrid}>
                        {/* Mobile Bulk Actions */}
                        {filteredProducts.length > 0 && (
                            <div style={{ background: '#222', padding: '10px', borderRadius: '8px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <input
                                    type="checkbox"
                                    className={styles.checkbox}
                                    checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                                    onChange={toggleSelectAll}
                                />
                                <span>Select All</span>
                            </div>
                        )}

                        {filteredProducts.map((product) => {
                            const productImage = product.images?.[0]?.url || product.imageUrl;
                            const isSelected = selectedProducts.has(product._id);

                            return (
                                <div key={product._id} className={styles.productCard} style={isSelected ? { borderColor: 'var(--accent)', background: 'rgba(var(--accent-rgb), 0.05)' } : {}}>
                                    <div style={{ marginRight: '10px' }}>
                                        <input
                                            type="checkbox"
                                            className={styles.checkbox}
                                            checked={isSelected}
                                            onChange={() => toggleSelectProduct(product._id)}
                                        />
                                    </div>
                                    <div className={styles.productCardImage}>
                                        {productImage ? (
                                            <img src={productImage} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        ) : (
                                            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>📱</div>
                                        )}
                                    </div>
                                    <div className={styles.productCardInfo}>
                                        <span className={styles.productCardName}>{product.name}</span>
                                        <div className={styles.productCardMeta}>
                                            <span>KES {product.price.toLocaleString()}</span>
                                            <span style={{ color: product.stock > 0 ? '#4caf50' : '#f44336' }}>
                                                Stock: {product.stock}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={styles.productCardActions}>
                                        <Link href={`/admin/products/${product._id}`}>
                                            <button style={{ color: '#ccc', fontSize: '1.2rem' }}>✏️</button>
                                        </Link>
                                        <button onClick={() => handleDelete(product._id)} style={{ color: '#ccc', fontSize: '1.2rem' }}>🗑️</button>
                                    </div>
                                </div>
                            );
                        })}
                        {filteredProducts.length === 0 && (
                            <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                                {searchQuery ? 'No matching products.' : 'No items found.'}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
