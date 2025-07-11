import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";

export const ContactForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    college: "",
    phone: "",
    cvLink: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus("idle");
    setErrorMessage("");

    // Basic validation
    if (!formData.name || formData.name.length < 2) {
      setErrorMessage("Name must be at least 2 characters.");
      setIsSubmitting(false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Please enter a valid email address.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.college || formData.college.length < 2) {
      setErrorMessage("College name must be at least 2 characters.");
      setIsSubmitting(false);
      return;
    }

    if (!formData.phone) {
      setErrorMessage("Please enter a valid phone number.");
      setIsSubmitting(false);
      return;
    }

    if (formData.cvLink && !formData.cvLink.startsWith('http')) {
      setErrorMessage("Please enter a valid URL for your CV.");
      setIsSubmitting(false);
      return;
    }

    try {
      console.log("Contact form submission:", formData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSubmitStatus("success");
      setFormData({
        name: "",
        email: "",
        college: "",
        phone: "",
        cvLink: "",
      });
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitStatus("error");
      setErrorMessage("Something went wrong. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section
      id="contact"
      className="w-full min-h-screen py-16 px-4 sm:px-6 md:px-8 lg:px-12 bg-[#FFEDED]"
    >
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center rounded-full bg-[#FFE0E0] px-4 py-1.5 mb-6">
            <span className="text-sm font-medium text-[#b26469]">
              Get in touch
            </span>
          </div>
          <h2 className="text-4xl font-mabry font-semibold text-[#403334] mb-4">
            Contact <span className="text-[#b24e55]">Us</span>
          </h2>
          <p className="text-[#4A3D55] text-lg">
            We'd love to hear from you. Please fill out this form.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-8 shadow-lg">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Grid container for name and email */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#403334] mb-2">
                  Name
                </label>
                <Input
                  name="name"
                  placeholder="Enter your name"
                  className="h-12"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#403334] mb-2">
                  Email
                </label>
                <Input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  className="h-12"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* Grid container for college and phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#403334] mb-2">
                  College
                </label>
                <Input
                  name="college"
                  placeholder="Enter your college name"
                  className="h-12"
                  value={formData.college}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#403334] mb-2">
                  Phone/WhatsApp Number
                </label>
                <Input
                  name="phone"
                  type="tel"
                  placeholder="Enter your phone number"
                  className="h-12"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>

            {/* CV Link remains full width */}
            <div>
              <label className="block text-sm font-medium text-[#403334] mb-2">
                CV Link (Optional)
              </label>
              <Input
                name="cvLink"
                type="url"
                placeholder="Enter the link to your CV (optional)"
                className="h-12"
                value={formData.cvLink}
                onChange={handleInputChange}
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-12 bg-gradient-to-t from-[#b24e55] to-[#E3405F] text-white hover:opacity-90"
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </Button>

            {submitStatus === "success" && (
              <p className="text-green-600 text-center">
                Thank you for contacting us! We'll get back to you soon.
              </p>
            )}

            {submitStatus === "error" && (
              <p className="text-red-600 text-center">
                Error: {errorMessage}
              </p>
            )}

            {errorMessage && submitStatus === "idle" && (
              <p className="text-red-600 text-center">
                {errorMessage}
              </p>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}; 