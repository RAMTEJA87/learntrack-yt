const mongoose = require('mongoose');
require('dotenv').config();

console.log("Testing connection to:", process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
        console.log("✅ SUCCESS: MongoDB is connected!");
        process.exit(0);
    })
    .catch((err) => {
        console.error("❌ ERROR: Could not connect to MongoDB.");
        console.error(err.message);
        process.exit(1);
    });
