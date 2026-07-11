package com.soubhagya.pingme.service.impl;

import com.soubhagya.pingme.entity.User;
import com.soubhagya.pingme.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
public void sendActivationEmail(User user, String token) {

    System.out.println("=================================");
    System.out.println("EMAIL SERVICE CALLED");
    System.out.println("To : " + user.getEmail());
    System.out.println("=================================");

    String activationLink =
            "http://localhost:5173/activate?token=" + token;

    String html = """
            <h2>Welcome to PingMe 🎉</h2>

            <p>Your account has been approved.</p>

            <p>Click the button below to create your password.</p>

            <a href="%s"
            style="
            background:#4f46e5;
            color:white;
            padding:12px 24px;
            border-radius:8px;
            text-decoration:none;
            display:inline-block;">
            Create Password
            </a>

            <p>This link expires in 24 hours.</p>
            """.formatted(activationLink);

    try {

        MimeMessage message = mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true);

        helper.setFrom("sanjaypallai076@gmail.com");   // <-- replace with your Gmail

        helper.setTo(user.getEmail());

        helper.setSubject("🎉 Your PingMe Account Has Been Approved");

        helper.setText(html, true);

        System.out.println("Sending email...");

        mailSender.send(message);

        System.out.println("Email sent successfully.");

    } catch (Exception e) {

        e.printStackTrace();

        throw new RuntimeException("Unable to send activation email", e);

    }

}

    @Override
public void sendForgotPasswordEmail(
        User user,
        String token
) {

    String html = """
            <h2>PingMe Password Reset</h2>

            <p>Hello %s,</p>

            <p>Use the OTP below to reset your password.</p>

            <h1
style="
font-size:38px;
letter-spacing:10px;
color:#4f46e5;
font-weight:bold;
margin:30px 0;">
%s
</h1>

            <p>This OTP expires in 24 hours.</p>

            <p>If you didn't request this, simply ignore this email.</p>
            """
            .formatted(
                    user.getFullName(),
                    token
            );

    try {

        MimeMessage message =
                mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true);

        helper.setFrom("soubhagyabatisahoo@gmail.com");

        helper.setTo(user.getEmail());

        helper.setSubject("PingMe Password Reset OTP");

        helper.setText(html, true);

        mailSender.send(message);

    }

    catch (Exception e) {

        throw new RuntimeException(
                "Unable to send forgot password email",
                e
        );

    }

}

    @Override
public void sendSimpleEmail(

        String to,

        String subject,

        String body

) {

    try {

        MimeMessage message =
                mailSender.createMimeMessage();

        MimeMessageHelper helper =
                new MimeMessageHelper(message, true);

        helper.setFrom("sanjaypallai076@gmail.com");

        helper.setTo(to);

        helper.setSubject(subject);

        helper.setText(body);

        mailSender.send(message);

    }

    catch (Exception e) {

        throw new RuntimeException(

                "Unable to send email",

                e

        );

    }

}

}