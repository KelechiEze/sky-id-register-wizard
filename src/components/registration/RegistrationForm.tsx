
import React, { useState, useEffect, ChangeEvent } from "react";
import { toast } from "@/components/ui/sonner";
import { Trash2, Check, ChevronsRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

// Mock user context - you should replace this with your actual context
const useAuth = () => {
  return {
    user: { userId: "1234" }
  };
};

// Mock data - replace with your actual data/API calls
const numbers = [
  "0700310001",
  "0700310002", 
  "0700310003",
  "0700410001",
  "0700410002"
];

interface Mapping { 
  network: string; 
  number: string; 
  ported: string 
}

const RegistrationForm = () => {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [accountInfo, setAccountInfo] = useState<{ accountNumber: string; bankCode: string } | null>(null);
  const [wallet, setWallet] = useState<{ balance: number; currency: string } | null>(null);

  // entire form state
  const [form, setForm] = useState({
    email: "",
    otp: "",
    skyId: "",
    firstName: "",
    lastName: "",
    nin: "",
    businessName: ""
  });

  const [loading, setLoading] = useState<{ [k: string]: boolean }>({});
  const [otpSent, setOtpSent] = useState(false);
  const [availableIds, setAvailableIds] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [mappings, setMappings] = useState<Mapping[]>([
    { network: "MTN", number: "", ported: "No" }
  ]);
  const [uploading, setUploading] = useState(false);

  const [requestId, setRequestId] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string | null>(null);

  // fees fetched from API
  const [fees, setFees] = useState({ base: 5000, extra: 2000, vat: 7.5 });
  
  const [alertOpen, setAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [alertType, setAlertType] = useState<"success" | "error">("success");

  const showAlert = (message: string, type: "success" | "error" = "success") => {
    setAlertMessage(message);
    setAlertType(type);
    setAlertOpen(true);
    
    // Also use toast for notifications
    if (type === "success") {
      toast.success(message);
    } else {
      toast.error(message);
    }
  };

  useEffect(() => {
    if (step === 4) {
      // Mock API calls - replace with actual API calls
      setTimeout(() => {
        setAccountInfo({ accountNumber: "0123456789", bankCode: "GTBank" });
        setWallet({ balance: 10000, currency: "NGN" });
      }, 500);
    }
  }, [step]);

  const handle = (k: keyof typeof form) => (e: ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const subtotal = fees.base + fees.extra * (mappings.length - 1);
  const vatAmount = Math.round(subtotal * (fees.vat / 100));
  const total = subtotal + vatAmount;

  const sendOtp = async () => {
    setLoading(l => ({ ...l, otp: true }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setOtpSent(true);
      showAlert("OTP sent to your email", "success");
    } catch {
      showAlert("Failed to send OTP", "error");
    } finally {
      setLoading(l => ({ ...l, otp: false }));
    }
  };

  const verifyOtp = async () => {
    setLoading(l => ({ ...l, verify: true }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(1);
      showAlert("OTP verified successfully", "success");
    } catch {
      showAlert("Invalid OTP", "error");
    } finally {
      setLoading(l => ({ ...l, verify: false }));
    }
  };

  const searchIds = () => {
    const clean = searchTerm.replace(/\D/g, "");
    if (clean.length < 10) {
      showAlert("Enter exactly 10 digits", "error");
      return;
    }
    
    const prefixes = ["0700310", "0700410"];
    const prefix = prefixes.find(p => clean.startsWith(p));
    if (!prefix) {
      showAlert("Must start with 0700310 or 0700410", "error");
      return;
    }
    
    const found = numbers
      .filter(n => n.startsWith(prefix))
      .slice(0, 5);
      
    if (!found.length) {
      showAlert("No IDs available", "error");
    }
    
    setAvailableIds(found);
  };

  const updateMapping = (i: number, k: keyof Mapping, v: string) => {
    setMappings(ms => {
      const arr = [...ms];
      arr[i] = { ...arr[i], [k]: v };
      return arr;
    });
  };

  const addMapping = () => {
    const hasInvalid = mappings.some(m => m.number.length !== 10);
    if (hasInvalid) {
      showAlert("Please complete or remove incomplete numbers before adding a new one", "error");
      return;
    }
    setMappings(ms => [...ms, { network: "MTN", number: "", ported: "No" }]);
  };

  const delMapping = (i: number) => () => setMappings(ms => ms.filter((_, idx) => idx !== i));

  const initiate = async () => {
    setLoading(l => ({ ...l, init: true }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRequestId("REQ" + Math.floor(Math.random() * 10000));
      setStep(4);
    } catch {
      showAlert("Initiate failed", "error");
    } finally {
      setLoading(l => ({ ...l, init: false }));
    }
  };

  const handleProof = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; 
    if (!f) return;
    setProofFile(f);
    setProofPreview(URL.createObjectURL(f));
  };

  const uploadProof = async () => {
    if (!proofFile) {
      showAlert("Proof of payment is required", "error");
      return;
    }

    setUploading(true);
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setStep(5);
      showAlert("Proof uploaded successfully", "success");
    } catch {
      showAlert("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  };

  const handleWalletPayment = async () => {
    setLoading(l => ({ ...l, payment: true }));
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (wallet && wallet.balance < total) {
        showAlert(`Insufficient balance. Please transfer ₦${total.toLocaleString()} to ${accountInfo?.accountNumber} (${accountInfo?.bankCode})`, "error");
      } else {
        showAlert("Payment successful via wallet", "success");
        setStep(5);
      }
    } catch {
      showAlert("Network error during payment", "error");
    } finally {
      setLoading(l => ({ ...l, payment: false }));
    }
  };

  const stepTitles = [
    "Verify Email",
    "Choose Sky-ID",
    "Map Numbers",
    "KYC & Submit",
    "Checkout & Proof",
    "Done"
  ];

  return (
    <div className="registration-container">
      {/* Sidebar with steps */}
      <div className="stepper-sidebar">
        <div className="logo-container">
          <div className="logo-icon">
            {/* Replace with your actual logo */}
            <h2>Sky-ID</h2>
          </div>
        </div>
        
        <div className="stepper-list">
          {stepTitles.map((title, idx) => (
            <div key={idx} className="stepper-item">
              <div 
                className={`stepper-bullet ${idx === step ? "stepper-bullet-active" : idx < step ? "stepper-bullet-completed" : "stepper-bullet-pending"}`}
              >
                {idx < step ? <Check size={16} /> : idx + 1}
              </div>
              <span 
                className={`stepper-text ${idx === step ? "stepper-text-active" : idx < step ? "stepper-text-completed" : "stepper-text-pending"}`}
              >
                {title}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      {/* Content area */}
      <div className="content-area">
        <div className="content-wrapper">
          {/* Step 1: Email Verification */}
          {step === 0 && (
            <div className="step-card">
              <h2 className="card-title">Verify Your Email</h2>
              <p className="card-subtitle">
                Please enter the email of the person to be registered. An OTP will be sent to verify their email address.
              </p>
              
              <div className="form-group">
                <Label className="form-label" htmlFor="email">Email Address</Label>
                <Input 
                  id="email"
                  className={`form-input ${form.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) ? "error" : ""}`}
                  value={form.email}
                  onChange={handle("email")}
                />
                {form.email !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) && (
                  <p className="error-text">Please enter a valid email address</p>
                )}
              </div>
              
              <Button 
                className={`btn ${loading.otp ? "opacity-60" : "btn-primary"}`}
                disabled={loading.otp || !form.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)}
                onClick={sendOtp}
              >
                {loading.otp ? (
                  <>
                    <div className="loading-spinner"></div>
                    Sending...
                  </>
                ) : "Send OTP"}
              </Button>
              
              {otpSent && (
                <>
                  <div className="form-group mt-4">
                    <Label className="form-label" htmlFor="otp">Enter OTP</Label>
                    <Input 
                      id="otp"
                      className="form-input"
                      value={form.otp}
                      onChange={handle("otp")}
                    />
                  </div>
                  
                  <div className="flex justify-between mt-4">
                    <Button 
                      className="btn btn-secondary"
                      onClick={() => setOtpSent(false)}
                    >
                      Back
                    </Button>
                    
                    <Button 
                      className={`btn ${loading.verify ? "opacity-60" : "btn-primary"}`}
                      disabled={loading.verify || !form.otp}
                      onClick={verifyOtp}
                    >
                      {loading.verify ? (
                        <>
                          <div className="loading-spinner"></div>
                          Verifying...
                        </>
                      ) : "Continue"}
                    </Button>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Step 2: Sky-ID Selection */}
          {step === 1 && (
            <div className="step-card">
              <h2 className="card-title">Select a Sky-ID</h2>
              <p className="card-subtitle">
                Enter a valid 10-digit Sky-ID <b>(starting with 0700310 or 0700410)</b> to search for available options.
                This Sky-ID is what will be assigned to the customer and all other number will be mapped to it.
              </p>
              
              <div className="form-group">
                <Label className="form-label" htmlFor="skyid">Sky-ID (10 digits)</Label>
                <Input 
                  id="skyid"
                  className="form-input"
                  value={searchTerm}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 10) setSearchTerm(v);
                  }}
                  maxLength={10}
                />
              </div>
              
              <Button 
                className="btn btn-primary"
                onClick={searchIds}
                disabled={searchTerm.length !== 10}
              >
                Search
              </Button>
              
              <div className="mt-4">
                {availableIds.map(id => (
                  <div key={id} className="bg-green-50 border border-green-100 p-2 rounded mb-2 flex items-center">
                    <span className="text-green-800 flex-1">✓ {id}</span>
                    <Button 
                      className="btn btn-secondary"
                      onClick={() => {
                        setForm(f => ({ ...f, skyId: id }));
                        setStep(2);
                      }}
                    >
                      Select
                    </Button>
                  </div>
                ))}
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  className="btn btn-secondary"
                  onClick={() => setStep(0)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 3: Number Mapping */}
          {step === 2 && (
            <div className="step-card">
              <h2 className="card-title">Map Phone Numbers</h2>
              <p className="card-subtitle">
                Map the user existing phone numbers to the Sky-ID. Start with the primary number. 
                You can add multiple numbers across different networks.
              </p>
              
              <div className="bg-blue-50 p-4 rounded mb-4">
                <p className="font-medium">Your Sky-ID: <strong>{form.skyId}</strong></p>
                <p className="text-sm mt-2">The First number costs <strong>₦{fees.base.toLocaleString()}</strong> and each additional number costs <strong>₦{fees.extra.toLocaleString()}</strong></p>
              </div>
              
              {mappings.map((m, i) => (
                <div key={i} className="form-group grid grid-cols-1 gap-3 md:flex md:items-center">
                  <div className="flex-1">
                    <Label className="form-label">Network</Label>
                    <select 
                      className="form-select"
                      value={m.network}
                      onChange={e => updateMapping(i, "network", e.target.value)}
                    >
                      {["MTN", "GLO", "Airtel", "9mobile"].map(n => (
                        <option key={n} value={n}>{n}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex-2">
                    <Label className="form-label">Phone Number (10 digits)</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <span className="text-gray-500">+234</span>
                      </div>
                      <Input
                        className={`form-input pl-14 ${m.number !== "" && m.number.length !== 10 ? "error" : ""}`}
                        value={m.number}
                        onChange={e => {
                          const v = e.target.value.replace(/\D/g, "");
                          if (v.length <= 10) {
                            updateMapping(i, "number", v);
                          }
                        }}
                        required={i === 0}
                      />
                    </div>
                    {m.number !== "" && m.number.length !== 10 && (
                      <p className="error-text">Phone number must be exactly 10 digits</p>
                    )}
                  </div>
                  
                  <div>
                    <Label className="form-label">Ported?</Label>
                    <select 
                      className="form-select"
                      value={m.ported}
                      onChange={e => updateMapping(i, "ported", e.target.value)}
                    >
                      {["No", "Yes"].map(x => (
                        <option key={x} value={x}>{x}</option>
                      ))}
                    </select>
                  </div>
                  
                  {i > 0 && (
                    <Button 
                      className="btn btn-secondary mt-4 md:mt-6"
                      onClick={delMapping(i)}
                    >
                      <Trash2 className="btn-icon" size={16} />
                      Remove
                    </Button>
                  )}
                </div>
              ))}
              
              <Button 
                className="btn btn-secondary mt-2 mb-4"
                onClick={addMapping}
              >
                + Add another number
              </Button>
              
              <div className="flex justify-between mt-4">
                <Button 
                  className="btn btn-secondary"
                  onClick={() => setStep(1)}
                >
                  Back
                </Button>
                
                <Button 
                  className="btn btn-primary"
                  onClick={() => {
                    const invalid = mappings.some(m => m.number.length !== 10);
                    if (invalid) {
                      showAlert("All phone numbers must be exactly 10 digits", "error");
                      return;
                    }
                    setStep(3);
                  }}
                  disabled={mappings.some((m) => !m.number)}
                >
                  Continue
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 4: KYC Information */}
          {step === 3 && (
            <div className="step-card">
              <h2 className="card-title">Enter KYC Information</h2>
              <p className="card-subtitle">
                Enter personal details of the individual being registered.
              </p>
              
              <div className="form-group">
                <Label className="form-label" htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName"
                  className="form-input"
                  value={form.firstName}
                  onChange={handle("firstName")}
                  required
                />
              </div>
              
              <div className="form-group">
                <Label className="form-label" htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName"
                  className="form-input"
                  value={form.lastName}
                  onChange={handle("lastName")}
                  required
                />
              </div>
              
              <div className="form-group">
                <Label className="form-label" htmlFor="nin">NIN (11 digits)</Label>
                <Input 
                  id="nin"
                  className={`form-input ${form.nin !== "" && !/^\d{11}$/.test(form.nin) ? "error" : ""}`}
                  value={form.nin}
                  onChange={e => {
                    const v = e.target.value.replace(/\D/g, "");
                    if (v.length <= 11) {
                      setForm(f => ({ ...f, nin: v }));
                    }
                  }}
                  required
                />
                {form.nin !== "" && !/^\d{11}$/.test(form.nin) && (
                  <p className="error-text">NIN must be exactly 11 digits</p>
                )}
              </div>
              
              <div className="form-group">
                <Label className="form-label" htmlFor="businessName">Business Name</Label>
                <Input 
                  id="businessName"
                  className="form-input"
                  value={form.businessName}
                  onChange={handle("businessName")}
                  required
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  className="btn btn-secondary"
                  onClick={() => setStep(2)}
                >
                  Back
                </Button>
                
                <Button 
                  className={`btn ${loading.init ? "opacity-60" : "btn-primary"}`}
                  onClick={initiate}
                  disabled={loading.init || !form.firstName || !form.lastName || !/^\d{11}$/.test(form.nin) || !form.businessName}
                >
                  {loading.init ? (
                    <>
                      <div className="loading-spinner"></div>
                      Processing...
                    </>
                  ) : "Submit & Continue"}
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 5: Payment */}
          {step === 4 && accountInfo && wallet && (
            <div className="step-card">
              <h2 className="card-title">Payment & Upload Proof</h2>
              <p className="card-subtitle">
                Review the payment breakdown and complete payment to proceed.
              </p>
              
              <div className="bg-blue-50 p-4 rounded mb-4">
                <h3 className="font-semibold text-lg mb-1">Payment Summary for Sky-ID: {form.skyId}</h3>
              </div>
              
              {mappings.map((m, i) => (
                <div key={i} className="flex justify-between mb-2">
                  <span>{i === 0 ? "Primary Number" : `Extra Number ${i}`} ({m.network} - {m.number})</span>
                  <span className="font-semibold">₦{(i === 0 ? fees.base : fees.extra).toLocaleString()}</span>
                </div>
              ))}
              
              <div className="border-t border-gray-200 my-4 pt-4">
                <div className="flex justify-between mb-2">
                  <span className="font-semibold">Subtotal</span>
                  <span className="font-semibold">₦{subtotal.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between mb-2">
                  <span>VAT ({fees.vat}%)</span>
                  <span>₦{vatAmount.toLocaleString()}</span>
                </div>
                
                <div className="flex justify-between pt-2 border-t border-gray-200">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg">₦{total.toLocaleString()}</span>
                </div>
              </div>
              
              {wallet.balance >= total ? (
                <div className="bg-green-50 border border-green-100 p-4 rounded mb-4">
                  <p className="text-green-800">
                    <span className="font-semibold">Wallet Balance:</span> ₦{wallet.balance.toLocaleString()}
                  </p>
                  <p className="text-green-800 mt-1">
                    <span className="font-semibold">Deduction:</span> ₦{total.toLocaleString()}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-100 p-4 rounded mb-4">
                  <p className="text-yellow-800">
                    <span className="font-semibold">Insufficient wallet funds.</span>
                  </p>
                  <p className="text-yellow-800 mt-1">
                    Transfer ₦{total.toLocaleString()} to:
                  </p>
                  <p className="text-xl font-bold mt-1">
                    {accountInfo.accountNumber} ({accountInfo.bankCode})
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 mt-4">
                {wallet.balance >= total ? (
                  <Button 
                    className={`btn ${loading.payment ? "opacity-60" : "btn-primary"} btn-full`}
                    onClick={handleWalletPayment}
                    disabled={loading.payment}
                  >
                    {loading.payment ? (
                      <>
                        <div className="loading-spinner"></div>
                        Processing...
                      </>
                    ) : "Pay with Wallet"}
                  </Button>
                ) : (
                  <div className="w-full">
                    <Button 
                      component="label"
                      className="btn btn-destructive btn-full"
                    >
                      Upload Proof of Transfer
                      <input type="file" accept="image/*" hidden onChange={handleProof} />
                    </Button>
                    
                    {proofPreview && (
                      <div className="mt-3">
                        <img src={proofPreview} alt="Payment proof" className="max-w-full h-auto max-h-64 mx-auto" />
                      </div>
                    )}
                    
                    <Button
                      className={`btn ${uploading || !proofFile ? "opacity-60" : "btn-primary"} btn-full mt-3`}
                      onClick={uploadProof}
                      disabled={!proofFile || uploading}
                    >
                      {uploading ? (
                        <>
                          <div className="loading-spinner"></div>
                          Uploading...
                        </>
                      ) : "Upload & Finish"}
                    </Button>
                  </div>
                )}
              </div>
              
              <div className="flex justify-between mt-4">
                <Button 
                  className="btn btn-secondary"
                  onClick={() => setStep(3)}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
          
          {/* Step 6: Completion */}
          {step === 5 && (
            <div className="step-card text-center">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
                  <Check size={32} className="text-green-500" />
                </div>
              </div>
              
              <h2 className="card-title text-center">Registration Complete!</h2>
              <p className="mb-4">
                Your Social-ID Registration for {form.firstName} {form.lastName} has been received. 
                Your Social ID will be processed within the next 48 hours.
              </p>
              
              <Button 
                className="btn btn-primary"
                onClick={() => window.location.reload()}
              >
                Start New Registration
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Alert Dialog */}
      <Dialog open={alertOpen} onOpenChange={setAlertOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {alertType === "success" ? "Success" : "Error"}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className={alertType === "success" ? "text-green-600" : "text-red-500"}>
              {alertMessage}
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default RegistrationForm;
