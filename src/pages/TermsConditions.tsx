import React from 'react';

const TermsConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <p className="text-gray-700 mb-4">
                For the purpose of these Terms and Conditions, the term "we", "us", "our" used anywhere on this page shall mean <strong>HireBuddy</strong>, whose registered/operational office is:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg mb-6">
                <p className="text-gray-700 font-medium">
                  <strong>Tower 2, Apartment 404, M3M Merlin, Golf Course Road Extn., Sector 67, Gurugram.</strong>
                </p>
              </div>
              <p className="text-gray-700 mb-4">
                "you", "your", "user", "visitor" shall mean any natural or legal person who is visiting our website and/or agreed to purchase from us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your use of the website and/or purchase from us are governed by the following Terms and Conditions:</h2>
              
              <ul className="list-disc list-inside text-gray-700 space-y-4">
                <li>The content of the pages of this website is subject to change without notice.</li>
                
                <li>Neither we nor any third parties provide any warranty or guarantee as to the accuracy, timeliness, performance, completeness or suitability of the information and materials found or offered on this website for any particular purpose. You acknowledge that such information and materials may contain inaccuracies or errors and we expressly exclude liability for any such inaccuracies or errors to the fullest extent permitted by law.</li>
                
                <li>Your use of any information or materials on our website and/or product pages is entirely at your own risk, for which we shall not be liable. It shall be your own responsibility to ensure that any products, services or information available through our website and/or product pages meet your specific requirements.</li>
                
                <li>Our website contains material which is owned by or licensed to us. This material includes, but is not limited to, the design, layout, look, appearance and graphics. Reproduction is prohibited other than in accordance with the copyright notice, which forms part of these terms and conditions.</li>
                
                <li>All trademarks reproduced in our website which are not the property of, or licensed to, the operator are acknowledged on the website.</li>
                
                <li>Unauthorized use of information provided by us shall give rise to a claim for damages and/or be a criminal offense.</li>
                
                <li>From time to time our website may also include links to other websites. These links are provided for your convenience to provide further information.</li>
                
                <li>You may not create a link to our website from another website or document without <strong>HireBuddy</strong>'s prior written consent.</li>
                
                <li>Any dispute arising out of use of our website and/or purchase with us and/or any engagement with us is subject to the laws of India.</li>
                
                <li>We shall be under no liability whatsoever in respect of any loss or damage arising directly or indirectly out of the decline of authorization for any transaction, on account of the cardholder having exceeded the preset limit mutually agreed by us with our acquiring bank from time to time.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Payment and Subscription Terms</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>All payments are processed securely through our payment partners</li>
                <li>Subscription fees are charged in advance and are generally non-refundable</li>
                <li>You may cancel your subscription at any time through your account settings</li>
                <li>Cancellation will be effective at the end of your current billing period</li>
                <li>We reserve the right to modify our pricing with 30 days notice</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">User Responsibilities</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>You must provide accurate and truthful information</li>
                <li>You are responsible for maintaining the confidentiality of your account</li>
                <li>You must not use our service for any unlawful purposes</li>
                <li>You must not attempt to gain unauthorized access to our systems</li>
                <li>You must comply with all applicable laws and regulations</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Service Availability</h2>
              <p className="text-gray-700 mb-4">
                We strive to provide reliable service but cannot guarantee uninterrupted availability. 
                The service is provided "as is" and "as available" without warranties of any kind.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Information</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about these Terms and Conditions, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> sharmanishant9119@gmail.com<br />
                  <strong>Address:</strong> Tower 2, Apartment 404, M3M Merlin, Golf Course Road Extn., Sector 67, Gurugram<br />
                  <strong>Legal:</strong> legal@hirebuddy.com
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsConditions; 