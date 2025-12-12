// Test MongoDB Connection
const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI;

console.log('🔍 Testing MongoDB Connection...');
console.log('URI:', MONGODB_URI?.replace(/:[^:]*@/, ':****@')); // Hide password

async function testConnection() {
  try {
    console.log('\n⏳ Connecting to MongoDB Atlas...');
    
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 10000, // 10 seconds timeout
      socketTimeoutMS: 45000,
    });
    
    console.log('✅ MongoDB Connected Successfully!');
    console.log('📊 Database:', mongoose.connection.db.databaseName);
    console.log('🌐 Host:', mongoose.connection.host);
    
    // Test query
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\n📁 Collections:', collections.map(c => c.name).join(', '));
    
    // Close connection
    await mongoose.connection.close();
    console.log('\n✅ Test completed successfully!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ MongoDB Connection Failed!');
    console.error('Error:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.log('\n🔧 Possible Solutions:');
      console.log('1. Check MongoDB Atlas IP Whitelist:');
      console.log('   - Go to: https://cloud.mongodb.com');
      console.log('   - Select your cluster');
      console.log('   - Network Access → Add IP Address');
      console.log('   - Add: 0.0.0.0/0 (Allow from anywhere) for testing');
      console.log('');
      console.log('2. Check your internet connection');
      console.log('');
      console.log('3. Verify cluster is active (not paused)');
      console.log('   - Go to Database → Clusters');
      console.log('   - Resume if paused');
    }
    
    if (error.message.includes('authentication failed')) {
      console.log('\n🔧 Fix:');
      console.log('1. Verify username/password in .env');
      console.log('2. Check special characters are URL encoded');
      console.log('3. Reset database user password in Atlas');
    }
    
    process.exit(1);
  }
}

testConnection();
