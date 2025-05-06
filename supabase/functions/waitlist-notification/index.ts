
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.1";

// CORS headers for browser requests
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface WaitlistRequest {
  name: string;
  email: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: WaitlistRequest = await req.json();
    
    if (!name || !email) {
      return new Response(
        JSON.stringify({ error: "Name and email are required" }),
        { 
          status: 400, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    // Create a Supabase client with the Admin key to access auth features
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Send email using Supabase Auth's email templates
    const { error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email: "pratikgangurde35@gmail.com",
      options: {
        data: {
          subject: "[tunemigrate] New Waitlist Submission",
          // We'll include the submission information in the email
          // by appending it to the redirect URL as search params
          redirectTo: `${Deno.env.get("SUPABASE_URL")}/auth/v1/redirect?name=${encodeURIComponent(name)}&submission_email=${encodeURIComponent(email)}`,
          // Additional metadata can be included here
        }
      }
    });

    if (error) {
      console.error("Error sending notification email:", error);
      return new Response(
        JSON.stringify({ error: "Failed to send notification email" }),
        { 
          status: 500, 
          headers: { ...corsHeaders, "Content-Type": "application/json" } 
        }
      );
    }

    return new Response(
      JSON.stringify({ message: "Notification sent successfully" }),
      { 
        status: 200, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  } catch (error) {
    console.error("Error in waitlist notification function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500, 
        headers: { ...corsHeaders, "Content-Type": "application/json" } 
      }
    );
  }
});
