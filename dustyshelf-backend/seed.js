const { Book, User } = require('./models');
const { connectDB, sequelize } = require('./config/db');
const dotenv = require('dotenv');

dotenv.config();

const seedBooks = [
    {
        title: "The Midnight Library",
        author: "Matt Haig",
        category: "Fiction",
        price: 129,
        condition: "Good",
        imageUrl: "https://covers.openlibrary.org/b/id/10527843-L.jpg",
        description: "Between life and death there is a library, and within that library, the shelves go on forever.",
        stock: 10
    },
    {
        title: "Atomic Habits",
        author: "James Clear",
        category: "Self-Help",
        price: 159,
        condition: "New",
        imageUrl: "https://covers.openlibrary.org/b/id/10286124-L.jpg",
        description: "Tiny changes, remarkable results. The most comprehensive guide on building good habits.",
        stock: 5
    },
    {
        title: "1984",
        author: "George Orwell",
        category: "Classic",
        price: 89,
        condition: "Good",
        imageUrl: "https://covers.openlibrary.org/b/id/8575708-L.jpg",
        description: "A dystopian novel set in a totalitarian society where Big Brother watches everyone.",
        stock: 3
    }
];

const seed = async () => {
    try {
        await connectDB();
        
        // Create an admin user to be the seller
        const [admin] = await User.findOrCreate({
            where: { email: 'admin@dustyshelf.com' },
            defaults: {
                name: 'Admin',
                password: 'password123',
                role: 'admin'
            }
        });

        // Clear existing books
        await Book.destroy({ where: {} });

        // Add books
        const booksWithSeller = seedBooks.map(book => ({
            ...book,
            sellerId: admin.id
        }));

        await Book.bulkCreate(booksWithSeller);

        console.log('Database Seeded Successfully!');
        process.exit();
    } catch (error) {
        console.error('Seeding Error:', error);
        process.exit(1);
    }
};

seed();
