
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface WaitlistEntry {
  name: string;
  email: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email }: WaitlistEntry = await req.json();

    // Send email to the user
    const userEmailResponse = await resend.emails.send({
      from: "TuneMigrate <onboarding@resend.dev>",
      to: [email],
      subject: "You've joined the TuneMigrate waitlist!",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>Welcome to the TuneMigrate waitlist, ${name}!</h1>
          <p>Thank you for joining our waitlist. We're working hard to bring you a great playlist conversion experience.</p>
          <p>We'll notify you as soon as you've been granted access to our service.</p>
          <p>Best regards,<br>The TuneMigrate Team</p>
        </div>
      `,
    });
    
    // Send notification to admin (you could replace this with your email)
    const adminEmailResponse = await resend.emails.send({
      from: "TuneMigrate Waitlist <onboarding@resend.dev>",
      to: ["admin@tunemigrate.com", "my@email.com"], // Added your personal email
      subject: "New Waitlist Registration",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h1>New Waitlist Registration</h1>
          <p>A new user has joined the TuneMigrate waitlist:</p>
          <ul>
            <li><strong>Name:</strong> ${name}</li>
            <li><strong>Email:</strong> ${email}</li>
          </ul>
        </div>
      `,
    });

    console.log("Emails sent successfully:", { user: userEmailResponse, admin: adminEmailResponse });

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in notify-waitlist function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
