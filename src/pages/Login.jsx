import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWrapper } from '../utils/fetchWrapper';
import { normalizeLocation } from '../utils/locationHelpers';
import { Phone, Lock, CheckCircle, ArrowRight } from 'lucide-react';
import OnboardingExplainer from '../components/OnboardingExplainer';
import LocationPicker from '../components/LocationPicker';

const Login = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Explainer, 4: Onboarding
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [location, setLocation] = useState(null);
  const [errors, setErrors] = useState({});
  const [tempAuth, setTempAuth] = useState(null); // Store token/user temporarily during onboarding
  const [showSignup, setShowSignup] = useState(false); // Helper flag
  const [verifyLoading, setVerifyLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (msg, type = 'error') => {
    // Basic alert for now, can replace with Toast component
    alert(msg);
  };

  const [otpStatus, setOtpStatus] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);

  const requestOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrors({ phone: 'Enter a valid phone number' });
      return;
    }
    setErrors({});
    setOtpStatus('Sending OTP...');
    setOtpLoading(true);

    const slowTimer = setTimeout(() => {
      setOtpStatus('Almost there…');
    }, 3000);

    try {
      await fetchWrapper('/api/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone }) });
      setStep(2);
    } catch (err) {
      showToast(err.message, 'error');
      setOtpStatus('');
    } finally {
      clearTimeout(slowTimer);
      setOtpLoading(false);
    }
  };

  const verifyOtp = async () => {
    const newErrors = {};
    if (!otp) newErrors.otp = 'OTP is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return null;
    }
    setErrors({});
    setVerifyLoading(true);

    try {
      // Don't send city/area here anymore, strictly verification
      const body = { phone, otp }; 
      const res = await fetchWrapper('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });
      
      setTempAuth({ token: res.token, user: res.user });

      if (res.isNewUser) {
        // If new user, first show explainer, then onboarding
        setShowSignup(true);
        setStep(3); // Explainer screen
      } else {
        // Existing user: show explainer first, then continue to app
        setShowSignup(false);
        setStep(3); // Explainer screen
      }
      return res;
    } catch (err) {
      showToast(err.message, 'error');
      return null;
    } finally {
      setVerifyLoading(false);
    }
  };

  const completeProfile = async (selectedLocation) => {
    const loc = selectedLocation || location;
    if (!loc) {
      showToast('Please select a location', 'error');
      return;
    }
    
    let token = tempAuth?.token;
    let user = tempAuth?.user;

    // Robustness: If token is missing for some reason, try to re-verify silently or fail gracefully
    if (!token) {
        // In a real scenario, we might prompt for OTP again, but here we assume flow is linear.
        // If we are here, we should have a token.
        // Try to re-verify if we have otp (fallback)
        const res = await verifyOtp();
        if (res && res.token) {
            token = res.token;
            user = res.user;
        } else {
            showToast('Session expired. Please verify OTP again.', 'error');
            setStep(2);
            return;
        }
    }

    try {
      // Use the specific token for this request
      await fetchWrapper('/api/users/me', { 
        method: 'PUT', 
        body: JSON.stringify({ 
          location: loc
        }),
        token: token 
      });

      const updatedUser = { ...(user || {}), location: loc };
      
      // Finalize login
      login(token, updatedUser);
      navigate('/');
      
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center px-6">
      <div className="max-w-md mx-auto w-full">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-blue-600 mb-2">DoForMe</h1>
          <p className="text-gray-500">Get things done, locally.</p>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="tel"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="1234567890"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {errors.phone && <p className="text-red-500 text-sm mt-1">{errors.phone}</p>}
            </div>
            <div className="space-y-2">
              <button
                onClick={requestOtp}
                disabled={otpLoading}
                className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                  otpLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {otpLoading ? 'Sending OTP…' : 'Continue'}
              </button>
              {otpStatus && (
                <p className="text-xs text-gray-500 text-center">{otpStatus}</p>
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 text-gray-400" size={20} />
                <input
                  type="text"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="1234"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                />
              </div>
              {errors.otp && <p className="text-red-500 text-sm mt-1">{errors.otp}</p>}
            </div>
            <button
              onClick={verifyOtp}
              disabled={verifyLoading}
              className={`w-full py-3 rounded-lg font-semibold text-white transition ${
                verifyLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {verifyLoading ? 'Verifying…' : 'Verify OTP'}
            </button>
            <button onClick={() => setStep(1)} className="w-full text-gray-500 text-sm mt-4">
              Change Phone Number
            </button>
            
            <div className="text-center mt-6">
              <p className="text-sm text-gray-600 mb-2">Didn't receive code?</p>
              <button 
                onClick={requestOtp} 
                disabled={cooldown > 0 || otpLoading}
                className={`text-sm font-medium ${cooldown > 0 ? 'text-gray-400' : 'text-blue-600 hover:text-blue-700'}`}
              >
                {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend Code'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
            <OnboardingExplainer
              onContinue={() => {
                if (showSignup) {
                  setStep(4);
                  return;
                }

                const token = tempAuth?.token;
                const user = tempAuth?.user;
                if (!token || !user) {
                  setStep(2);
                  return;
                }

                login(token, user);
                navigate('/');
              }}
            />
        )}

        {step === 4 && (
            <div className="space-y-6">
                <div className="bg-blue-50 p-4 rounded-lg mb-6">
                    <h3 className="font-semibold text-blue-800 mb-2">Welcome! Just a few steps:</h3>
                    <ul className="text-sm text-blue-700 space-y-1">
                        <li className="flex items-center gap-2"><CheckCircle size={14}/> Post a task you need help with</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14}/> Accept tasks near you</li>
                        <li className="flex items-center gap-2"><CheckCircle size={14}/> Chat and get it done</li>
                    </ul>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg mb-4 text-sm text-yellow-800 border border-yellow-100">
                    <strong>Set Location:</strong> Search for your area or drop a pin.
                </div>

                <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Where are you based?</h3>
                    <LocationPicker 
                      onLocationSelect={(loc) => {
                        setLocation(loc);
                        // Optional: automatically confirm after selection if desired, but user might want to adjust
                        // completeProfile(loc); 
                      }} 
                    />
                </div>

                <button
                    onClick={() => completeProfile(location)}
                    disabled={!location}
                    className={`w-full py-3 rounded-lg font-semibold text-white transition flex items-center justify-center gap-2 ${
                      location ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                    }`}
                >
                    Get Started <ArrowRight size={18}/>
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

export default Login;
