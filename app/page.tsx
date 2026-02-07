'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Store, ArrowRight, BarChart3, Package, FileText, Users, CheckCircle } from 'lucide-react';
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
            <span>StockFlow</span>
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

      {/* Hero Section */}
      <section style={{
        paddingTop: '10rem',
        paddingBottom: '6rem',
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
              StockFlow
            </span>
          </h1>

          <p style={{
            fontSize: '1.25rem',
            color: '#94a3b8',
            maxWidth: '600px',
            margin: '0 auto 2.5rem',
            lineHeight: 1.6,
          }}>
            The complete stock management and billing solution for retail shops.
            Track products, create invoices, and grow your business effortlessly.
          </p>

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
                Start Free Trial
              </Button>
            </Link>
            <Button variant="secondary" size="lg" style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'white' }}>
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section style={{ padding: '4rem 2rem', maxWidth: '1280px', margin: '0 auto' }}>
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
                StockFlow is designed with real retail challenges in mind. From inventory tracking to billing,
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
            Join thousands of merchants who trust StockFlow for their daily operations.
          </p>
          <Link href="/register">
            <Button variant="primary" size="lg" rightIcon={<ArrowRight size={20} />}>
              Get Started for Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        padding: '2rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.1)',
        textAlign: 'center',
      }}>
        <p style={{ color: '#64748b', fontSize: '0.875rem' }}>
          © 2026 StockFlow. All rights reserved.
        </p>
      </footer>
    </div>
  );
}
