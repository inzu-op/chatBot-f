'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { login } from '@/lib/auth-actions';
import { Mail, Lock, ArrowRight } from 'lucide-react';
import SignInWithGoogleButton from './SignInWithGoogleButton';


export default function LoginForm() {
  return (
    <>
    <div className="h-100vh flex items-center justify-center p-2 sm:p-4 ">
      <Card className="w-full max-w-lg shadow-lg rounded-xl border-0">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-medium relative top-5">Login</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <form className="space-y-4 ">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-9 text-sm sm:text-base py-3 md:w-[400px] sm:py-4 placeholder:text-[12px] sm:placeholder:text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs sm:text-sm">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  className="pl-9 text-sm sm:text-base py-3 sm:py-4 placeholder:text-[12px] sm:placeholder:text-sm"
                />
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-xs sm:text-sm text-muted-foreground"
                  >
                    Remember me
                  </label>
                </div>
                <Link
                  href="/forgot-password"
                  className="text-xs sm:text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </div>

            <Button type="submit" formAction={login} className="w-full text-xs sm:text-sm py-2 sm:py-3">
              Sign In <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <div className="flex items-center justify-center">
            <span className="text-xs font-bold text-muted-foreground">OR</span>
          </div>
          <div>
            <SignInWithGoogleButton />
          </div>
          <p className="text-xs sm:text-sm text-center text-muted-foreground pt-2">
            Don't have an account?{' '}
            <Link
              href="/signup"
              className="font-semibold text-primary hover:underline"
            >
              Signup
            </Link>
          </p>
        </CardContent>
      </Card>
    </div></>
  );
}