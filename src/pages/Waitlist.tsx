
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Header from "@/components/Header";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
});

const Waitlist = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsSubmitting(true);
    
    try {
      // Insert the data into the waitlist table in Supabase
      const { error } = await supabase
        .from('waitlist')
        .insert([
          { 
            name: values.name,
            email: values.email
          }
        ]);
      
      if (error) {
        console.error("Supabase error:", error);
        throw new Error(error.message);
      }
      
      // Show success message
      toast.success("You've been added to the waitlist!", {
        description: "We'll notify you when you've been granted access."
      });
      
      // Reset the form
      form.reset();
      
      // Redirect to home after a short delay
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Something went wrong", {
        description: "Please try again later."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-3 md:px-4 max-w-5xl min-h-screen flex flex-col">
      <div className="space-y-4 md:space-y-8">
        <Header />
        
        <div className="p-4 md:p-6 bg-white rounded-xl shadow-sm border">
          <div className="max-w-md mx-auto">
            <h1 className="text-xl md:text-2xl font-bold mb-2">Join the Waitlist</h1>
            
            <Alert className="mb-4 md:mb-6 bg-blue-50 text-blue-800 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertTitle>Why a waitlist?</AlertTitle>
              <AlertDescription className="text-sm">
                Due to Spotify API quota limitations, we can only support a limited number of users at a time. 
                New users need to be manually approved by our team to ensure service quality for everyone.
                Fill out the form below, and we'll notify you when you've been granted access.
              </AlertDescription>
            </Alert>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 md:space-y-6">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Spotify Account Email</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="you@example.com" {...field} />
                      </FormControl>
                      <FormDescription className="text-xs md:text-sm">
                        This must match the email you use for your Spotify account.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Join Waitlist"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Waitlist;
