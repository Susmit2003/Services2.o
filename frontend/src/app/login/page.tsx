
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Smartphone, KeyRound, ArrowRight, Loader2, AlertCircle, User, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppLogo } from "@/components/icons/app-logo";
import { useAuth } from "@/context/auth-context";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { loginUser, signupUser, forgotPassword } from "@/lib/actions/user.actions";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { countries } from "@/lib/constants";
import { loginSchema, signupSchema } from "@/lib/validations";
import { z } from "zod";

export default function LoginPage() {
  const [isSignup, setIsSignup] = useState(false);
  const [countryDialCode, setCountryDialCode] = useState("+1");
  const [selectedCountryCode, setSelectedCountryCode] = useState("US");
  const [localMobileNumber, setLocalMobileNumber] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isMounted, setIsMounted] = useState(false);

  const { isLoggedIn, isLoading, currentUser, refetchUser } = useAuth();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fullMobileNumber = countryDialCode + localMobileNumber;

  useEffect(() => {
    if (isMounted) {
      fetch('https://ipapi.co/json/')
        .then(res => res.json())
        .then(data => {
          if (data && data.country_code) {
            const country = countries.find(c => c.code === data.country_code);
            if(country) {
                setSelectedCountryCode(country.code);
                setCountryDialCode(country.dial_code);
            }
          }
        })
        .catch(err => console.error("Could not fetch country code, defaulting.", err));
    }
  }, [isMounted]);

  // Redirect if already logged in
  useEffect(() => {
    if (isMounted && !isLoading && isLoggedIn) {
      router.replace('/dashboard');
    }
  }, [isLoggedIn, isLoading, router, isMounted]);

  const handleCountryChange = (countryCodeValue: string) => {
    const country = countries.find(c => c.code === countryCodeValue);
    if (country) {
        setSelectedCountryCode(country.code);
        setCountryDialCode(country.dial_code);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!localMobileNumber.match(/^\d{7,15}$/)) {
        setErrorMessage("Please enter a valid mobile number (7-15 digits).");
        return;
    }

    if (!password.trim()) {
        setErrorMessage("Please enter your password.");
        return;
    }
    
    setIsSubmitting(true);
    try {
        const loginData = {
            mobile: fullMobileNumber,
            password: password
        };
        
        console.log('🔐 Attempting login with:', { mobile: fullMobileNumber });
        
        // Validate with schema
        loginSchema.parse(loginData);
        
        const result = await loginUser(loginData);
        console.log('✅ Login successful, result:', result);
        
        // Save token to localStorage
        if (result.token) {
            console.log('💾 Saving token to localStorage...');
            localStorage.setItem('authToken', result.token);
            console.log('✅ Token saved, token value:', result.token.substring(0, 20) + '...');
            
            // Force auth context to update immediately
            await refetchUser();
            
            // Use router.push instead of window.location.href for better control
            console.log('🚀 Redirecting to dashboard...');
            router.push('/dashboard');
        } else {
            console.log('❌ No token in login result');
            setErrorMessage("Login failed - no token received");
        }
        
    } catch (error) {
        console.error('❌ Login error:', error);
        if (error instanceof z.ZodError) {
            setErrorMessage(error.errors[0].message);
        } else {
            setErrorMessage((error as Error).message || "Login failed. Please check your credentials and try again.");
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    
    if (!localMobileNumber.match(/^\d{7,15}$/)) {
        setErrorMessage("Please enter a valid mobile number (7-15 digits).");
        return;
    }

    if (!name.trim()) {
        setErrorMessage("Please enter your name.");
        return;
    }

    if (!password.trim()) {
        setErrorMessage("Please enter a password.");
        return;
    }

    if (password.length < 6) {
        setErrorMessage("Password must be at least 6 characters long.");
        return;
    }
    
    setIsSubmitting(true);
    try {
        const signupData = {
            name: name.trim(),
            mobile: fullMobileNumber,
            password: password,
            email: email.trim() || undefined
        };
        
        console.log('🔐 Attempting signup with:', { mobile: fullMobileNumber, name: name.trim() });
        
        // Validate with schema
        signupSchema.parse(signupData);
        
        const result = await signupUser(signupData);
        console.log('✅ Signup successful, result:', result);
        
        // Save token to localStorage
        if (result.token) {
            console.log('💾 Saving token to localStorage...');
            localStorage.setItem('authToken', result.token);
            console.log('✅ Token saved, token value:', result.token.substring(0, 20) + '...');
            
            // Force auth context to update immediately
            await refetchUser();
            
            // Use router.push instead of window.location.href for better control
            console.log('🚀 Redirecting to dashboard...');
            router.push('/dashboard');
        } else {
            console.log('❌ No token in signup result');
            setErrorMessage("Signup failed - no token received");
        }
        
    } catch (error) {
        console.error('❌ Signup error:', error);
        if (error instanceof z.ZodError) {
            setErrorMessage(error.errors[0].message);
        } else {
            setErrorMessage((error as Error).message || "Signup failed. Please try again.");
        }
    } finally {
        setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!localMobileNumber.match(/^\d{7,15}$/)) {
        setErrorMessage("Please enter a valid mobile number first.");
        return;
    }

    setIsSubmitting(true);
    try {
        const result = await forgotPassword(fullMobileNumber);
        setErrorMessage(""); // Clear any previous errors
        alert(`A temporary password has been sent to your mobile number. Please use it to log in and change your password.`);
    } catch (error) {
        setErrorMessage((error as Error).message || "Failed to process forgot password request.");
    } finally {
        setIsSubmitting(false);
    }
  };
  
  if (!isMounted) {
    return null; // Prevent hydration mismatch
  }

  if (isLoading) {
    return (
       <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center p-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-muted-foreground">Checking authentication...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="text-center">
          <Link href="/" className="inline-block mx-auto mb-4">
            <AppLogo className="h-12 w-12 text-primary" />
          </Link>
          <CardTitle className="font-headline text-2xl sm:text-3xl">Welcome to HandyConnect</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            {isSignup ? "Create your account" : "Login with your mobile number and password"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {errorMessage && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{isSignup ? "Signup Error" : "Login Error"}</AlertTitle>
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          <form onSubmit={isSignup ? handleSignup : handleLogin} className="space-y-6">
            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Full Name</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="pl-10 h-12"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="mobileNumber" className="text-base">Mobile Number</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Select value={selectedCountryCode} onValueChange={handleCountryChange}>
                  <SelectTrigger className="h-12 sm:w-[120px] sm:flex-shrink-0">
                    <SelectValue placeholder="Code" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map(c => <SelectItem key={c.code} value={c.code}>{c.code} ({c.dial_code})</SelectItem>)}
                  </SelectContent>
                </Select>
                <div className="relative flex-1">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="mobileNumber"
                    type="tel"
                    placeholder="Your mobile number"
                    value={localMobileNumber}
                    onChange={(e) => setLocalMobileNumber(e.target.value.replace(/\D/g, ''))}
                    required
                    minLength={7}
                    maxLength={15}
                    className="pl-10 h-12"
                    aria-describedby="mobileNumberHelp"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
               <p id="mobileNumberHelp" className="text-xs text-muted-foreground">Your country code is auto-detected. You can change it if needed.</p>
            </div>

            {isSignup && (
              <div className="space-y-2">
                <Label htmlFor="email" className="text-base">Email (Optional)</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email (optional)"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 h-12"
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">{isSignup ? "Create Password" : "Password"}</Label>
              <div className="relative">
                <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder={isSignup ? "Create a password (min 6 characters)" : "Enter your password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={isSignup ? 6 : undefined}
                  className="pl-10 h-12"
                  disabled={isSubmitting}
                />
              </div>
              {isSignup && (
                <p className="text-xs text-muted-foreground">Password must be at least 6 characters long.</p>
              )}
            </div>

            <Button type="submit" className="w-full h-12 text-base" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
              {isSubmitting ? "Processing..." : (isSignup ? "Create Account" : "Login")}
              {!isSubmitting && <ArrowRight className="ml-2 h-5 w-5" />}
            </Button>
          </form>

          <div className="mt-6 space-y-3">
            <div className="flex justify-center">
              <Button
                variant="link"
                onClick={() => {
                  setIsSignup(!isSignup);
                  setErrorMessage("");
                  setPassword("");
                  if (!isSignup) {
                    setName("");
                    setEmail("");
                  }
                }}
                disabled={isSubmitting}
                className="text-sm"
              >
                {isSignup ? "Already have an account? Login" : "Don't have an account? Sign up"}
              </Button>
            </div>
            
            {!isSignup && (
              <div className="flex justify-center">
                <Button
                  variant="link"
                  onClick={handleForgotPassword}
                  disabled={isSubmitting}
                  className="text-sm"
                >
                  Forgot Password?
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center text-center">
          <p className="text-xs text-muted-foreground">
            By continuing, you agree to HandyConnect's <br />
            <Link href="/terms" className="underline hover:text-primary">Terms of Service</Link> and <Link href="/privacy" className="underline hover:text-primary">Privacy Policy</Link>.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
