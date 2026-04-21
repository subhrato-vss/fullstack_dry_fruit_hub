import React from 'react';
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Users,
    Warehouse,
    BrainCircuit,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Home,
    Tags
} from 'lucide-react';
import './AdminSidebar.css';

const AdminSidebar = ({ isCollapsed, toggleSidebar, onLogout }) => {
    const navItems = [
        { path: '/admin/dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
        { path: '/admin/categories', icon: <Tags size={20} />, label: 'Categories' },
        { path: '/admin/products', icon: <Package size={20} />, label: 'Products' },
        { path: '/admin/orders', icon: <ShoppingBag size={20} />, label: 'Orders' },
        { path: '/admin/users', icon: <Users size={20} />, label: 'Users' },
        { path: '/admin/inventory', icon: <Warehouse size={20} />, label: 'Inventory' },
    ];

    return (
        <aside className={`admin-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="admin-brand-logo">
                    <img src="/logo-2.png" alt="DryFruit Hub Logo" className="admin-logo-img" />
                    {!isCollapsed && <span>DryFruit Hub</span>}
                </div>
                <button className="toggle-btn" onClick={toggleSidebar}>
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                    >
                        <span className="icon">{item.icon}</span>
                        {!isCollapsed && <span className="label">{item.label}</span>}
                    </NavLink>
                ))}
            </nav>

            <div className="sidebar-footer">
                {/* <NavLink to="/" className="nav-item">
                    <span className="icon"><Home size={20} /></span>
                    {!isCollapsed && <span className="label">Back to Store</span>}
                </NavLink> */}
                <button className="nav-item logout-btn" onClick={onLogout}>
                    <span className="icon"><LogOut size={20} /></span>
                    {!isCollapsed && <span className="label">Logout</span>}
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
