"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const emailTemplates = [
      {
        slug: "forgot-password",
        name: "Forgot Password",
        subject: "Reset Your Password - {{app_name}}",
        body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .email-header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #555555;
            line-height: 1.7;
        }
        
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .reset-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .alternative-link {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #666666;
        }
        
        .alternative-link strong {
            color: #333333;
        }
        
        .expiry-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
        }
        
        .email-footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-text {
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
        }
        
        .footer-links {
            margin-top: 20px;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        .security-notice {
            margin-top: 20px;
            padding: 15px;
            background-color: #e8f4fd;
            border-left: 4px solid #3498db;
            border-radius: 4px;
        }
        
        .security-notice p {
            font-size: 14px;
            color: #2c3e50;
            margin: 0;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 0;
            }
            
            .email-header, .email-body, .email-footer {
                padding: 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .reset-button {
                display: block;
                text-align: center;
                margin: 20px 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>{{app_name}}</h1>
            <p>Password Reset Request</p>
        </div>
        
        <div class="email-body">
            <div class="greeting">Hello {{user_name}},</div>
            
            <div class="message">
                We received a request to reset your password for your {{app_name}} account. If you made this request, please click the button below to create a new password.
            </div>
            
            <div class="button-container">
                <a href="{{reset_url}}" class="reset-button">Reset Your Password</a>
            </div>
            
            <div class="alternative-link">
                <strong>Button not working?</strong><br>
                Copy and paste this link into your browser:<br>
                <span style="word-break: break-all; color: #667eea;">{{reset_url}}</span>
            </div>
            
            <div class="expiry-notice">
                <strong>⏰ Important:</strong> This password reset link will expire in {{expiry_time}} for security reasons.
            </div>
            
            <div class="security-notice">
                <p><strong>Security Notice:</strong> If you didn't request this password reset, please ignore this email. Your password will remain unchanged. For security concerns, contact our support team immediately.</p>
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-text">
                This email was sent by {{app_name}}<br>
            </div>
        </div>
    </div>
</body>
</html>`,
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        slug: "welcome-email",
        name: "Welcome Email",
        subject: "Welcome to {{app_name}} - Get Started!",
        body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{app_name}}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .email-header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .email-header h1 {
            font-size: 32px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .email-header p {
            font-size: 18px;
            opacity: 0.9;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 20px;
            font-weight: 500;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .message {
            font-size: 16px;
            margin-bottom: 25px;
            color: #555555;
            line-height: 1.7;
        }
        
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .cta-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .features-list {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .features-list h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .features-list ul {
            list-style: none;
            padding: 0;
        }
        
        .features-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            font-size: 15px;
            color: #555555;
        }
        
        .features-list li:last-child {
            border-bottom: none;
        }
        
        .features-list li:before {
            content: "✓";
            color: #28a745;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .login-credentials {
            background-color: #e8f4fd;
            border: 1px solid #bee5eb;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .login-credentials h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
            text-align: center;
        }
        
        .credential-item {
            background-color: white;
            padding: 12px 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 4px solid #667eea;
            font-size: 15px;
        }
        
        .credential-item strong {
            color: #2c3e50;
            display: inline-block;
            width: 100px;
        }
        
        .security-warning {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-left: 4px solid #ffc107;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .security-warning h4 {
            color: #856404;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .security-warning p {
            color: #856404;
            font-size: 14px;
            margin: 0;
            line-height: 1.5;
        }
        
        .email-footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-text {
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
        }
        
        .footer-links {
            margin-top: 20px;
        }
        
        .footer-links a {
            color: #667eea;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 0;
            }
            
            .email-header, .email-body, .email-footer {
                padding: 20px;
            }
            
            .email-header h1 {
                font-size: 28px;
            }
            
            .cta-button {
                display: block;
                text-align: center;
                margin: 20px 0;
            }
            
            .credential-item {
                padding: 10px 12px;
            }
            
            .credential-item strong {
                display: block;
                width: auto;
                margin-bottom: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>Welcome to {{app_name}}!</h1>
            <p>You're all set to get started</p>
        </div>
        
        <div class="email-body">
            <div class="greeting">Hi {{user_name}},</div>
            
            <div class="message">
                Welcome to {{app_name}}! We're excited to have you on board. Your account has been successfully created and you're ready to explore all the amazing features we have to offer.
            </div>
            
            <div class="login-credentials">
                <h3>Your Login Details:</h3>
                <div class="credential-item">
                    <strong>Email:</strong> {{user_email}}
                </div>
                <div class="credential-item">
                    <strong>Password:</strong> {{user_password}}
                </div>
                <div class="credential-item">
                    <strong>Dashboard URL:</strong> <a href="{{dashboard_url}}" style="color: #667eea; text-decoration: none;">{{dashboard_url}}</a>
                </div>
            </div>
            
            <div class="security-warning">
                <h4>🔐 Important Security Notice</h4>
                <p>For your account security, please <strong>change your password</strong> immediately after your first login. Never share your login credentials with anyone.</p>
            </div>
            
            <div class="button-container">
                <a href="{{dashboard_url}}" class="cta-button">Access Your Dashboard</a>
            </div>
            
            <div class="features-list">
                <h3>What you can do with {{app_name}}:</h3>
                <ul>
                    <li>Access your personalized dashboard</li>
                    <li>Manage your account settings</li>
                    <li>Connect with our community</li>
                    <li>Get 24/7 customer support</li>
                </ul>
            </div>
            
            <div class="message">
                If you have any questions or need help getting started, our support team is here to help. Just reply to this email or visit our help center.
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-text">
                Thanks for joining {{app_name}}<br>
                {{company_address}}
            </div>
            
            <div class="footer-links">
                <a href="{{support_url}}">Support</a>
                <a href="{{privacy_url}}">Privacy Policy</a>
                <a href="{{terms_url}}">Terms of Service</a>
            </div>
        </div>
    </div>
</body>
</html>`,
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
      {
        slug: "email-verification",
        name: "Email Verification",
        subject: "Verify Your Email Address - {{app_name}}",
        body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #333333;
            background-color: #f4f4f4;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 8px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .email-header {
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .email-header h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 10px;
        }
        
        .email-header p {
            font-size: 16px;
            opacity: 0.9;
        }
        
        .email-body {
            padding: 40px 30px;
        }
        
        .greeting {
            font-size: 18px;
            font-weight: 500;
            margin-bottom: 20px;
            color: #2c3e50;
        }
        
        .message {
            font-size: 16px;
            margin-bottom: 30px;
            color: #555555;
            line-height: 1.7;
        }
        
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .verify-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .alternative-link {
            background-color: #f8f9fa;
            border: 1px solid #e9ecef;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #666666;
        }
        
        .alternative-link strong {
            color: #333333;
        }
        
        .expiry-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 6px;
            padding: 15px;
            margin: 20px 0;
            font-size: 14px;
            color: #856404;
        }
        
        .email-footer {
            background-color: #f8f9fa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e9ecef;
        }
        
        .footer-text {
            font-size: 14px;
            color: #666666;
            margin-bottom: 10px;
        }
        
        .footer-links {
            margin-top: 20px;
        }
        
        .footer-links a {
            color: #28a745;
            text-decoration: none;
            margin: 0 10px;
            font-size: 14px;
        }
        
        .footer-links a:hover {
            text-decoration: underline;
        }
        
        @media only screen and (max-width: 600px) {
            .email-container {
                margin: 10px;
                border-radius: 0;
            }
            
            .email-header, .email-body, .email-footer {
                padding: 20px;
            }
            
            .email-header h1 {
                font-size: 24px;
            }
            
            .verify-button {
                display: block;
                text-align: center;
                margin: 20px 0;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <h1>{{app_name}}</h1>
            <p>Email Verification Required</p>
        </div>
        
        <div class="email-body">
            <div class="greeting">Hello {{user_name}},</div>
            
            <div class="message">
                Thank you for signing up with {{app_name}}! To complete your registration and secure your account, please verify your email address by clicking the button below.
            </div>
            
            <div class="button-container">
                <a href="{{verification_url}}" class="verify-button">Verify Email Address</a>
            </div>
            
            <div class="alternative-link">
                <strong>Button not working?</strong><br>
                Copy and paste this link into your browser:<br>
                <span style="word-break: break-all; color: #28a745;">{{verification_url}}</span>
            </div>
            
            <div class="expiry-notice">
                <strong>⏰ Important:</strong> This verification link will expire in {{expiry_time}} for security reasons.
            </div>
            
            <div class="message">
                Once verified, you'll have full access to all {{app_name}} features. If you didn't create this account, please ignore this email.
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-text">
                This email was sent by {{app_name}}<br>
                {{company_address}}
            </div>
            
            <div class="footer-links">
                <a href="{{support_url}}">Support</a>
                <a href="{{privacy_url}}">Privacy Policy</a>
                <a href="{{terms_url}}">Terms of Service</a>
            </div>
        </div>
    </div>
</body>
</html>`,
        status: true,
        created_at: new Date(),
        updated_at: new Date(),
      },
    ];

    await queryInterface.bulkInsert("email_templates", emailTemplates);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("email_templates", null, {});
  },
};
