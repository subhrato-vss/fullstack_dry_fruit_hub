import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import './OrderManagement.css';
import {
    Eye,
    CheckCircle,
    Truck,
    Clock,
    X,
    Package,
    Search,
    User,
    Mail,
    Phone,
    MapPin,
    CreditCard,
    Calendar,
    FileText,
    Check,
    Printer,
    Share
} from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [copiedId, setCopiedId] = useState(null);

    const handleCopyId = (id) => {
        navigator.clipboard.writeText(id);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    const getFullImageUrl = (url) => {
        if (!url) return null;
        if (url.startsWith('http')) return url;
        return `${BACKEND_URL}${url}`;
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const data = await api.get('/admin/orders');
            setOrders(data);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching orders:', err);
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await api.put(`/admin/orders/${id}/status`, { order_status: status });
            setOrders(orders.map(o => o.id === id ? { ...o, order_status: status } : o));
            if (selectedOrder?.id === id) {
                setSelectedOrder({ ...selectedOrder, order_status: status });
            }
        } catch (err) {
            console.error('Error updating status:', err);
        }
    };

    const viewOrderDetails = async (order) => {
        setCopiedId(null);
        setSelectedOrder(order);
        setOrderItems([]);
        try {
            const items = await api.get(`/admin/orders/${order.id}/items`);
            setOrderItems(items);
        } catch (err) {
            console.error('Error fetching order items:', err);
        }
    };

    const filteredOrders = orders.filter(o =>
        o.customer_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        o.id.toString().includes(searchQuery)
    );

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock size={16} />;
            case 'Processing': return <Package size={16} />;
            case 'Shipped': return <Truck size={16} />;
            case 'Delivered': return <Check size={16} />;
            case 'Cancelled': return <X size={16} />;
            default: return null;
        }
    };

    const STATUS_RANKS = {
        'Pending': 1,
        'Processing': 2,
        'Shipped': 3,
        'Delivered': 4,
        'Cancelled': 5
    };

    return (
        <div className="order-management animate-fade">
            <header className="page-header">
                <div>
                    <h1>Order Management</h1>
                    <p>Track and update customer deliveries</p>
                </div>
            </header>

            <div className="admin-controls glass">
                <div className="search-box">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search by order ID or customer name..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            <div className="order-content-grid">
                <div className="order-list-section admin-card">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer</th>
                                <th>Amount</th>
                                <th>Status</th>
                                <th>Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="table-loading">Loading orders...</td></tr>
                            ) : filteredOrders.map(order => (
                                <tr key={order.id} className={selectedOrder?.id === order.id ? 'active-row' : ''}>
                                    <td>#{order.id}</td>
                                    <td>
                                        <div className="customer-info">
                                            <span>{order.customer_name}</span>
                                            <span className="email-sub">{order.customer_email}</span>
                                        </div>
                                    </td>
                                    <td><strong>₹{order.total_amount}</strong></td>
                                    <td>
                                        <span className={`status-pill ${order.order_status.toLowerCase()}`}>
                                            {getStatusIcon(order.order_status)} {order.order_status}
                                        </span>
                                    </td>
                                    <td>{new Date(order.created_at).toLocaleDateString()}</td>
                                    <td>
                                        <button className="action-btn" onClick={() => viewOrderDetails(order)}>
                                            <Eye size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="order-details-sidebar">
                    {selectedOrder ? (
                        <div className={`admin-card detail-card animate-fade ${selectedOrder.order_status.toLowerCase()}`}>
                            <div className="detail-header">
                                <div className="header-top">
                                    <div className="id-section">
                                        <h2>
                                            Order #{selectedOrder.id}
                                        </h2>
                                        {/* <button 
                                            className={`copy-btn ${copiedId === selectedOrder.id ? 'copied' : ''}`}
                                            onClick={() => handleCopyId(selectedOrder.id)}
                                            title="Copy Order ID"
                                        >
                                            {copiedId === selectedOrder.id ? <Check size={18} /> : <FileText size={18} />}
                                        </button> */}
                                    </div>
                                    <div className={`status-badge-banner ${selectedOrder.order_status.toLowerCase()}`}>
                                        {getStatusIcon(selectedOrder.order_status)}
                                        <span>{selectedOrder.order_status}</span>
                                    </div>
                                </div>
                                <div className="header-meta">
                                    <div className="meta-item">
                                        <div className="meta-icon"><Calendar size={14} /></div>
                                        <span>Placed on {new Date(selectedOrder.created_at).toLocaleDateString()}</span>
                                    </div>
                                    <div className="meta-item">
                                        <div className="meta-icon"><Clock size={14} /></div>
                                        <span>at {new Date(selectedOrder.created_at).toLocaleTimeString()}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="status-updater">
                                <div className="section-label">
                                    <Truck size={14} />
                                    <span>Order Journey</span>
                                </div>
                                <div className="vertical-stepper">
                                    {['Processing', 'Shipped', 'Delivered'].map((status, index) => {
                                        const currentStatus = selectedOrder.order_status;
                                        const currentRank = STATUS_RANKS[currentStatus] || 0;
                                        const targetRank = STATUS_RANKS[status];
                                        // A step is only completed if it's a previous rank AND not a terminal state (Delivered/Cancelled)
                                        const isCompleted = targetRank < currentRank && status !== 'Delivered' && status !== 'Cancelled';
                                        const isActive = currentStatus === status;
                                        const isTerminal = currentStatus === 'Delivered' || currentStatus === 'Cancelled';
                                        const isDisabled = isTerminal || targetRank <= currentRank;

                                        return (
                                            <div key={status} className={`step-item ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''}`}>
                                                <div className="step-left">
                                                    <div className="step-dot">
                                                        {/* If cancelled, only the cancel step gets a tick. Otherwise, follow normal progression ticks. */}
                                                        {((currentStatus === 'Cancelled' ? status === 'Cancelled' : (isCompleted || isActive)) && status !== 'Delivered') || (isActive && status === 'Delivered') ? <Check size={14} /> : null}
                                                    </div>
                                                    <div className="step-line"></div>
                                                </div>
                                                <div className="step-content">
                                                    <div className="step-info">
                                                        <span className="step-title">{status}</span>
                                                        <button
                                                            className={`step-status-btn ${isActive ? 'btn-current' : isCompleted ? 'btn-past' : 'btn-proceed'}`}
                                                            onClick={(e) => {
                                                                if (isDisabled) return;
                                                                e.stopPropagation();
                                                                handleUpdateStatus(selectedOrder.id, status);
                                                            }}
                                                            disabled={isDisabled}
                                                        >
                                                            {isActive ? 'Current' : isCompleted ? 'Past' : 'Proceed'}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div className="customer-details">
                                <div className="section-label">
                                    <User size={14} />
                                    <span>Customer & Shipping</span>
                                </div>
                                <div className="detail-group">
                                    <div className="info-item">
                                        <div className="info-icon"><User size={18} /></div>
                                        <div className="info-content">
                                            <span className="info-label">Full Name</span>
                                            <span className="info-value">{selectedOrder.full_name}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon"><Mail size={18} /></div>
                                        <div className="info-content">
                                            <span className="info-label">Contact Email</span>
                                            <span className="info-value">{selectedOrder.email}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon"><Phone size={18} /></div>
                                        <div className="info-content">
                                            <span className="info-label">Phone Number</span>
                                            <span className="info-value">{selectedOrder.phone}</span>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <div className="info-icon"><MapPin size={18} /></div>
                                        <div className="info-content">
                                            <span className="info-label">Shipping Address</span>
                                            <span className="info-value">
                                                {selectedOrder.address_line1}
                                                {selectedOrder.address_line2 && `, ${selectedOrder.address_line2}`}
                                                <br />
                                                {selectedOrder.city}, {selectedOrder.state} - {selectedOrder.pincode}
                                                {selectedOrder.landmark && (
                                                    <div className="landmark-sub">Near: {selectedOrder.landmark}</div>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="items-list">
                                <div className="section-label">
                                    <Package size={14} />
                                    <span>Ordered Items</span>
                                </div>
                                <div className="items-container">
                                    {orderItems.map((item, idx) => (
                                        <div
                                            key={item.id}
                                            className="order-item-card stagger-item"
                                            style={{ animationDelay: `${idx * 0.1}s` }}
                                        >
                                            <div className="item-img-wrapper">
                                                <img src={getFullImageUrl(item.image_url)} alt={item.name} />
                                                <span className="item-qty-badge">{item.quantity}</span>
                                            </div>
                                            <div className="item-info">
                                                <div className="item-name-group">
                                                    <span className="item-name">{item.name}</span>
                                                    <span className="item-meta">₹{(parseFloat(item.subtotal) / item.quantity).toFixed(2)} × {item.quantity} units</span>
                                                </div>
                                                <span className="item-price">₹{item.subtotal}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="order-summary shimmer-bg">
                                <div className="summary-details">
                                    <div className="sum-row">
                                        <span>Items Subtotal</span>
                                        <span>₹{orderItems.reduce((acc, item) => acc + parseFloat(item.subtotal), 0).toFixed(2)}</span>
                                    </div>
                                    <div className="sum-row">
                                        <span>Tax (GST 18%)</span>
                                        <span>₹{(orderItems.reduce((acc, item) => acc + parseFloat(item.subtotal), 0) * 0.18).toFixed(2)}</span>
                                    </div>
                                    <div className="sum-row">
                                        <span>Shipping Charges</span>
                                        {orderItems.reduce((acc, item) => acc + parseFloat(item.subtotal), 0) >= 1000 ? (
                                            <span style={{ color: '#16a34a' }}>FREE</span>
                                        ) : (
                                            <span>₹50.00</span>
                                        )}
                                    </div>
                                    <div className="dash-separator"></div>
                                    <div className="sum-row total-main">
                                        <span>Grand Total</span>
                                        <span className="total-value">₹{parseFloat(selectedOrder.total_amount).toFixed(2)}</span>
                                    </div>
                                </div>

                                <div className="payment-badge">
                                    <div className="badge-left">
                                        <div className="badge-icon">
                                            <Check size={14} />
                                        </div>
                                        <span>Paid via Razorpay Secure</span>
                                    </div>
                                    <CreditCard size={14} style={{ opacity: 0.4 }} />
                                </div>
                            </div>
                            <br />

                            {/* <div className="action-toolbar">
                                <button className="tool-btn" onClick={() => window.print()}>
                                    <Printer size={16} />
                                    <span>Print Invoice</span>
                                </button>
                                <button className="tool-btn">
                                    <Mail size={16} />
                                    <span>Notify User</span>
                                </button>
                            </div> */}
                        </div>
                    ) : (
                        <div className="empty-details admin-card">
                            <Package size={48} color="#cbd5e1" />
                            <p>Select an order to view details and update status</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderManagement;
