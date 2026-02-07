'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, BarChart3, Package, FileText, Users, CheckCircle, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button, Loader } from '@/components/ui';

const features = [
  {
    icon: Package,
    title: 'Product Management',
    description: 'Add, edit, and track products with automatic QR code generation for quick billing.',
  },
  {
    icon: FileText,
    title: 'Smart Billing',
    description: 'Create invoices with automatic calculations for tax, discounts, and stock updates.',
  },
  {
    icon: BarChart3,
    title: 'Real-time Analytics',
    description: 'Track revenue, sales trends, and top products with beautiful charts and reports.',
  },
  {
    icon: Users,
    title: 'Staff Management',
    description: 'Add staff members with role-based access to manage your shop efficiently.',
  },
];

const benefits = [
  'Multi-merchant support',
  'Real-time stock tracking',
  'QR code scanning',
  'Automatic tax calculation',
  'Invoice generation',
  'Low stock alerts',
  'Sales reports',
  'Role-based access',
];

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  if (loading) {
    return <Loader fullScreen />;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
      {/* Navigation */}
      <nav style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        padding: '1rem 2rem',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
            <Store size={32} />
            <span>ShopLedger</span>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <Link href="/login">
              <Button variant="ghost" style={{ color: 'white' }}>Login</Button>
            </Link>
            <Link href="/register">
              <Button variant="primary" rightIcon={<ArrowRight size={18} />}>
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main>

        {/* Hero Section */}
        <section style={{
          paddingTop: '10rem',
          paddingBottom: '4rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Background decoration */}
          <div style={{
            position: 'absolute',
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '800px',
            height: '800px',
            background: 'radial-gradient(circle, rgba(99, 102, 241, 0.15) 0%, transparent 60%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 2rem', position: 'relative' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(99, 102, 241, 0.2)',
              borderRadius: '9999px',
              color: '#a5b4fc',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
            }}>
              <span>✨</span>
              <span>Trusted by 500+ retail shops</span>
            </div>

            <h1 style={{
              fontSize: 'clamp(2.5rem, 5vw, 4rem)',
              fontWeight: 800,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: '1.5rem',
            }}>
              Manage Your Shop with{' '}
              <span style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>
                ShopLedger
              </span>
            </h1>

            <p style={{
              fontSize: '1.25rem',
              color: '#94a3b8',
              maxWidth: '600px',
              margin: '0 auto 2.5rem',
              lineHeight: 1.6,
            }}>
              The ultimate solution for retail shops to manage inventory, sales, and staff in one place.
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/register">
                <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
                  Start Your ShopLedger
                </Button>
              </Link>
              <Button
                variant="secondary"
                size="lg"
                style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}
                onClick={() => document.getElementById('demo-section')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Watch Demo
              </Button>
            </div>
          </div>
        </section>

        {/* Demo Section */}
        <section id="demo-section" style={{ padding: '4rem 2rem', maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{
            background: 'rgba(15, 23, 42, 0.6)',
            borderRadius: '1.5rem',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            overflow: 'hidden',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
          }}>
            <DemoTabs />
          </div>
        </section>

        {/* Features Section */}
        <section style={{ padding: '6rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
              Everything You Need to Run Your Shop
            </h2>
            <p style={{ fontSize: '1.125rem', color: '#94a3b8', maxWidth: '600px', margin: '0 auto' }}>
              Powerful features designed for retail businesses of all sizes
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }}>
            {features.map((feature, index) => (
              <div
                key={index}
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '1rem',
                  padding: '2rem',
                  transition: 'all 0.3s',
                }}
              >
                <div style={{
                  width: '3.5rem',
                  height: '3.5rem',
                  background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.2) 0%, rgba(168, 85, 247, 0.2) 100%)',
                  borderRadius: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '1.25rem',
                }}>
                  <feature.icon size={24} color="#a5b4fc" />
                </div>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'white', marginBottom: '0.75rem' }}>
                  {feature.title}
                </h3>
                <p style={{ color: '#94a3b8', lineHeight: 1.6 }}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Benefits Section */}
        <section style={{ padding: '4rem 2rem', background: 'rgba(99, 102, 241, 0.05)' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '3rem',
              alignItems: 'center',
            }}>
              <div>
                <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
                  Built for Modern Retail
                </h2>
                <p style={{ color: '#94a3b8', marginBottom: '2rem', lineHeight: 1.7 }}>
                  ShopLedger is designed with real retail challenges in mind. From inventory tracking to billing,
                  every feature is optimized for efficiency and ease of use.
                </p>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '1rem',
                }}>
                  {benefits.map((benefit, index) => (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <CheckCircle size={20} color="#10b981" />
                      <span style={{ color: '#e2e8f0', fontSize: '0.9375rem' }}>{benefit}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
                borderRadius: '1.5rem',
                padding: '2rem',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}>
                <div style={{
                  background: 'rgba(15, 23, 42, 0.8)',
                  borderRadius: '1rem',
                  padding: '1.5rem',
                  marginBottom: '1rem',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ color: '#94a3b8', fontSize: '0.875rem' }}>Today&apos;s Revenue</span>
                    <span style={{ color: '#10b981', fontSize: '0.875rem' }}>+12.5%</span>
                  </div>
                  <div style={{ color: 'white', fontSize: '2rem', fontWeight: 700 }}>₹45,250</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '0.75rem', padding: '1rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Products</div>
                    <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600 }}>248</div>
                  </div>
                  <div style={{ background: 'rgba(15, 23, 42, 0.8)', borderRadius: '0.75rem', padding: '1rem' }}>
                    <div style={{ color: '#94a3b8', fontSize: '0.8125rem' }}>Orders</div>
                    <div style={{ color: 'white', fontSize: '1.25rem', fontWeight: 600 }}>32</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section style={{ padding: '6rem 2rem', textAlign: 'center' }}>
          <div style={{ maxWidth: '600px', margin: '0 auto' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 700, color: 'white', marginBottom: '1rem' }}>
              Ready to Transform Your Business?
            </h2>
            <p style={{ color: '#94a3b8', marginBottom: '2rem', fontSize: '1.125rem' }}>
              Join thousands of merchants who trust ShopLedger for their daily operations.
            </p>
            <Link href="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
                Get Started for Free
              </Button>
            </Link>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer style={{
        padding: '4rem 2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem', color: 'white', fontSize: '1.5rem', fontWeight: 700 }}>
            <Store size={28} />
            <span>ShopLedger</span>
          </div>
          <p style={{ color: '#64748b', fontSize: '0.9375rem', maxWidth: '400px', margin: '0 auto' }}>
            The smarter way to manage your retail business. Real-time insights, effortless billing, and more.
          </p>
          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.05)', paddingTop: '2rem' }}>
            <p style={{ color: '#475569', fontSize: '0.875rem' }}>
              © 2026 ShopLedger. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

