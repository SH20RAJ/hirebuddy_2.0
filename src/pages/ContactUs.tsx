import React from 'react';

const ContactUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Contact Us</h1>
          
          <div className="space-y-6">
            <p className="text-gray-600 mb-6">
              Last updated on Jul 11 2025
            </p>
            
            <p className="text-gray-700 mb-6">
              You may contact us using the information below:
            </p>
            
            <div className="space-y-4">
              <div>
                <span className="font-semibold text-gray-900">Merchant Legal entity name:</span>
                <span className="text-gray-700 ml-2">NISHANT SHARMA</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-900">Registered Address:</span>
                <span className="text-gray-700 ml-2">Hostel 6 Birla Institute of Technology Mesra Ranchi JHARKHAND 835215</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-900">Telephone No:</span>
                <span className="text-gray-700 ml-2">7814695677</span>
              </div>
              
              <div>
                <span className="font-semibold text-gray-900">E-Mail ID:</span>
                <span className="text-gray-700 ml-2">sharmanishant9119@gmail.com</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactUs; 