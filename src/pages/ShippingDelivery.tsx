import React from 'react';

const ShippingDelivery = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shipping and Delivery Policy</h1>
          
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
                This Shipping and Delivery Policy ("Policy") outlines the terms and conditions for the 
                delivery of digital services and products provided by Hirebuddy. As a digital career 
                services platform, most of our offerings are delivered electronically.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. Digital Service Delivery</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.1 Immediate Access Services</h3>
              <p className="text-gray-700 mb-4">
                The following services are delivered immediately upon successful payment:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Premium account access and features</li>
                <li>Resume templates and builders</li>
                <li>Job search tools and filters</li>
                <li>AI-powered job recommendations</li>
                <li>Application tracking features</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">2.2 Scheduled Services</h3>
              <p className="text-gray-700 mb-4">
                Some services require scheduling and are delivered at agreed times:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>One-on-one career consultation sessions</li>
                <li>Resume review and feedback sessions</li>
                <li>Interview preparation coaching</li>
                <li>Custom resume writing services</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Delivery Methods</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 Platform Access</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Services are primarily delivered through our web platform</li>
                <li>Access is granted through your registered account</li>
                <li>Features are activated automatically upon successful payment</li>
                <li>No physical shipping is required for platform access</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 Email Delivery</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Resume documents delivered as PDF attachments</li>
                <li>Job alerts and recommendations sent via email</li>
                <li>Consultation session links and materials</li>
                <li>Account notifications and updates</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Video Conferencing</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Live consultation sessions conducted via video calls</li>
                <li>Meeting links provided 24 hours in advance</li>
                <li>Session recordings available for 30 days (where applicable)</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Delivery Timeframes</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.1 Instant Delivery</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Premium account activation: Immediate</li>
                <li>Template access: Immediate</li>
                <li>Platform features: Immediate</li>
                <li>Digital downloads: Immediate</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.2 Custom Services</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Custom resume writing: 3-5 business days</li>
                <li>Resume review and feedback: 24-48 hours</li>
                <li>Cover letter writing: 2-3 business days</li>
                <li>LinkedIn profile optimization: 2-4 business days</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">4.3 Consultation Services</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Session scheduling: Within 24 hours of booking</li>
                <li>Confirmation and meeting links: 24 hours before session</li>
                <li>Follow-up materials: Within 24 hours after session</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Delivery Requirements</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.1 User Requirements</h3>
              <p className="text-gray-700 mb-4">
                To ensure successful delivery of our services, users must:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Provide a valid email address</li>
                <li>Maintain an active account with current contact information</li>
                <li>Have a stable internet connection for video consultations</li>
                <li>Use supported browsers and devices</li>
                <li>Check spam/junk folders for email communications</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">5.2 Technical Requirements</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Modern web browser (Chrome, Firefox, Safari, Edge)</li>
                <li>Stable internet connection (minimum 1 Mbps for video calls)</li>
                <li>Email client capable of receiving attachments</li>
                <li>PDF reader for document viewing</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Delivery Confirmation</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.1 Automatic Confirmations</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Email confirmations sent for all purchases</li>
                <li>Account notifications for feature activation</li>
                <li>Download confirmations for digital products</li>
                <li>Session confirmations for scheduled consultations</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">6.2 Delivery Tracking</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Order status available in account dashboard</li>
                <li>Progress updates for custom services</li>
                <li>Completion notifications via email</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Failed Deliveries</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.1 Common Causes</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Invalid or outdated email address</li>
                <li>Full email inbox or spam filtering</li>
                <li>Technical issues with user's internet connection</li>
                <li>Account suspension or deactivation</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">7.2 Resolution Process</h3>
              <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-2">
                <li>We will attempt to contact you via alternative methods</li>
                <li>Services will be held for 30 days pending resolution</li>
                <li>Contact our support team to resolve delivery issues</li>
                <li>Update your contact information in your account settings</li>
              </ol>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Geographic Availability</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.1 Service Areas</h3>
              <p className="text-gray-700 mb-4">
                Our digital services are available globally, with specific focus on:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>India (primary market)</li>
                <li>English-speaking countries</li>
                <li>International markets with English job requirements</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">8.2 Time Zone Considerations</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Consultation sessions scheduled in IST (Indian Standard Time)</li>
                <li>Alternative time zones accommodated by request</li>
                <li>Business hours: Monday - Friday, 9:00 AM - 6:00 PM IST</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Customer Support</h2>
              
              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.1 Delivery Support</h3>
              <p className="text-gray-700 mb-4">
                If you experience any issues with service delivery, please contact us:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Email: support@hirebuddy.com</li>
                <li>Response time: Within 24 hours</li>
                <li>Live chat available during business hours</li>
                <li>Phone support for premium users</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">9.2 Technical Support</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Platform access issues</li>
                <li>Download and compatibility problems</li>
                <li>Video conferencing technical difficulties</li>
                <li>Account and billing inquiries</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We reserve the right to modify this Shipping and Delivery Policy at any time. 
                Changes will be effective immediately upon posting on our website. Users will be 
                notified of significant changes via email or platform notifications.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Contact Information</h2>
              <p className="text-gray-700 mb-4">
                For questions about delivery or to report delivery issues, please contact us:
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

export default ShippingDelivery; 