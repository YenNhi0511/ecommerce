// Script to generate new seed route with local images
const fs = require('fs');
const path = require('path');

// Image mapping
const imageMap = {
  smartphones: Array.from({length: 12}, (_, i) => `/products/phone-${i + 1}.jpg`),
  laptops: Array.from({length: 6}, (_, i) => `/products/laptop-${i + 1}.jpg`),
  tablets: Array.from({length: 5}, (_, i) => `/products/tablet-${i + 1}.jpg`),
  accessories: Array.from({length: 8}, (_, i) => `/products/accessory-${i + 1}.jpg`),
};

console.log('Image mapping created:');
console.log(JSON.stringify(imageMap, null, 2));
console.log('\n✅ Now update seed/route.ts to use these paths instead of Unsplash URLs');
console.log('\nExample:');
console.log('  OLD: image: "https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&q=80&w=800",');
console.log('  NEW: image: "/products/phone-1.jpg",');
