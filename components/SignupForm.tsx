'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { FcGoogle } from 'react-icons/fc';
import { Mail, Lock, CheckCheck } from 'lucide-react';
import SignInWithGoogleButton from './SignInWithGoogleButton';
import { signup } from '@/lib/auth-actions';

export default function SignupForm() {
  return (
    <>
    
      <div className="h-100vh flex items-center justify-center p-1 overflow-x-hidden">
        <Card className="w-full max-w-lg  rounded-xl border-0 ">
          <CardHeader className="text-center">
            <CardTitle className="md:text-2xl text-xl font-medium relative top-5">
              Create an Account
            </CardTitle>
          </CardHeader>
          <CardContent className="  space-y-6">
            <form className="space-y-4" action={signup}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <div className="space-y-2">
                  <Label htmlFor="Name" className="text-[10px] sm:text-sm">Name</Label>
                  <Input
                    id="Name"
                    name="Name"
                    type="text"
                    placeholder="John"
                    required
                    className="text-xs w-[280px] sm:text-sm placeholder:text-[10px] md:w-[400px] sm:placeholder:text-xs"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs sm:text-sm">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="your@email.com"
                    className="pl-9 text-[10px] sm:text-sm placeholder:text-[10px] sm:placeholder:text-xs"
                    required
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
                    className="pl-9 text-[10px] sm:text-sm placeholder:text-[10px] sm:placeholder:text-xs"
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-xs sm:text-sm">Confirm Password</Label>
                <div className="relative">
                  <CheckCheck className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    className="pl-9 text-xs sm:text-sm placeholder:text-[10px] sm:placeholder:text-xs"
                    required
                  />
                </div>
              </div>
              <Button type="submit" className="w-full text-xs sm:text-sm py-2 sm:py-3">
                Sign Up
              </Button>
            </form>
            <div className="flex items-center justify-center">
              <span className="text-xs font-bold text-muted-foreground">OR</span>
            </div>
             <div>
            <SignInWithGoogleButton />
          </div>
            <p className="text-xs sm:text-sm text-center text-muted-foreground pt-2">
              Already have an account?{' '}
              <Link
                href="/"
                className="font-semibold text-primary hover:underline"
              >
                Login
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
