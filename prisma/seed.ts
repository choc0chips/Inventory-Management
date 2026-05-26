// Seed script for StockWise database

import path from "path";
import { fileURLToPath } from "url";

async function main(): Promise<void> {
  const { PrismaClient } = await import("../app/generated/prisma/client");
  const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");

  // Resolve db path relative to project root (dev.db is at project root)
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const dbPath = path.join(__dirname, "..", "dev.db");
  const adapter = new PrismaBetterSqlite3({ url: `file:${dbPath}` });
  const prisma = new PrismaClient({ adapter });

  try {
    // Clear existing data
    await prisma.stockMovement.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.supplier.deleteMany();

    // Create Categories
    const categories = await Promise.all([
      prisma.category.create({ data: { name: "Electronics" } }),
      prisma.category.create({ data: { name: "Office Supplies" } }),
      prisma.category.create({ data: { name: "Furniture" } }),
      prisma.category.create({ data: { name: "Raw Materials" } }),
      prisma.category.create({ data: { name: "Cleaning Supplies" } }),
    ]);

    // Create Suppliers
    const suppliers = await Promise.all([
      prisma.supplier.create({ data: { name: "TechDistro Inc.", email: "sales@techdistro.com", phone: "+1-555-0101", address: "1200 Innovation Blvd, San Jose, CA 95134" } }),
      prisma.supplier.create({ data: { name: "GlobalParts Ltd.", email: "orders@globalparts.co.uk", phone: "+44-20-7946-0958", address: "47 Commerce Row, London EC2A 1AF, UK" } }),
      prisma.supplier.create({ data: { name: "PrimeStock Solutions", email: "contact@primestock.com", phone: "+1-555-0202", address: "890 Warehouse Dr, Dallas, TX 75201" } }),
      prisma.supplier.create({ data: { name: "EcoSupply Co.", email: "info@ecosupply.com", phone: "+1-555-0303", address: "340 Green Way, Portland, OR 97201" } }),
    ]);

    // Create Products
    const products = await Promise.all([
      prisma.product.create({ data: { name: 'Wireless Bluetooth Speaker', sku: 'ELEC-SPK-001', productType: 'TRADING', price: 49.99, costPrice: 28.50, quantity: 120, lowStockAlert: 15, unit: 'pcs', categoryId: categories[0].id, supplierId: suppliers[0].id } }),
      prisma.product.create({ data: { name: 'USB-C Charging Cable 2m', sku: 'ELEC-CBL-002', productType: 'TRADING', price: 12.99, costPrice: 4.20, quantity: 350, lowStockAlert: 50, unit: 'pcs', categoryId: categories[0].id, supplierId: suppliers[0].id } }),
      prisma.product.create({ data: { name: 'Mechanical Keyboard RGB', sku: 'ELEC-KBD-003', productType: 'ASSET', price: 89.99, costPrice: 52.00, quantity: 45, lowStockAlert: 10, unit: 'pcs', categoryId: categories[0].id, supplierId: suppliers[1].id } }),
      prisma.product.create({ data: { name: 'A4 Copy Paper (500 sheets)', sku: 'OFFC-PPR-001', productType: 'CONSUMABLE', price: 6.99, costPrice: 3.50, quantity: 8, lowStockAlert: 20, unit: 'reams', categoryId: categories[1].id, supplierId: suppliers[2].id } }),
      prisma.product.create({ data: { name: 'Ballpoint Pens (Box of 50)', sku: 'OFFC-PEN-002', productType: 'CONSUMABLE', price: 14.99, costPrice: 7.80, quantity: 5, lowStockAlert: 10, unit: 'boxes', categoryId: categories[1].id, supplierId: suppliers[2].id } }),
      prisma.product.create({ data: { name: 'Ergonomic Office Chair', sku: 'FURN-CHR-001', productType: 'ASSET', price: 349.99, costPrice: 210.00, quantity: 18, lowStockAlert: 5, unit: 'pcs', categoryId: categories[2].id, supplierId: suppliers[1].id } }),
      prisma.product.create({ data: { name: 'Standing Desk 160cm', sku: 'FURN-DSK-002', productType: 'ASSET', price: 599.99, costPrice: 380.00, quantity: 12, lowStockAlert: 3, unit: 'pcs', categoryId: categories[2].id, supplierId: suppliers[1].id } }),
      prisma.product.create({ data: { name: 'Steel Bolts M8x50 (Pack 100)', sku: 'RAW-BLT-001', productType: 'TRADING', price: 24.99, costPrice: 12.40, quantity: 200, lowStockAlert: 30, unit: 'packs', categoryId: categories[3].id, supplierId: suppliers[3].id } }),
      prisma.product.create({ data: { name: 'Aluminum Sheet 1.5mm', sku: 'RAW-ALU-002', productType: 'TRADING', price: 35.00, costPrice: 19.50, quantity: 75, lowStockAlert: 10, unit: 'sheets', categoryId: categories[3].id, supplierId: suppliers[3].id } }),
      prisma.product.create({ data: { name: 'Industrial Degreaser 5L', sku: 'CLN-DGR-001', productType: 'CONSUMABLE', price: 18.50, costPrice: 9.00, quantity: 3, lowStockAlert: 5, unit: 'bottles', categoryId: categories[4].id, supplierId: suppliers[3].id } }),
      prisma.product.create({ data: { name: 'Microfiber Cleaning Cloths (10pk)', sku: 'CLN-CLT-002', productType: 'CONSUMABLE', price: 9.99, costPrice: 4.20, quantity: 0, lowStockAlert: 8, unit: 'packs', categoryId: categories[4].id, supplierId: suppliers[3].id } }),
      prisma.product.create({ data: { name: 'Wireless Mouse Ergonomic', sku: 'ELEC-MOU-004', productType: 'TRADING', price: 29.99, costPrice: 14.50, quantity: 85, lowStockAlert: 15, unit: 'pcs', categoryId: categories[0].id, supplierId: suppliers[0].id } }),
      prisma.product.create({ data: { name: 'Monitor Stand Adjustable', sku: 'FURN-MNT-003', productType: 'ASSET', price: 79.99, costPrice: 42.00, quantity: 30, lowStockAlert: 5, unit: 'pcs', categoryId: categories[2].id, supplierId: suppliers[1].id } }),
      prisma.product.create({ data: { name: 'Copper Wire 2.5mm (100m)', sku: 'RAW-COP-003', productType: 'TRADING', price: 45.00, costPrice: 28.00, quantity: 40, lowStockAlert: 8, unit: 'rolls', categoryId: categories[3].id, supplierId: suppliers[3].id } }),
      prisma.product.create({ data: { name: 'Sticky Notes (12 pads)', sku: 'OFFC-STK-003', productType: 'CONSUMABLE', price: 8.99, costPrice: 3.80, quantity: 25, lowStockAlert: 10, unit: 'packs', categoryId: categories[1].id, supplierId: suppliers[2].id } }),
      prisma.product.create({ data: { name: 'Webcam HD 1080p', sku: 'ELEC-WBC-005', productType: 'TRADING', price: 64.99, costPrice: 35.00, quantity: 55, lowStockAlert: 10, unit: 'pcs', categoryId: categories[0].id, supplierId: suppliers[0].id } }),
    ]);

    // Create Stock Movements
    const now = new Date();
    const movementData = [
      { productIdx: 0, type: 'RESTOCK', quantity: 50, note: 'Initial bulk order', monthsAgo: 5 },
      { productIdx: 1, type: 'RESTOCK', quantity: 200, note: 'Warehouse restock', monthsAgo: 5 },
      { productIdx: 2, type: 'RESTOCK', quantity: 30, note: 'New inventory batch', monthsAgo: 5 },
      { productIdx: 5, type: 'RESTOCK', quantity: 20, note: 'Furniture order arrived', monthsAgo: 4 },
      { productIdx: 0, type: 'SALE', quantity: 12, note: 'Online orders batch', monthsAgo: 4 },
      { productIdx: 1, type: 'SALE', quantity: 45, note: 'Retail channel sales', monthsAgo: 4 },
      { productIdx: 3, type: 'RESTOCK', quantity: 50, note: 'Paper supply delivery', monthsAgo: 4 },
      { productIdx: 7, type: 'RESTOCK', quantity: 100, note: 'Steel bolt shipment', monthsAgo: 3 },
      { productIdx: 0, type: 'SALE', quantity: 8, note: 'Corporate order', monthsAgo: 3 },
      { productIdx: 2, type: 'DAMAGE', quantity: 2, note: 'Shipping damage', monthsAgo: 3 },
      { productIdx: 4, type: 'RESTOCK', quantity: 25, note: 'Pen supply delivery', monthsAgo: 3 },
      { productIdx: 5, type: 'SALE', quantity: 3, note: 'Client office setup', monthsAgo: 3 },
      { productIdx: 6, type: 'RESTOCK', quantity: 8, note: 'Standing desk delivery', monthsAgo: 2 },
      { productIdx: 8, type: 'SALE', quantity: 15, note: 'Manufacturing order', monthsAgo: 2 },
      { productIdx: 9, type: 'SALE', quantity: 5, note: 'Cleaning crew supply', monthsAgo: 2 },
      { productIdx: 1, type: 'SALE', quantity: 30, note: 'Wholesale batch', monthsAgo: 2 },
      { productIdx: 3, type: 'SALE', quantity: 22, note: 'Office consumption', monthsAgo: 2 },
      { productIdx: 11, type: 'RESTOCK', quantity: 40, note: 'Mouse inventory restock', monthsAgo: 1 },
      { productIdx: 0, type: 'RETURN', quantity: 3, note: 'Customer return — defective', monthsAgo: 1 },
      { productIdx: 7, type: 'SALE', quantity: 35, note: 'Construction project order', monthsAgo: 1 },
      { productIdx: 12, type: 'RESTOCK', quantity: 15, note: 'Monitor stand delivery', monthsAgo: 1 },
      { productIdx: 4, type: 'SALE', quantity: 8, note: 'Office distribution', monthsAgo: 1 },
      { productIdx: 13, type: 'RESTOCK', quantity: 20, note: 'Copper wire shipment', monthsAgo: 1 },
      { productIdx: 10, type: 'SALE', quantity: 10, note: 'Cleaning supply order', monthsAgo: 0 },
      { productIdx: 15, type: 'RESTOCK', quantity: 25, note: 'Webcam stock delivery', monthsAgo: 0 },
      { productIdx: 0, type: 'SALE', quantity: 15, note: 'Flash sale event', monthsAgo: 0 },
      { productIdx: 6, type: 'SALE', quantity: 2, note: 'Remote workspace setup', monthsAgo: 0 },
      { productIdx: 8, type: 'ADJUSTMENT', quantity: 5, note: 'Physical count correction', monthsAgo: 0 },
      { productIdx: 3, type: 'RESTOCK', quantity: 30, note: 'Emergency paper order', monthsAgo: 0 },
      { productIdx: 11, type: 'SALE', quantity: 10, note: 'Tech accessories order', monthsAgo: 0 },
      { productIdx: 14, type: 'SALE', quantity: 5, note: 'Office supplies distribution', monthsAgo: 0 },
      { productIdx: 9, type: 'DAMAGE', quantity: 2, note: 'Container leak — product ruined', monthsAgo: 0 },
    ];

    for (const m of movementData) {
      const date = new Date(now.getFullYear(), now.getMonth() - m.monthsAgo, Math.floor(Math.random() * 28) + 1);
      await prisma.stockMovement.create({
        data: {
          productId: products[m.productIdx].id,
          type: m.type,
          quantity: m.quantity,
          note: m.note,
          date,
        },
      });
    }

    const totalProducts = await prisma.product.count();
    const totalMovements = await prisma.stockMovement.count();
    process.stdout.write(`Seeded: ${totalProducts} products, ${totalMovements} movements\n`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  process.stderr.write(String(e) + "\n");
  process.exit(1);
});
