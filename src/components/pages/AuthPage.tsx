import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '../ui/input-otp';
import { Link } from '../Router';
import { Mail, Phone, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

type AuthStep = 'login' | 'signup' | 'forgot-password' | 'otp-verification' | 'success';
type AuthMode = 'email' | 'phone';

export function AuthPage() {
  const [currentStep, setCurrentStep] = useState<AuthStep>('login');
  const [authMode, setAuthMode] = useState<AuthMode>('email');
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login logic
    toast.success('Login successful!');
    setCurrentStep('success');
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match!');
      return;
    }
    // Mock signup logic
    toast.info('Verification code sent!');
    setCurrentStep('otp-verification');
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock forgot password logic
    toast.info('Reset code sent!');
    setCurrentStep('otp-verification');
  };

  const handleOTPVerification = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.otp.length !== 6) {
      toast.error('Please enter a valid 6-digit code');
      return;
    }
    // Mock OTP verification
    toast.success('Verification successful!');
    setCurrentStep('success');
  };

  const renderLoginForm = () => (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email or Phone</Label>
        <Input
          id="email"
          type={authMode === 'email' ? 'email' : 'tel'}
          placeholder={authMode === 'email' ? 'Enter your email' : 'Enter your phone number'}
          value={authMode === 'email' ? formData.email : formData.phone}
          onChange={(e) => handleInputChange(authMode === 'email' ? 'email' : 'phone', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAuthMode(authMode === 'email' ? 'phone' : 'email')}
            className="text-red-600 hover:text-red-700 p-0 h-auto"
          >
            {authMode === 'email' ? (
              <>
                <Phone className="w-4 h-4 mr-1" />
                Use Phone
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-1" />
                Use Email
              </>
            )}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep('forgot-password')}
          className="text-red-600 hover:text-red-700 p-0 h-auto"
        >
          Forgot Password?
        </Button>
      </div>
      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
        Sign In
      </Button>
    </form>
  );

  const renderSignupForm = () => (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          type="text"
          placeholder="Enter your full name"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          type="email"
          placeholder="Enter your email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="phone">Phone Number</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="Enter your phone number"
          value={formData.phone}
          onChange={(e) => handleInputChange('phone', e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <div className="relative">
          <Input
            id="signup-password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="Confirm your password"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
        Create Account
      </Button>
    </form>
  );

  const renderForgotPasswordForm = () => (
    <div>
      <div className="flex items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep('login')}
          className="text-red-600 hover:text-red-700 p-0 h-auto mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Login
        </Button>
      </div>
      <form onSubmit={handleForgotPassword} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="reset-contact">Email or Phone</Label>
          <Input
            id="reset-contact"
            type={authMode === 'email' ? 'email' : 'tel'}
            placeholder={authMode === 'email' ? 'Enter your email' : 'Enter your phone number'}
            value={authMode === 'email' ? formData.email : formData.phone}
            onChange={(e) => handleInputChange(authMode === 'email' ? 'email' : 'phone', e.target.value)}
            required
          />
        </div>
        <div className="flex justify-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setAuthMode(authMode === 'email' ? 'phone' : 'email')}
            className="text-red-600 hover:text-red-700"
          >
            {authMode === 'email' ? (
              <>
                <Phone className="w-4 h-4 mr-1" />
                Use Phone Instead
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-1" />
                Use Email Instead
              </>
            )}
          </Button>
        </div>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
          Send Reset Code
        </Button>
      </form>
    </div>
  );

  const renderOTPForm = () => (
    <div>
      <div className="flex items-center mb-4">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep('login')}
          className="text-red-600 hover:text-red-700 p-0 h-auto mr-2"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>
      <form onSubmit={handleOTPVerification} className="space-y-6">
        <div className="text-center space-y-2">
          <p className="text-gray-600 dark:text-gray-300">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-medium text-gray-900 dark:text-white">
            {authMode === 'email' ? formData.email : formData.phone}
          </p>
        </div>
        <div className="flex justify-center">
          <InputOTP 
            maxLength={6} 
            value={formData.otp}
            onChange={(value) => handleInputChange('otp', value)}
          >
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>
        <div className="text-center">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-red-600 hover:text-red-700"
          >
            Didn't receive the code? Resend
          </Button>
        </div>
        <Button type="submit" className="w-full bg-red-600 hover:bg-red-700">
          Verify Code
        </Button>
      </form>
    </div>
  );

  const renderSuccessPage = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Welcome to NEWS4US!
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Your account has been successfully verified. You can now access all features.
        </p>
      </div>
      <Link to="/">
        <Button className="bg-red-600 hover:bg-red-700">
          Continue to Homepage
        </Button>
      </Link>
    </div>
  );

  if (currentStep === 'success') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link to="/">
              <h1 className="text-2xl font-bold cursor-pointer">
                <span className="text-red-600">NEWS</span>
                <span className="text-gray-900 dark:text-white">4US</span>
              </h1>
            </Link>
          </CardHeader>
          <CardContent>
            {renderSuccessPage()}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'otp-verification') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link to="/">
              <h1 className="text-2xl font-bold cursor-pointer">
                <span className="text-red-600">NEWS</span>
                <span className="text-gray-900 dark:text-white">4US</span>
              </h1>
            </Link>
            <CardTitle>Verify Your Account</CardTitle>
            <CardDescription>Enter the verification code we sent you</CardDescription>
          </CardHeader>
          <CardContent>
            {renderOTPForm()}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'forgot-password') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <Link to="/">
              <h1 className="text-2xl font-bold cursor-pointer">
                <span className="text-red-600">NEWS</span>
                <span className="text-gray-900 dark:text-white">4US</span>
              </h1>
            </Link>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>We'll send you a reset code</CardDescription>
          </CardHeader>
          <CardContent>
            {renderForgotPasswordForm()}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Link to="/">
            <h1 className="text-2xl font-bold cursor-pointer">
              <span className="text-red-600">NEWS</span>
              <span className="text-gray-900 dark:text-white">4US</span>
            </h1>
          </Link>
          <CardTitle>Welcome to NEWS4US</CardTitle>
          <CardDescription>Sign in to access your personalized news experience</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as AuthStep)}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="mt-6">
              {renderLoginForm()}
            </TabsContent>
            <TabsContent value="signup" className="mt-6">
              {renderSignupForm()}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}