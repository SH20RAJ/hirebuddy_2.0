import React from 'react';

const CancellationRefund = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Cancellation and Refund Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Introduction</h2>
              <p className="text-gray-700 mb-4">
                This Cancellation and Refund Policy ("Policy") governs the terms and conditions for cancellations 
                and refunds related to services provided by Hirebuddy. By using our services, you agree to be 
                bound by this Policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Subscription Services</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Cancellation Policy</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>You may cancel your subscription at any time through your account dashboard</li>
                <li>Cancellation will be effective at the end of your current billing period</li>
                <li>You will continue to have access to premium features until the end of your paid period</li>
                <li>No partial refunds will be provided for unused portions of subscription periods</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Refund Policy</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Refunds are generally not provided for subscription services</li>
                <li>Refunds may be considered on a case-by-case basis for technical issues or service failures</li>
                <li>Refund requests must be submitted within 7 days of the billing date</li>
                <li>Refunds, if approved, will be processed within 7-10 business days</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. One-time Services</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Resume Building Services</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Cancellation requests must be made within 24 hours of purchase</li>
                <li>Once work has commenced on your resume, cancellation may not be possible</li>
                <li>Refunds for one-time services are evaluated on a case-by-case basis</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Career Consultation Services</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Consultation sessions can be rescheduled up to 24 hours before the scheduled time</li>
                <li>Cancellations made less than 24 hours in advance may not be eligible for refunds</li>
                <li>No-shows will not be eligible for refunds</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Refund Process</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 How to Request a Refund</h3>
              <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
                <li>Contact our support team at support@hirebuddy.com</li>
                <li>Provide your order/transaction ID and reason for refund request</li>
                <li>Include any relevant documentation or screenshots</li>
                <li>Allow 3-5 business days for initial review</li>
              </ol>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Refund Processing</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Approved refunds will be processed to the original payment method</li>
                <li>Processing time: 7-10 business days for credit/debit cards</li>
                <li>Processing time: 3-5 business days for digital wallets</li>
                <li>Bank processing times may vary and are beyond our control</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Exceptions and Special Circumstances</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 Technical Issues</h3>
              <p className="text-gray-700 mb-4">
                If you experience technical difficulties that prevent you from using our services, 
                we will work to resolve the issue. If resolution is not possible, a refund may be considered.
              </p>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Service Unavailability</h3>
              <p className="text-gray-700 mb-4">
                In cases where our services are unavailable for extended periods due to maintenance 
                or technical issues, we may provide service credits or refunds at our discretion.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Non-Refundable Items</h2>
              <p className="text-gray-700 mb-4">The following items are generally non-refundable:</p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Completed resume building services</li>
                <li>Delivered consultation sessions</li>
                <li>Downloaded templates or resources</li>
                <li>Services used for more than 30 days</li>
                <li>Promotional or discounted services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Dispute Resolution</h2>
              <p className="text-gray-700 mb-4">
                If you have a dispute regarding a cancellation or refund, please contact our support team first. 
                We are committed to resolving issues fairly and promptly. If you are not satisfied with our 
                response, you may escalate the matter through the appropriate consumer protection channels 
                in your jurisdiction.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify this Cancellation and Refund Policy at any time. 
                Changes will be effective immediately upon posting on our website. Your continued use 
                of our services after any changes constitutes acceptance of the new policy.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about this Cancellation and Refund Policy or to request a refund, 
                please contact us at:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> support@hirebuddy.com<br />
                  <strong>Phone:</strong> +91-XXXXXXXXXX<br />
                  <strong>Address:</strong> [Your Business Address]<br />
                  <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM IST
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CancellationRefund; 