const DemoTabs = () => {
  const [activeTab, setActiveTab] = React.useState('dashboard');

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Inventory', icon: Package },
    { id: 'billing', label: 'Billing POS', icon: ShoppingCart },
  ];

  return (
    <div>
      {/* Tab Nav */}
      <div style={{
        display: 'flex',
        gap: '1rem',
        padding: '1rem 2rem',
        background: 'rgba(255, 255, 255, 0.05)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                padding: '0.75rem 1.25rem',
                borderRadius: '0.75rem',
                border: 'none',
                background: isActive ? 'var(--color-primary-500)' : 'transparent',
                color: isActive ? 'white' : '#94a3b8',
                fontSize: '0.9375rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={18} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div style={{ padding: '2rem', height: '600px', overflow: 'hidden' }}>
        <div style={{
          background: '#f8fafc',
          height: '100%',
          borderRadius: '1rem',
          padding: '1.5rem',
          color: '#1e293b',
          boxShadow: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)'
        }}>
          {activeTab === 'dashboard' && <DashboardMockup />}
          {activeTab === 'products' && <ProductsMockup />}
          {activeTab === 'billing' && <BillingMockup />}
        </div>
      </div>
    </div>
  );
};

const DashboardMockup = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Dashboard Overview</h3>
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem' }}>
      {[
        { label: 'Total Revenue', value: '₹2,18,968', sub: '+12.5% vs last month', color: '#6366f1' },
        { label: 'Today\'s Sales', value: '₹14,514', sub: '32 orders today', color: '#10b981' },
        { label: 'Total Products', value: '10', sub: 'In 5 categories', color: '#3b82f6' },
        { label: 'Low Stock', value: '3', sub: 'Items need attention', color: '#f59e0b' },
      ].map((stat, i) => (
        <div key={i} style={{ background: 'white', padding: '1.25rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0' }}>
          <div style={{ color: '#64748b', fontSize: '0.75rem', fontWeight: 500, marginBottom: '0.5rem' }}>{stat.label}</div>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#0f172a' }}>{stat.value}</div>
          <div style={{ fontSize: '0.75rem', color: stat.sub.includes('+') ? '#10b981' : '#64748b', marginTop: '0.25rem' }}>{stat.sub}</div>
        </div>
      ))}
    </div>
    <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0', height: '300px' }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Revenue Overview</div>
        {/* Mock Chart */}
        <div style={{ width: '100%', height: '200px', display: 'flex', alignItems: 'flex-end', gap: '0.5rem' }}>
          {[40, 60, 45, 80, 55, 90, 75, 100, 85, 120, 110, 150].map((h, i) => (
            <div key={i} style={{ flex: 1, height: `${h}px`, background: 'rgba(99, 102, 241, 0.1)', borderTop: '2px solid #6366f1' }} />
          ))}
        </div>
      </div>
      <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
        <div style={{ fontWeight: 600, marginBottom: '1rem' }}>Top Products</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {['Cotton T-Shirt', 'Blender', 'Smart Watch'].map((p, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem' }}>{p}</span>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>₹{(i + 1) * 2000}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const ProductsMockup = () => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a' }}>Inventory List</h3>
      <button style={{ padding: '0.5rem 1rem', background: '#6366f1', color: 'white', border: 'none', borderRadius: '0.5rem', cursor: 'pointer' }}>+ Add Product</button>
    </div>
    <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
        <thead style={{ background: '#f1f5f9' }}>
          <tr>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Product</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Category</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Price</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Stock</th>
            <th style={{ padding: '1rem', textAlign: 'left' }}>Status</th>
          </tr>
        </thead>
        <tbody>
          {[
            { name: 'Blender', cat: 'HOME & KITCHEN', price: '₹2,000', stock: '12 pcs', status: 'IN STOCK' },
            { name: 'Cooking Oil', cat: 'GROCERIES', price: '₹180', stock: '8 l', status: 'LOW STOCK' },
            { name: 'Smart Watch', cat: 'ELECTRONICS', price: '₹3,500', stock: '30 pcs', status: 'IN STOCK' },
          ].map((row, i) => (
            <tr key={i} style={{ borderBottom: '1px solid #f1f5f9' }}>
              <td style={{ padding: '1rem' }}>{row.name}</td>
              <td style={{ padding: '1rem' }}><span style={{ padding: '0.25rem 0.5rem', borderRadius: '0.25rem', background: '#eef2ff', color: '#4f46e5', fontSize: '0.75rem' }}>{row.cat}</span></td>
              <td style={{ padding: '1rem' }}>{row.price}</td>
              <td style={{ padding: '1rem' }}>{row.stock}</td>
              <td style={{ padding: '1rem' }}>
                <span style={{
                  padding: '0.25rem 0.5rem',
                  borderRadius: '99px',
                  background: row.status === 'IN STOCK' ? '#dcfce7' : '#fef3c7',
                  color: row.status === 'IN STOCK' ? '#15803d' : '#92400e',
                  fontSize: '0.75rem',
                  fontWeight: 600
                }}>
                  {row.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const BillingMockup = () => (
  <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '1.5rem', height: '100%' }}>
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ background: 'white', padding: '1rem', borderRadius: '0.75rem', border: '1px solid #e2e8f0', display: 'flex', gap: '1rem' }}>
        <input type="text" placeholder="Search product..." style={{ flex: 1, padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
        <button style={{ padding: '0.75rem', background: '#f1f5f9', border: 'none', borderRadius: '0.5rem' }}>Scan QR</button>
      </div>
      <div style={{ background: 'white', borderRadius: '0.75rem', border: '1px solid #e2e8f0', overflow: 'hidden', flex: 1 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: '#f1f5f9' }}>
            <tr>
              <th style={{ padding: '0.75rem', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '0.75rem', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '0.75rem', textAlign: 'right' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '0.75rem' }}>Samsung TV 55"</td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹45,000</td>
              <td style={{ padding: '0.75rem', textAlign: 'center' }}>1</td>
              <td style={{ padding: '0.75rem', textAlign: 'right' }}>₹45,000</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div style={{ background: 'white', padding: '1.5rem', borderRadius: '1rem', border: '1px solid #e2e8f0' }}>
      <h4 style={{ fontWeight: 700, marginBottom: '1rem' }}>Bill Summary</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div style={{ fontSize: '0.875rem' }}>
          <div style={{ color: '#64748b' }}>Customer</div>
          <div style={{ fontWeight: 500 }}>Walk-in Customer</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ color: '#64748b', fontSize: '0.8125rem' }}>Payment Method</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
            <div style={{ padding: '0.5rem', border: '2px solid #6366f1', borderRadius: '0.5rem', fontSize: '0.75rem', textAlign: 'center', background: '#eff6ff' }}>Cash</div>
            <div style={{ padding: '0.5rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontSize: '0.75rem', textAlign: 'center' }}>UPI</div>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1rem', marginTop: 'auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
            <span>Subtotal</span>
            <span>₹45,000</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem', fontWeight: 800, color: '#6366f1' }}>
            <span>Total</span>
            <span>₹45,000</span>
          </div>
        </div>
        <button style={{ marginTop: '1rem', width: '100%', padding: '1rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.75rem', fontWeight: 700, cursor: 'pointer' }}>Complete Sale</button>
      </div>
    </div>
  </div>
);
