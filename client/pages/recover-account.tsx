import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link } from "wouter";

const passwordRecoverySchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

const usernameRecoverySchema = z.object({
  email: z.string().email("Please enter a valid email address")
});

export default function RecoverAccount() {
  const { toast } = useToast();
  const [isPasswordLoading, setIsPasswordLoading] = useState(false);
  const [isUsernameLoading, setIsUsernameLoading] = useState(false);
  
  // Form for password recovery
  const passwordForm = useForm<z.infer<typeof passwordRecoverySchema>>({
    resolver: zodResolver(passwordRecoverySchema),
    defaultValues: {
      email: ""
    }
  });
  
  // Form for username recovery
  const usernameForm = useForm<z.infer<typeof usernameRecoverySchema>>({
    resolver: zodResolver(usernameRecoverySchema),
    defaultValues: {
      email: ""
    }
  });
  
  // Handle password recovery form submission
  async function onPasswordRecoverySubmit(data: z.infer<typeof passwordRecoverySchema>) {
    setIsPasswordLoading(true);
    
    try {
      const response = await fetch("/api/auth/recover-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Recovery Email Sent",
          description: "If this email exists in our system, you'll receive password reset instructions."
        });
        passwordForm.reset();
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
      setIsPasswordLoading(false);
    }
  }
  
  // Handle username recovery form submission
  async function onUsernameRecoverySubmit(data: z.infer<typeof usernameRecoverySchema>) {
    setIsUsernameLoading(true);
    
    try {
      const response = await fetch("/api/auth/recover-username", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });
      
      const result = await response.json();
      
      if (response.ok) {
        toast({
          title: "Recovery Email Sent",
          description: "If this email exists in our system, your username will be sent to you."
        });
        usernameForm.reset();
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
      setIsUsernameLoading(false);
    }
  }
  
  return (
    <div className="container max-w-md py-10 mx-auto">
      <Card className="w-full">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Account Recovery</CardTitle>
          <CardDescription>
            Recover your username or reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="password" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="password">Reset Password</TabsTrigger>
              <TabsTrigger value="username">Recover Username</TabsTrigger>
            </TabsList>
            
            <TabsContent value="password">
              <div className="space-y-4 py-4">
                <div className="text-sm">
                  Enter your email address and we'll send you instructions to reset your password.
                </div>
                <Form {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onPasswordRecoverySubmit)} className="space-y-4">
                    <FormField
                      control={passwordForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isPasswordLoading}
                    >
                      {isPasswordLoading ? "Sending..." : "Send Recovery Email"}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
            
            <TabsContent value="username">
              <div className="space-y-4 py-4">
                <div className="text-sm">
                  Enter your email address and we'll send you your username.
                </div>
                <Form {...usernameForm}>
                  <form onSubmit={usernameForm.handleSubmit(onUsernameRecoverySubmit)} className="space-y-4">
                    <FormField
                      control={usernameForm.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input placeholder="you@example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="submit" 
                      className="w-full" 
                      disabled={isUsernameLoading}
                    >
                      {isUsernameLoading ? "Sending..." : "Send Username"}
                    </Button>
                  </form>
                </Form>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <div className="text-sm text-center">
            Remember your credentials? <Link href="/login" className="font-medium underline">Sign in</Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}