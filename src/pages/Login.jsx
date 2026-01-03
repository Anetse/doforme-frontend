import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { fetchWrapper } from '../utils/fetchWrapper';
import { Phone, Lock, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

const Login = () => {
  const [step, setStep] = useState(1); // 1: Phone, 2: OTP, 3: Onboarding
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');
  const [errors, setErrors] = useState({});
  const [tempAuth, setTempAuth] = useState(null); // Store token/user temporarily during onboarding
  const [showSignup, setShowSignup] = useState(false); // Helper flag
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const showToast = (msg, type = 'error') => {
    // Basic alert for now, can replace with Toast component
    alert(msg);
  };

  const requestOtp = async () => {
    if (!phone || phone.length < 10) {
      setErrors({ phone: 'Enter a valid phone number' });
      return;
    }
    setErrors({});
    try {
      await fetchWrapper('/api/auth/request-otp', { method: 'POST', body: JSON.stringify({ phone }) });
      setStep(2);
    } catch (err) {
      showToast(err.message, 'error');
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

    try {
      // Don't send city/area here anymore, strictly verification
      const body = { phone, otp }; 
      const res = await fetchWrapper('/api/auth/verify-otp', { method: 'POST', body: JSON.stringify(body) });
      
      setTempAuth({ token: res.token, user: res.user });

      if (res.isNewUser) {
        // If new user, go to onboarding/profile completion
        setShowSignup(true);
        setStep(3); // Go to Onboarding/Profile completion
      } else {
        // Existing user, log in immediately
        login(res.token, res.user); 
        navigate('/');
      }
      return res;
    } catch (err) {
      showToast(err.message, 'error');
      return null;
    }
  };

  const completeProfile = async () => {
    const newErrors = {};
    if (!city) newErrors.city = 'City is required';
    if (!area) newErrors.area = 'Area is required';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});

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
        body: JSON.stringify({ city, area }),
        token: token 
      });

      const updatedUser = { ...(user || {}), city, area };
      
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
            <button
              onClick={requestOtp}
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Continue
            </button>
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
              className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Verify & Login
            </button>
            <button onClick={() => setStep(1)} className="w-full text-gray-500 text-sm">
              Change Phone Number
            </button>
          </div>
        )}

        {step === 3 && (
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
                    <strong>Tip:</strong> Use common names (e.g. "Lekki Phase 1"). Tasks only show to people with the exact same area name.
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Lagos"
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use common names (e.g. 'Lekki Phase 1'). Tasks only show to people with the same area.</p>
                    {errors.city && <p className="text-red-500 text-sm mt-1">{errors.city}</p>}
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                    <div className="relative">
                        <MapPin className="absolute left-3 top-3 text-gray-400" size={20} />
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="e.g. Ikeja"
                            value={area}
                            onChange={(e) => setArea(e.target.value)}
                        />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Use common names (e.g. 'Lekki Phase 1'). Tasks only show to people with the same area.</p>
                    {errors.area && <p className="text-red-500 text-sm mt-1">{errors.area}</p>}
                </div>

                <button
                    onClick={completeProfile}
                    className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition flex items-center justify-center gap-2"
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
