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
      {
        slug: "company-rejection",
        name: "Company Application Rejection",
        subject: "Update on Your {{app_name}} Company Application",
        body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Company Application Update</title>
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
            background: linear-gradient(135deg, #dc3545 0%, #c62828 100%);
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
            margin-bottom: 25px;
            color: #555555;
            line-height: 1.7;
        }
        
        .rejection-notice {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-left: 4px solid #dc3545;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .rejection-notice h3 {
            color: #721c24;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .rejection-notice p {
            color: #721c24;
            font-size: 15px;
            margin: 10px 0;
            line-height: 1.5;
        }
        
        .feedback-section {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .feedback-section h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .feedback-section ul {
            list-style: none;
            padding: 0;
        }
        
        .feedback-section li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            font-size: 15px;
            color: #555555;
        }
        
        .feedback-section li:last-child {
            border-bottom: none;
        }
        
        .feedback-section li:before {
            content: "•";
            color: #dc3545;
            font-weight: bold;
            margin-right: 10px;
        }
        
        .reapply-button {
            display: inline-block;
            background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            color: white;
            text-decoration: none;
            padding: 15px 30px;
            border-radius: 6px;
            font-size: 16px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .reapply-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(108, 117, 125, 0.4);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
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
            color: #dc3545;
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
            
            .reapply-button {
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
            <p>Company Application Update</p>
        </div>
        
        <div class="email-body">
            <div class="greeting">Dear {{company_name}} Team,</div>
            
            <div class="message">
                Thank you for your interest in joining {{app_name}} and for taking the time to submit your company application. We appreciate the effort you put into your submission.
            </div>
            
            <div class="rejection-notice">
                <h3>Application Status Update</h3>
                <p>After careful review of your application, we regret to inform you that we are unable to approve your company registration at this time.</p>
            </div>
            
            <div class="message">
                If you have any questions about this decision or need clarification on the feedback provided, please don't hesitate to contact our support team. We're here to help you succeed.
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-text">
                Best regards,<br>
                The {{app_name}} Team
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
        slug: "subscription-extension",
        name: "Subscription Extension Notification",
        subject: "Great News! Your {{app_name}} Subscription Has Been Extended",
        body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Extended</title>
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
        
        .extension-details {
            background-color: #d4edda;
            border: 1px solid #c3e6cb;
            border-left: 4px solid #28a745;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .extension-details h3 {
            color: #155724;
            margin-bottom: 15px;
            font-size: 18px;
            text-align: center;
        }
        
        .detail-item {
            background-color: white;
            padding: 12px 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 4px solid #28a745;
            font-size: 15px;
        }
        
        .detail-item strong {
            color: #155724;
            display: inline-block;
            width: 140px;
        }
        
        .celebration-icon {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
        }
        
        .access-button {
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
        
        .access-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .benefits-list {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .benefits-list h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .benefits-list ul {
            list-style: none;
            padding: 0;
        }
        
        .benefits-list li {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            font-size: 15px;
            color: #555555;
        }
        
        .benefits-list li:last-child {
            border-bottom: none;
        }
        
        .benefits-list li:before {
            content: "🎉";
            margin-right: 10px;
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
                font-size: 28px;
            }
            
            .access-button {
                display: block;
                text-align: center;
                margin: 20px 0;
            }
            
            .detail-item {
                padding: 10px 12px;
            }
            
            .detail-item strong {
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
            <h1>Subscription Extended!</h1>
            <p>Your {{app_name}} journey continues</p>
        </div>
        
        <div class="email-body">
            <div class="celebration-icon">🎉</div>
            
            <div class="greeting">Hello {{user_name}},</div>
            
            <div class="message">
                We have some fantastic news! Your {{app_name}} subscription has been extended. You can now continue enjoying all the premium features and benefits without any interruption.
            </div>
            
            <div class="extension-details">
                <h3>📋 Extension Details</h3>
                <div class="detail-item">
                    <strong>Plan:</strong> {{subscription_type}}
                </div>
                <div class="detail-item">
                    <strong>Extended Until:</strong> {{new_expiry_date}}
                </div>
                <div class="detail-item">
                    <strong>Extension Period:</strong> {{extension_period}}
                </div>
            </div>
            
            <div class="button-container">
                <a href="{{dashboard_url}}" class="access-button">Access Your Dashboard</a>
            </div>
            
            <div class="benefits-list">
                <h3>Continue enjoying these benefits:</h3>
                <ul>
                    <li>Full access to all premium features</li>
                    <li>Priority customer support</li>
                    <li>Advanced analytics and reporting</li>
                    <li>Unlimited usage limits</li>
                    <li>Early access to new features</li>
                </ul>
            </div>
            
            <div class="message">
                Thank you for being a valued member of the {{app_name}} community. We're committed to providing you with the best possible experience, and this extension is our way of showing appreciation for your loyalty.
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-text">
                Keep enjoying {{app_name}}!<br>
                The {{app_name}} Team
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
        slug: "subscription-expiration-warning",
        name: "Subscription Expiration Warning",
        subject:
          "⚠️ Your {{app_name}} Subscription Expires in {{days_remaining}} Days",
        body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Subscription Expiration Warning</title>
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
            background: linear-gradient(135deg, #ffc107 0%, #ff8f00 100%);
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
            margin-bottom: 25px;
            color: #555555;
            line-height: 1.7;
        }
        
        .warning-notice {
            background-color: #fff3cd;
            border: 1px solid #ffeaa7;
            border-left: 4px solid #ffc107;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        
        .warning-notice h3 {
            color: #856404;
            margin-bottom: 15px;
            font-size: 20px;
        }
        
        .countdown {
            font-size: 36px;
            font-weight: bold;
            color: #ff6b00;
            margin: 15px 0;
        }
        
        .expiry-details {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .expiry-details h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .detail-item {
            background-color: white;
            padding: 12px 15px;
            margin: 10px 0;
            border-radius: 6px;
            border-left: 4px solid #ffc107;
            font-size: 15px;
        }
        
        .detail-item strong {
            color: #2c3e50;
            display: inline-block;
            width: 120px;
        }
        
        .renew-button {
            display: inline-block;
            background: linear-gradient(135deg, #28a745 0%, #20c997 100%);
            color: white;
            text-decoration: none;
            padding: 18px 35px;
            border-radius: 6px;
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .renew-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(40, 167, 69, 0.4);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .consequences-list {
            background-color: #f8d7da;
            border: 1px solid #f5c6cb;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .consequences-list h3 {
            color: #721c24;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .consequences-list ul {
            list-style: none;
            padding: 0;
        }
        
        .consequences-list li {
            padding: 8px 0;
            border-bottom: 1px solid #f1b0b7;
            font-size: 15px;
            color: #721c24;
        }
        
        .consequences-list li:last-child {
            border-bottom: none;
        }
        
        .consequences-list li:before {
            content: "⚠️";
            margin-right: 10px;
        }
        
        .contact-support {
            background-color: #e2e3e5;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
            text-align: center;
        }
        
        .contact-support h4 {
            color: #383d41;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .contact-support p {
            color: #383d41;
            font-size: 14px;
            margin: 0;
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
            color: #ffc107;
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
            
            .renew-button {
                display: block;
                text-align: center;
                margin: 20px 0;
                font-size: 16px;
                padding: 15px 25px;
            }
            
            .countdown {
                font-size: 28px;
            }
            
            .detail-item {
                padding: 10px 12px;
            }
            
            .detail-item strong {
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
            <h1>{{app_name}}</h1>
            <p>Subscription Expiration Alert</p>
        </div>
        
        <div class="email-body">
            <div class="greeting">Hello {{user_name}},</div>
            
            <div class="message">
                This is an important reminder about your {{app_name}} subscription. Your current plan is set to expire soon, and we want to make sure you don't lose access to your premium features.
            </div>
            
            <div class="warning-notice">
                <h3>⚠️ Your Subscription Expires In:</h3>
                <div class="countdown">{{days_remaining}} DAYS</div>
                <p style="color: #856404; font-size: 16px; margin-top: 10px;">Don't let your access expire!</p>
            </div>
            
            <div class="expiry-details">
                <h3>📋 Subscription Details</h3>
                <div class="detail-item">
                    <strong>Current Plan:</strong> {{subscription_type}}
                </div>
                <div class="detail-item">
                    <strong>Expiry Date:</strong> {{expiry_date}}
                </div>
            </div>
            
            <div class="consequences-list">
                <h3>What happens if your subscription expires:</h3>
                <ul>
                    <li>Loss of access to premium features</li>
                    <li>Reduced usage limits</li>
                    <li>Limited customer support</li>
                    <li>Data export restrictions</li>
                    <li>Account will be downgraded to free tier</li>
                </ul>
            </div>
            
            <div class="message">
                Renewing is quick and easy! Click the button above to choose your preferred plan and continue enjoying uninterrupted access to all {{app_name}} features.
            </div>
            
            <div class="contact-support">
                <h4>Need Help?</h4>
                <p>If you have questions about renewal or need assistance, our support team is ready to help. Contact us at {{support_email}} or visit our help center.</p>
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-text">
                Don't wait - Renew today!<br>
                The {{app_name}} Team
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
        slug: "employee-welcome",
        name: "Employee Welcome - Added by Admin",
        subject:
          "Welcome to {{company_name}} - Your {{app_name}} Account is Ready!",
        body: `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to {{company_name}}</title>
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
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
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
        
        .company-logo {
            width: 60px;
            height: 60px;
            background-color: rgba(255, 255, 255, 0.2);
            border-radius: 50%;
            margin: 0 auto 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 24px;
            font-weight: bold;
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
        
        .welcome-notice {
            background-color: #dbeafe;
            border: 1px solid #93c5fd;
            border-left: 4px solid #4f46e5;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
            text-align: center;
        }
        
        .welcome-notice h3 {
            color: #1e40af;
            margin-bottom: 10px;
            font-size: 18px;
        }
        
        .welcome-notice p {
            color: #1e40af;
            font-size: 15px;
            margin: 5px 0;
        }
        
        .login-credentials {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 8px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .login-credentials h3 {
            color: #2c3e50;
            margin-bottom: 20px;
            font-size: 18px;
            text-align: center;
        }
        
        .credential-item {
            background-color: white;
            padding: 15px;
            margin: 12px 0;
            border-radius: 6px;
            border-left: 4px solid #4f46e5;
            font-size: 15px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        }
        
        .credential-label {
            color: #2c3e50;
            font-weight: 600;
            min-width: 80px;
        }
        
        .credential-value {
            color: #4f46e5;
            font-weight: 500;
            background-color: #f1f5f9;
            padding: 5px 10px;
            border-radius: 4px;
            font-family: 'Courier New', monospace;
        }
        
        .role-badge {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 600;
            display: inline-block;
            margin: 10px 0;
        }
        
        .login-button {
            display: inline-block;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
            color: white;
            text-decoration: none;
            padding: 18px 35px;
            border-radius: 6px;
            font-size: 18px;
            font-weight: 600;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        
        .login-button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(79, 70, 229, 0.4);
        }
        
        .button-container {
            text-align: center;
            margin: 30px 0;
        }
        
        .security-warning {
            background-color: #fef3c7;
            border: 1px solid #fcd34d;
            border-left: 4px solid #f59e0b;
            border-radius: 6px;
            padding: 20px;
            margin: 25px 0;
        }
        
        .security-warning h4 {
            color: #92400e;
            margin-bottom: 10px;
            font-size: 16px;
        }
        
        .security-warning p {
            color: #92400e;
            font-size: 14px;
            margin: 8px 0;
            line-height: 1.5;
        }
        
        .company-info {
            background-color: #f8f9fa;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .company-info h3 {
            color: #2c3e50;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .info-item {
            padding: 8px 0;
            border-bottom: 1px solid #e9ecef;
            font-size: 15px;
            color: #555555;
            display: flex;
            justify-content: space-between;
        }
        
        .info-item:last-child {
            border-bottom: none;
        }
        
        .info-label {
            font-weight: 500;
            color: #2c3e50;
        }
        
        .next-steps {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 6px;
            padding: 25px;
            margin: 25px 0;
        }
        
        .next-steps h3 {
            color: #065f46;
            margin-bottom: 15px;
            font-size: 18px;
        }
        
        .next-steps ul {
            list-style: none;
            padding: 0;
        }
        
        .next-steps li {
            padding: 8px 0;
            font-size: 15px;
            color: #065f46;
        }
        
        .next-steps li:before {
            content: "✓";
            color: #10b981;
            font-weight: bold;
            margin-right: 10px;
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
            color: #4f46e5;
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
            
            .login-button {
                display: block;
                text-align: center;
                margin: 20px 0;
                font-size: 16px;
                padding: 15px 25px;
            }
            
            .credential-item {
                flex-direction: column;
                align-items: flex-start;
                padding: 12px;
            }
            
            .credential-label {
                margin-bottom: 5px;
            }
            
            .credential-value {
                width: 100%;
                text-align: center;
            }
            
            .info-item {
                flex-direction: column;
                align-items: flex-start;
            }
            
            .info-label {
                margin-bottom: 3px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="email-header">
            <div class="company-logo">{{company_initial}}</div>
            <h1>Welcome to {{company_name}}!</h1>
            <p>Your account has been created</p>
        </div>
        
        <div class="email-body">
            <div class="greeting">Hello {{employee_name}},</div>
            
            <div class="message">
                Welcome to {{company_name}}! We're excited to have you join our team. {{admin_name}} has created your {{app_name}} account, and you're all set to get started.
            </div>
            
            <div class="welcome-notice">
                <h3>🎉 Account Successfully Created!</h3>
                <p>Your role: <span class="role-badge">{{employee_role}}</span></p>
                <p>Added by: {{admin_name}} ({{admin_role}})</p>
            </div>
            
            <div class="login-credentials">
                <h3>🔐 Your Login Credentials</h3>
                <div class="credential-item">
                    <span class="credential-label">Email:</span>
                    <span class="credential-value">{{employee_email}}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Password:</span>
                    <span class="credential-value">{{employee_password}}</span>
                </div>
                <div class="credential-item">
                    <span class="credential-label">Login URL:</span>
                    <span class="credential-value">{{login_url}}</span>
                </div>
            </div>
            
            <div class="security-warning">
                <h4>🔒 Important Security Notice</h4>
                <p><strong>Please change your password immediately</strong> after your first login for security purposes.</p>
                <p>Keep your credentials confidential and never share them with anyone outside your organization.</p>
                <p>If you suspect any unauthorized access, contact your admin immediately.</p>
            </div>
            
            <div class="button-container">
                <a href="{{login_url}}" class="login-button">Login to Your Account</a>
            </div>
            
            <div class="company-info">
                <h3>📋 Company & Role Information</h3>
                <div class="info-item">
                    <span class="info-label">Company:</span>
                    <span>{{company_name}}</span>
                </div>
                <div class="info-item">
                    <span class="info-label">Your Role:</span>
                    <span>{{employee_role}}</span>
                </div>
            </div>
        </div>
        
        <div class="email-footer">
            <div class="footer-text">
                Welcome aboard!<br>
                {{company_name}} Team via {{app_name}}
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
