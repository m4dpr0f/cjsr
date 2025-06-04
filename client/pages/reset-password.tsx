import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Link, useLocation } from "wouter";
import { useQueryParam } from "@/hooks/use-query-param";

const passwordResetSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Password must be at least 6 characters")
}).refine(
  (data) => data.newPassword === data.confirmPassword,
  {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  }
);

export default function ResetPassword() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const token = useQueryParam("token") || "";
  
  // Form for password reset
  const form = useForm<z.infer<typeof passwordResetSchema>>({
    resolver: zodResolver(passwordResetSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: ""
    }
  });
  
  // Check if token is valid
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      return;
    }
    
    // In a real app, you would validate the token on the server
    // For now, we'll assume it's valid if it exists
    setTokenValid(true);
  }, [token]);
  
  // Handle password reset form submission
  async function onSubmit(data: z.infer<typeof passwordResetSchema>) {
    if (!token) {
      toast({
        title: "Error",
        description: "Invalid or missing token",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          token,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword
        })
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Success",
          description: "Your password has been reset successfully."
        });
        form.reset();
        
        // Redirect to login page after a short delay
        setTimeout(() => {
          setLocation("/login");
        }, 2000);
      } else {
        toast({
          title: "Something went wrong",
          description: result.message || "Please try again later.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }
  
  // If token is invalid, show error
  if (tokenValid === false) {
    return (
      <div className="container max-w-md py-10 mx-auto">
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">Invalid Token</CardTitle>
            <CardDescription>
              The password reset link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center mb-4">
              Please request a new password reset link.
            </p>
            <Button 
              className="w-full" 
              onClick={() => setLocation("/recover-account")}
            >
              Request New Link
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }
  
  // Loading state while checking token
  if (tokenValid === null) {
    return (
      <div className="container max-w-md py-10 mx-auto">
        <Card className="w-full p-8 flex justify-center items-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </Card>
      </div>
    );
  }
  
  // Main reset password form
  return (
    <div className="container max-w-md py-10 mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Reset Password</CardTitle>
          <CardDescription>
            Enter your new password below
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? "Resetting..." : "Reset Password"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            Remember your password? <Link href="/login" className="font-medium underline">Sign in</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}