import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-gray-600 mb-6">
              <strong>Last updated:</strong> {new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>

            <section className="mb-8">
              <p className="text-lg text-gray-800 mb-6 font-medium">
                At Hirebuddy, your privacy isn't just a feature — it's a core part of how we build.
              </p>
              
              <p className="text-gray-700 mb-6">
                We collect certain information from you to help you find and apply to jobs faster. This includes the details you provide — like your resume, cover letters, preferences, and any other documents or inputs you share with us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Do With Your Data</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>We use your data only to help you with your job search.</li>
                <li>We do <strong>not</strong> sell your data.</li>
                <li>We do <strong>not</strong> share your data with anyone unless <strong>you explicitly choose to</strong>, for example when applying to a job or using the auto-apply feature.</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">About Auto-Apply</h2>
              <p className="text-gray-700 mb-4">
                Auto-apply only works for job listings and platforms <strong>you opt into</strong>. Your information is never sent anywhere automatically or without your clear permission. You are always in control of where your applications go.
              </p>
              
              <p className="text-gray-700 mb-4">
                As part of our auto-apply and outreach process, we may request <strong>access to your email (such as Gmail)</strong>. This allows us to send cold emails to recruiters or companies on your behalf — directly from <strong>your</strong> email address, so it looks personal and professional.
              </p>

              <div className="bg-blue-50 p-6 rounded-lg mb-6">
                <h3 className="text-lg font-semibold text-blue-900 mb-3">Here's what that means:</h3>
                <ul className="list-disc list-inside text-blue-800 space-y-2">
                  <li>We <strong>do not</strong> get access to your email password.</li>
                  <li>We <strong>cannot</strong> read your inbox or browse your personal emails.</li>
                  <li>We <strong>do not</strong> access your Google Drive, calendar, contacts, or any other Google services.</li>
                  <li>We only use this access to <strong>send and track job-related emails</strong> that you approve.</li>
                </ul>
              </div>

              <p className="text-gray-700 mb-4">
                You can revoke this access at any time from your Google account settings.
              </p>

              <p className="text-gray-700 mb-4">
                We understand how sensitive this permission is, and we're committed to using it transparently and securely. Your trust matters to us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Keep Your Data Safe</h2>
              <p className="text-gray-700 mb-4">
                We're committed to protecting your data using industry-standard security measures, and we continuously work to keep your information safe. While no system is ever completely immune to risks, we've built Hirebuddy with your privacy as a top priority. By using the platform, you acknowledge this and agree to our terms.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Consent</h2>
              <p className="text-gray-700 mb-4">
                By using Hirebuddy, you agree to this Privacy Policy and give us permission to use your data <strong>only</strong> for the purposes mentioned above.
              </p>
              
              <p className="text-gray-700 mb-4">
                If you're using Hirebuddy from a region that requires explicit consent for data usage (like the EU or California), your continued use of the platform will be considered your consent to these practices, unless you notify us otherwise.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
              <h3 className="text-xl font-semibold text-gray-800 mb-3">Personal Information</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Name, email address, and contact information</li>
                <li>Resume, cover letters, and professional documents</li>
                <li>Job preferences and career goals</li>
                <li>Payment information for premium services</li>
                <li>Communication preferences and settings</li>
              </ul>

              <h3 className="text-xl font-semibold text-gray-800 mb-3">Usage Information</h3>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>How you interact with our platform</li>
                <li>Job searches and applications</li>
                <li>Feature usage and preferences</li>
                <li>Device and browser information</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Sharing and Third Parties</h2>
              <p className="text-gray-700 mb-4">
                We work with trusted service providers to operate our platform:
              </p>
              <ul className="list-disc list-inside text-gray-700 mb-4 space-y-2">
                <li>Payment processors for subscription services</li>
                <li>Email service providers for platform communications</li>
                <li>Analytics providers to improve our service</li>
                <li>Security providers to protect your data</li>
              </ul>
              <p className="text-gray-700 mb-4">
                These providers are contractually required to protect your data and use it only for the services they provide to us.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights</h2>
              <ul className="list-disc list-inside text-gray-700 space-y-2">
                <li>Access your personal information</li>
                <li>Update or correct your data</li>
                <li>Delete your account and data</li>
                <li>Withdraw consent for data processing</li>
                <li>Opt out of marketing communications</li>
                <li>Download your data in a portable format</li>
              </ul>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Want Your Data Removed?</h2>
              <p className="text-gray-700 mb-4">
                If you ever want your data deleted or have questions, just reach out to us at <strong>sharmanishant9119@gmail.com</strong>
              </p>
              <p className="text-gray-700 mb-4">
                We'll get it sorted.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
              <p className="text-gray-700 mb-4">
                We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on our website and updating the "Last updated" date.
              </p>
            </section>

            <section className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
              <p className="text-gray-700 mb-4">
                If you have any questions about this Privacy Policy, please contact us:
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-gray-700">
                  <strong>Email:</strong> sharmanishant9119@gmail.com<br />
                  <strong>Address:</strong> Tower 2, Apartment 404, M3M Merlin, Golf Course Road Extn., Sector 67, Gurugram<br />
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy; 