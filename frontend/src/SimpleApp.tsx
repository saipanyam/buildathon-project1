import React from 'react';

function SimpleApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-black to-pink-900">
      <div className="container mx-auto px-6 py-16">
        <h1 className="text-6xl font-bold text-red-500 text-center mb-8">
          🚀 UPDATED UI - Visual Memory Search 🚀
        </h1>
        
        <div className="text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-8 border border-white/20 max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4">Upload Screenshots</h2>
            <p className="text-gray-300">Drop your screenshots here to get started</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;