
import mongoose from 'mongoose';
import Category from './models/Category';
import Product from './models/Product';
import Merchant from './models/Merchant';
import Invoice from './models/Invoice';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Try loading .env.local first
if (!process.env.MONGODB_URI) dotenv.config(); // Then try .env

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/stockmanagement';

console.log('Connecting to MongoDB URI:', MONGODB_URI); // Log URI for debugging

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clean up existing data (optional, but good for reliable testing)
        // await Product.deleteMany({});
        // await Category.deleteMany({});
        // await Invoice.deleteMany({});

        // Find the first merchant to associate data with
        let merchant = await Merchant.findOne();
        if (!merchant) {
            console.log('No merchant found. Creating a default merchant...');
            merchant = await Merchant.create({
                shopName: 'CraveHub Demo Store',
                ownerName: 'Demo User',
                email: 'demo@crave.hub',
                password: 'password123', // In a real app, hash this!
                phone: '9876543210',
                address: '123 Market Street',
                city: 'Bangalore',
                state: 'Karnataka',
                pincode: '560001',
                businessType: 'retail',
                isActive: true
            });
            console.log(`Created default merchant: ${merchant.shopName}`);
        } else {
            console.log(`Found existing merchant: ${merchant.shopName}`);
        }
        const merchantId = merchant._id;
        console.log(`Seeding data for merchant: ${merchant.shopName} (${merchantId})`);


        // 1. Create Categories
        const categories = [
            { name: 'Electronics', description: 'Gadgets and devices', color: '#6366f1' },
            { name: 'Clothing', description: 'Men and Women fashion', color: '#10b981' },
            { name: 'Groceries', description: 'Daily essentials', color: '#f59e0b' },
            { name: 'Home & Kitchen', description: 'Appliances and decor', color: '#ef4444' },
        ];

        const createdCategories = [];
        for (const cat of categories) {
            const existing = await Category.findOne({ merchantId, name: cat.name });
            if (!existing) {
                const newCat = await Category.create({ ...cat, merchantId, isActive: true });
                createdCategories.push(newCat);
                console.log(`Created category: ${newCat.name}`);
            } else {
                createdCategories.push(existing);
                console.log(`Category exists: ${existing.name}`);
            }
        }

        // 2. Create Products
        const products = [
            {
                name: 'Wireless Headphones',
                description: 'Noise cancelling boolean headphones',
                sku: 'WH-001',
                price: 2500,
                costPrice: 1800,
                stock: 50,
                lowStockThreshold: 10,
                unit: 'pcs',
                categoryName: 'Electronics',
                image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aGVhZHBob25lc3xlbnwwfHwwfHx8MA%3D%3D'
            },
            {
                name: 'Smart Watch',
                description: 'Fitness tracker with heart rate monitor',
                sku: 'SW-002',
                price: 3500,
                costPrice: 2200,
                stock: 30,
                lowStockThreshold: 5,
                unit: 'pcs',
                categoryName: 'Electronics',
                image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8cHJvZHVjdHxlbnwwfHwwfHx8MA%3D%3D'

            },
            {
                name: 'Cotton T-Shirt',
                description: '100% pure cotton, blue color',
                sku: 'CTS-003',
                price: 600,
                costPrice: 350,
                stock: 100,
                lowStockThreshold: 20,
                unit: 'pcs',
                categoryName: 'Clothing',
                image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8dCUyMHNoaXJ0fGVufDB8fDB8fHww'
            },
            {
                name: 'Denim Jeans',
                description: 'Slim fit blue jeans',
                sku: 'DJ-004',
                price: 1200,
                costPrice: 800,
                stock: 45,
                lowStockThreshold: 15,
                unit: 'pcs',
                categoryName: 'Clothing',
                image: 'https://images.unsplash.com/photo-1542272454315-4c01d7abdf4a?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8amVhbnN8ZW58MHx8MHx8fDA%3D'
            },
            {
                name: 'Masala Oats',
                description: 'Healthy breakfast option',
                sku: 'MO-005',
                price: 150,
                costPrice: 120,
                stock: 200,
                lowStockThreshold: 50,
                unit: 'pack',
                categoryName: 'Groceries',
                image: 'https://plus.unsplash.com/premium_photo-1671130295823-78f170465794?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b2F0c3xlbnwwfHwwfHx8MA%3D%3D'
            },
            {
                name: 'Cooking Oil',
                description: 'Refined sunflower oil, 1L',
                sku: 'CO-006',
                price: 180,
                costPrice: 150,
                stock: 8, // Low stock example
                lowStockThreshold: 10,
                unit: 'l',
                categoryName: 'Groceries',
                image: 'https://plus.unsplash.com/premium_photo-1667046830737-238d9dc10c43?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8b2lsfGVufDB8fDB8fHww'
            },
            {
                name: 'Blender',
                description: 'High speed blender for smoothies',
                sku: 'BL-007',
                price: 2000,
                costPrice: 1500,
                stock: 12,
                lowStockThreshold: 5,
                unit: 'pcs',
                categoryName: 'Home & Kitchen',
                image: 'https://images.unsplash.com/photo-1570222094114-28a9d8894566?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxlbmRlcnxlbnwwfHwwfHx8MA%3D%3D'
            }
        ];

        const createdProducts = [];
        for (const prod of products) {
            const existing = await Product.findOne({ merchantId, sku: prod.sku });
            if (!existing) {
                const category = createdCategories.find(c => c.name === prod.categoryName);
                const newProd = await Product.create({
                    ...prod,
                    merchantId,
                    categoryId: category ? category._id : null,
                    qrCode: await generateQRCode(prod.sku),
                    isActive: true
                });
                createdProducts.push(newProd);
                console.log(`Created product: ${newProd.name}`);
            } else {
                createdProducts.push(existing);
                console.log(`Product exists: ${existing.name}`);
            }
        }


        // 3. Create Dummy Invoices (Sales)
        // Generate some random sales over the last 30 days
        console.log('Generating dummy invoices...');

        const paymentMethods = ['cash', 'card', 'upi', 'credit'];
        const invoiceCount = 20;

        for (let i = 0; i < invoiceCount; i++) {
            // Random date within last 30 days
            const daysAgo = Math.floor(Math.random() * 30);
            const date = new Date();
            date.setDate(date.getDate() - daysAgo);

            // Random payment method
            const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

            // Random items for this invoice
            const numItems = Math.floor(Math.random() * 3) + 1; // 1 to 3 items
            const invoiceItems = [];
            let subtotal = 0;

            for (let j = 0; j < numItems; j++) {
                const randomProduct = createdProducts[Math.floor(Math.random() * createdProducts.length)];
                const quantity = Math.floor(Math.random() * 2) + 1; // 1 or 2 quantity
                const unitPrice = randomProduct.price;
                const totalPrice = unitPrice * quantity;

                invoiceItems.push({
                    productId: randomProduct._id,
                    productName: randomProduct.name,
                    sku: randomProduct.sku,
                    quantity,
                    unitPrice,
                    totalPrice
                });
                subtotal += totalPrice;
            }

            const taxRate = 18;
            const taxAmount = (subtotal * taxRate) / 100;
            const grandTotal = subtotal + taxAmount;

            // Create Invoice
            await Invoice.create({
                merchantId,
                invoiceNumber: `INV-${Date.now()}-${i}`,
                items: invoiceItems,
                subtotal,
                taxRate,
                taxAmount,
                discountType: 'fixed',
                discountValue: 0,
                discountAmount: 0,
                grandTotal,
                customerName: i % 3 === 0 ? 'John Doe' : undefined, // Some have names
                paymentMethod,
                paymentStatus: 'paid',
                createdAt: date,
                updatedAt: date
            });
        }
        console.log(`Created ${invoiceCount} dummy invoices.`);


        console.log('Seeding completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('Error seeding data:', error);
        process.exit(1);
    }
}

async function generateQRCode(text: string): Promise<string> {
    // Mock QR Code generation if actual lib not available in this context, 
    // but we can try to use a simple string or if you have the lib installed.
    // Since 'qrcode' package is in dependencies, let's try to import it, 
    // but in this standalone script, imports might be tricky without compilation.
    // For simplicity in this seed script, let's return a placeholder or use a simple online API format if needed.
    // Actually, let's try to use the 'qrcode' package if we run this with ts-node.
    try {
        const QRCode = require('qrcode');
        return await QRCode.toDataURL(text);
    } catch (e) {
        return `mock-qr-${text}`;
    }
}

seed();
