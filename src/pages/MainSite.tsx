import { Routes, Route } from "react-router-dom";
import Index from "./Index";
import Auth from "./Auth";
import ClinicLanding from "./ClinicLanding";
import ClinicAuth from "./ClinicAuth";
import ClinicDashboard from "./ClinicDashboard";
import PricingPage from "./PricingPage";
import Dashboard from "./Dashboard";
import LabMarketplace from "./LabMarketplace";
import PaymentSuccess from "./PaymentSuccess";
import PaymentCanceled from "./PaymentCanceled";
import ReportView from "../components/ReportView";
import NotFound from "./NotFound";
import ProtectedRoute from "../components/ProtectedRoute";
import HowItWorks from "./HowItWorks";
import SampleReports from "./SampleReports";
import FAQ from "./FAQ";
import ContactUs from "./ContactUs";
import PrivacyPolicy from "./PrivacyPolicy";
import TermsOfService from "./TermsOfService";
import HIPAACompliance from "./HIPAACompliance";
import MedicalDisclaimer from "./MedicalDisclaimer";
import AIAnalysisDescription from "./AIAnalysisDescription";
import ProductsCatalog from "./ProductsCatalog";
import { LabCatalog } from "../components/lab-ordering/LabCatalog";
import TestIntegration from "./TestIntegration";

/**
 * Routes for the main site (non-tenant specific)
 * These routes are only accessible when NOT on a tenant subdomain
 */
const MainSite = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/auth" element={<Auth />} />
      <Route path="/lab-marketplace" element={<LabMarketplace />} />
      <Route path="/labs" element={<LabMarketplace />} />
      <Route path="/lab-catalog" element={<LabCatalog />} />
      <Route path="/payment-success" element={<PaymentSuccess />} />
      <Route path="/payment-canceled" element={<PaymentCanceled />} />
      <Route path="/clinic" element={<ClinicLanding />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      <Route path="/sample-reports" element={<SampleReports />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/contact" element={<ContactUs />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/terms-of-service" element={<TermsOfService />} />
      <Route path="/hipaa-compliance" element={<HIPAACompliance />} />
      <Route path="/medical-disclaimer" element={<MedicalDisclaimer />} />
      <Route path="/ai-analysis" element={<AIAnalysisDescription />} />
      <Route path="/products" element={<ProductsCatalog />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/test-integration" element={<TestIntegration />} />
      <Route path="/clinic-signup" element={<ClinicAuth />} />
      <Route path="/clinic-login" element={<ClinicAuth />} />
      <Route path="/clinic-dashboard" element={
        <ProtectedRoute>
          <ClinicDashboard />
        </ProtectedRoute>
      } />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/report/:id" element={
        <ProtectedRoute>
          <ReportView />
        </ProtectedRoute>
      } />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainSite;