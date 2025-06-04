import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { userRegistrationSchema, type UserRegistration } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

import { Separator } from "@/components/ui/separator";
import { useMutation } from "@tanstack/react-query";
import { useLocation, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export default function RegisterPage() {
  const [_, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<UserRegistration>({
    resolver: zodResolver(userRegistrationSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      confirmPassword: ""
    }
  });

  const registerMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Add guest data to preserve XP and campaign progress
      const guestProgress = localStorage.getItem('userProgress');
      const guestCampaigns = localStorage.getItem('campaignProgress');
      
      if (guestProgress) {
        try {
          const progress = JSON.parse(guestProgress);
          if (progress.xp) {
            data.append('guestXP', progress.xp.toString());
          }
        } catch (e) {
          console.log('Could not parse guest progress');
        }
      }
      
      if (guestCampaigns) {
        data.append('guestCampaignProgress', guestCampaigns);
      }
      
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: data
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Clear local storage since data has been transferred to account
      localStorage.removeItem('userProgress');
      localStorage.removeItem('campaignProgress');
      
      toast({
        title: "Welcome to CJSR!",
        description: "Account created! Your progress has been saved to your new account.",
        variant: "default"
      });
      // Direct new users to profile customization
      setLocation("/profile?welcome=true");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  });

  const onSubmit = (data: UserRegistration) => {
    const formData = new FormData();
    formData.append("username", data.username);
    formData.append("password", data.password);
    
    if (data.email) {
      formData.append("email", data.email);
    }
    
    // Check for placement test selections in localStorage/sessionStorage
    const placementStats = sessionStorage.getItem('placement_stats');
    const selectedFaction = localStorage.getItem('selected_faction');
    const selectedChicken = localStorage.getItem('selected_chicken');
    const selectedJockey = localStorage.getItem('selected_jockey');
    
    if (placementStats) {
      formData.append("placement_stats", placementStats);
    }
    if (selectedFaction) {
      formData.append("selected_faction", selectedFaction);
    }
    if (selectedChicken) {
      formData.append("selected_chicken", selectedChicken);
    }
    if (selectedJockey) {
      formData.append("selected_jockey", selectedJockey);
    }
    
    registerMutation.mutate(formData);
  };



  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card className="minecraft-border">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-minecraft text-center text-primary uppercase">Register</CardTitle>
          <CardDescription className="text-center">
            Create a new account to join the Chicken Jockey races!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

              
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter username" {...field} />
                    </FormControl>
                    <FormDescription>
                      Your public display name for races
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email (optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter email" type="email" {...field} />
                    </FormControl>
                    <FormDescription>
                      For password recovery (not required)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input placeholder="Create password" type="password" {...field} />
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
                      <Input placeholder="Confirm password" type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Button 
                type="submit" 
                className="w-full"
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? "Creating Account..." : "Create Account"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <Separator />
        <CardFooter className="flex justify-center py-4">
          <div className="text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="text-primary hover:underline">
              Log in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}