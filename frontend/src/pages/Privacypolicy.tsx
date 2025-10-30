import { motion } from "framer-motion";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-primary/10 to-soft-teal/20 px-6 py-12">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="
          w-full max-w-5xl 
          bg-white/90 dark:bg-neutral-900/90 
          backdrop-blur-md 
          rounded-3xl       /* Fully rounded all corners */
          shadow-2xl 
          border border-border/30 
          p-12 
          hover:shadow-[0_0_50px_rgba(79,70,229,0.4)] 
          transition-shadow duration-300
          overflow-y-auto max-h-[85vh]
        "
      >
        {/* Title */}
        <h1 className="text-4xl font-serif font-bold mb-8 text-blue-900 text-center">
          Privacy Policy
        </h1>

        <div className="text-muted-foreground leading-relaxed whitespace-pre-line text-lg">

          {/* Section 1 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            1. Introduction
          </h2>
          <p>
            At <strong>MedNarrate</strong>, our mission is to make medical reports understandable for everyone — without fear, confusion, or misinformation. We take data protection seriously and comply with all relevant privacy laws, including DPDPA 2023 (India), IT Rules 2011, GDPR (EU), and other international regulations.
          </p>

          {/* Section 2 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            2. Information We Collect
          </h2>
          <h3 className="text-xl font-semibold text-primary mt-4 mb-2 font-serif">
            a. Personal Information (if provided)
          </h3>
          <p>Name, email address, contact details, language preferences.</p>

          <h3 className="text-xl font-semibold text-primary mt-4 mb-2 font-serif">
            b. Uploaded Content
          </h3>
          <p>Medical reports (PDFs, text, or images). Processed securely and deleted after generating results.</p>

          <h3 className="text-xl font-semibold text-primary mt-4 mb-2 font-serif">
            c. Technical Data
          </h3>
          <p>Browser type, OS, IP address, session data.</p>

          <h3 className="text-xl font-semibold text-primary mt-4 mb-2 font-serif">
            d. Cookies and Similar Technologies
          </h3>
          <p>Essential cookies only; no advertising or third-party tracking.</p>

          {/* Section 3 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            3. How We Use Your Information
          </h2>
          <p>
            To provide AI-powered explanations, generate voice narration, optimize performance, respond to queries, maintain security, and comply with legal obligations. Data is never used for marketing without consent.
          </p>

          {/* Section 4 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            4. Data Retention
          </h2>
          <p>
            Uploaded reports are deleted after processing unless saved. Personal info is kept only as long as needed. Users can request deletion anytime via <a href="mailto:privacy@mednarrate.com" className="text-primary underline">privacy@mednarrate.com</a>.
          </p>

          {/* Section 5 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            5. Data Security
          </h2>
          <p>
            Industry-standard security measures: HTTPS/TLS encryption, secure servers, access control, periodic audits. All team members follow confidentiality and ethical guidelines.
          </p>

          {/* Section 6 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            6. Sharing and Disclosure
          </h2>
          <p>
            Data is never sold or used for marketing. Shared only with trusted service providers or legal authorities under strict agreements.
          </p>

          {/* Section 7 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            7. Your Rights
          </h2>
          <p>
            Access, correction, deletion, withdraw consent, data portability, grievance redressal. Contact: <a href="mailto:privacy@mednarrate.com" className="text-primary underline">privacy@mednarrate.com</a>.
          </p>

          {/* Section 8 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            8. Cookies and Tracking
          </h2>
          <p>
            Cookies maintain sessions and app functionality. No tracking cookies or third-party ad networks.
          </p>

          {/* Section 9 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            9. AI Transparency & Data Ethics
          </h2>
          <p>
            AI models are used only to simplify medical language. Summaries are educational, privacy-protected, and processed in real-time.
          </p>

          {/* Section 10 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            10. Children’s Privacy
          </h2>
          <p>
            Intended for users aged 16+. No data is knowingly collected from minors; any such data is deleted immediately.
          </p>

          {/* Section 11 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            11. International Data Transfers
          </h2>
          <p>
            If data is stored outside your country, we comply with international protection standards and Standard Contractual Clauses (SCCs).
          </p>

          {/* Section 12 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            12. Data Breach Notification
          </h2>
          <p>
            Users and authorities are notified promptly. Immediate measures are taken to mitigate risks.
          </p>

          {/* Section 13 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            13. Legal Compliance
          </h2>
          <p>
            Compliance with DPDPA 2023 (India), IT Act 2000 & SPDI Rules 2011, GDPR (EU), and other international standards.
          </p>

          {/* Section 14 */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            14. Updates to This Policy
          </h2>
          <p>
            Privacy Policy may be updated. Significant changes are notified via email/app and Last Updated date is changed.
          </p>

          {/* Final Promise */}
          <h2 className="text-2xl font-bold text-primary mt-6 mb-3 font-serif">
            🌿 Our Promise
          </h2>
          <p>
            At MedNarrate, your trust is our foundation 💙. We are committed to making healthcare communication transparent, empathetic, and private — turning fear into understanding, one report at a time.
          </p>

        </div>

        {/* Back to Home button */}
        <div className="mt-8 flex justify-center">
          <a
            href="/"
            className="px-6 py-2 rounded-full bg-primary text-white font-medium hover:bg-primary/80 transition"
          >
            Back to Home
          </a>
        </div>
      </motion.div>
    </div>
  );
}
