import React, { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import './ProductForm.css';
import { ArrowLeft, Save, Info, Link as LinkIcon, BrainCircuit, Upload, Image as ImageIcon } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const ProductForm = () => {
    const { id } = useParams();
    const isEdit = Boolean(id);
    const navigate = useNavigate();
    const { showToast } = useToast();

    const [categories, setCategories] = useState([]);
    const [formData, setFormData] = useState({
        category_id: '',
        name: '',
        description: '',
        price: '',
        stock_quantity: '',
        weight: '',
        image_url: '',
        additional_images: [],
        health_benefits: '',
        nutrition_info: '',
        recommended_intake: '',
        ai_context_notes: ''
    });
    const [selectedFile, setSelectedFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    
    // Gallery State (Fixed 4 slots)
    const [galleryFiles, setGalleryFiles] = useState([null, null, null, null]);
    const [galleryPreviews, setGalleryPreviews] = useState([null, null, null, null]);
    
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchProduct();
        }
    }, [id]);

    const fetchCategories = async () => {
        try {
            const data = await api.get('/products/categories');
            setCategories(data);
        } catch (err) {
            console.error('Error fetching categories:', err);
        }
    };

    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${BACKEND_URL}${url}`;
    };

    const fetchProduct = async () => {
        try {
            const data = await api.get(`/products/${id}`);
            const gallery = data.images ? data.images.slice(1) : [];
            
            setFormData({
                ...data,
                additional_images: gallery
            });

            if (data.image_url) {
                setPreviewUrl(getFullImageUrl(data.image_url));
            }

            // Populate gallery previews with existing images
            if (gallery.length > 0) {
                const newPreviews = [null, null, null, null];
                gallery.forEach((url, idx) => {
                    if (idx < 4) newPreviews[idx] = getFullImageUrl(url);
                });
                setGalleryPreviews(newPreviews);
            }
        } catch (err) {
            console.error('Error fetching product:', err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleGalleryFileChange = (index, e) => {
        const file = e.target.files[0];
        if (file) {
            const newFiles = [...galleryFiles];
            newFiles[index] = file;
            setGalleryFiles(newFiles);

            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviews = [...galleryPreviews];
                newPreviews[index] = reader.result;
                setGalleryPreviews(newPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const fd = new FormData();
            
            // Append base fields
            Object.keys(formData).forEach(key => {
                if (key !== 'additional_images' && key !== 'image_url' && key !== 'images') {
                    fd.append(key, formData[key]);
                }
            });

            // Append main image
            if (selectedFile) {
                fd.append('image', selectedFile);
            } else if (formData.image_url) {
                fd.append('image_url', formData.image_url);
            }

            // Append additional gallery images
            let hasNewGallery = false;
            galleryFiles.forEach((file) => {
                if (file) {
                    fd.append('additional_images', file);
                    hasNewGallery = true;
                }
            });

            // If no new gallery files are selected, send existing URLs back 
            // so the backend can preserve them
            if (!hasNewGallery && formData.additional_images.length > 0) {
                formData.additional_images.forEach(url => {
                    fd.append('additional_images', url);
                });
            }

            const config = {
                headers: { 'Content-Type': 'multipart/form-data' }
            };

            if (isEdit) {
                await api.put(`/admin/products/${id}`, fd, config);
                showToast('Product updated successfully', 'success');
            } else {
                await api.post('/admin/products', fd, config);
                showToast('Product created successfully', 'success');
            }
            navigate('/admin/products');
        } catch (err) {
            showToast(err.response?.data?.message || 'Failed to save product', 'error');
            setLoading(false);
        }
    };

    return (
        <div className="admin-container animate-fade">
            <Link to="/admin/products" className="back-btn"><ArrowLeft size={18} /> Back to Products</Link>
            
            <div className="form-header">
                <h1>{isEdit ? 'Edit Product' : 'Add New Product'}</h1>
                <p>{isEdit ? `Updating ID: ${id}` : 'Create a new listing in the premium catalog'}</p>
            </div>

            <form className="product-form" onSubmit={handleSubmit}>
                <div className="form-grid">
                    {/* Basic Info Section */}
                    <div className="form-section glass">
                        <h3><Info size={18} /> Basic Information</h3>
                        
                        <div className="field">
                            <label>Product Name</label>
                            <input 
                                type="text" 
                                name="name" 
                                value={formData.name} 
                                onChange={handleChange} 
                                required 
                                placeholder="e.g. Premium Walnuts"
                            />
                        </div>

                        <div className="field">
                            <label>Category</label>
                            <select 
                                name="category_id" 
                                value={formData.category_id} 
                                onChange={handleChange} 
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="field">
                            <label>Description</label>
                            <textarea 
                                name="description" 
                                value={formData.description} 
                                onChange={handleChange} 
                                required 
                                rows="4"
                                placeholder="Describe the quality, origin, and health benefits..."
                            ></textarea>
                        </div>
                    </div>

                    {/* Inventory & Specs Section */}
                    <div className="form-section glass">
                        <h3><Save size={18} /> Inventory & Specs</h3>
                        
                        <div className="field-row">
                            <div className="field">
                                <label>Price (₹)</label>
                                <input type="number" name="price" value={formData.price} onChange={handleChange} required />
                            </div>
                            <div className="field">
                                <label>Stock (kg)</label>
                                <input type="number" name="stock_quantity" value={formData.stock_quantity} onChange={handleChange} required />
                            </div>
                        </div>

                        <div className="field">
                            <label>Weight (e.g. 500g, 1kg)</label>
                            <input type="text" name="weight" value={formData.weight} onChange={handleChange} required />
                        </div>
                    </div>

                    {/* Media Section */}
                    <div className="form-section glass">
                        <h3><LinkIcon size={18} /> Media & Photos</h3>
                        
                        <div className="field">
                            <label>Main Product Image</label>
                            <div className="file-upload-wrapper product-upload">
                                <div className="image-preview-container product-preview-box">
                                    {previewUrl ? (
                                        <img src={previewUrl} alt="Preview" className="upload-preview" />
                                    ) : (
                                        <div className="preview-placeholder">
                                            <ImageIcon size={40} />
                                            <span>No image selected</span>
                                        </div>
                                    )}
                                </div>
                                <label className="file-input-label">
                                    <Upload size={18} />
                                    {selectedFile ? 'Change Photo' : 'Upload Photo'}
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                        className="hidden-file-input"
                                    />
                                </label>
                            </div>
                        </div>

                        <div className="field">
                            <label>Product Gallery Photos (Optional - Max 4)</label>
                            <div className="gallery-upload-grid">
                                {[0, 1, 2, 3].map((idx) => (
                                    <div key={idx} className="file-upload-wrapper gallery-slot">
                                        <div className="image-preview-container gallery-preview-box">
                                            {galleryPreviews[idx] ? (
                                                <img src={galleryPreviews[idx]} alt={`Gallery ${idx + 1}`} className="upload-preview" />
                                            ) : (
                                                <div className="preview-placeholder sm">
                                                    <ImageIcon size={24} />
                                                    <span>Empty</span>
                                                </div>
                                            )}
                                        </div>
                                        <label className="file-input-label sm">
                                            <Upload size={14} />
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={(e) => handleGalleryFileChange(idx, e)}
                                                className="hidden-file-input"
                                            />
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Content Section */}
                    <div className="form-section glass ai-section">
                        <h3><BrainCircuit size={18} /> AI Product Content (Assistant Logic)</h3>
                        <p className="section-note">This information directly trains the AI Assistant for this product.</p>
                        
                        <div className="field">
                            <label>Health Benefits</label>
                            <textarea 
                                name="health_benefits" 
                                value={formData.health_benefits} 
                                onChange={handleChange} 
                                rows="3"
                                placeholder="e.g. Improves heart health, rich in Vitamin E..."
                            ></textarea>
                        </div>

                        <div className="field">
                            <label>Nutritional Information</label>
                            <textarea 
                                name="nutrition_info" 
                                value={formData.nutrition_info} 
                                onChange={handleChange} 
                                rows="3"
                                placeholder="e.g. Energy: 579kcal, Protein: 21g per 100g..."
                            ></textarea>
                        </div>

                        <div className="field">
                            <label>Recommended Intake</label>
                            <textarea 
                                name="recommended_intake" 
                                value={formData.recommended_intake} 
                                onChange={handleChange} 
                                rows="2"
                                placeholder="e.g. 20-25 pieces per day..."
                            ></textarea>
                        </div>

                        <div className="field">
                            <label>AI Context Notes (Private)</label>
                            <textarea 
                                name="ai_context_notes" 
                                value={formData.ai_context_notes} 
                                onChange={handleChange} 
                                rows="2"
                                placeholder="Internal notes for AI behavior..."
                            ></textarea>
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button type="button" className="btn btn-outline" onClick={() => navigate('/admin/products')}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={loading}>
                        {loading ? 'Processing...' : isEdit ? 'Update Product' : 'Create Product'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
