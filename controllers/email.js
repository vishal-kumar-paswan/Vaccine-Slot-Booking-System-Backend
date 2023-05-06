const nodemailer = require("nodemailer");

// User signup email
exports.signupMail = async (email, name) => {
    const mailTemplate =
        `
Dear ${name},

Welcome to eVaccination Portal! We are excited to have you on board as a registered user and look forward to helping you schedule your next vaccination appointment.
        
As a registered user, you now have access to our user-friendly platform, which enables you to book your vaccination appointment, view your vaccination history, and receive important updates and notifications regarding the vaccination process.

Please note that the vaccination process is subject to the prioritization criteria set by the authorities and that the availability of appointments may vary based on the demand and supply of vaccines in your area. We encourage you to regularly check your eligibility status and book your appointment as soon as you become eligible.

If you have any questions or concerns, please do not hesitate to reach out to our support team. We are here to help you navigate the vaccination process and ensure a smooth and hassle-free experience.

Thank you for choosing eVaccination Portal as your trusted source for vaccination information and services.

Best regards,
eVaccination Portal Team
`;

    // Creating SMTP instance
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 300,
        secure: true,
        logger: true,
        debug: true,
        secureConnection: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: true
        },
    });

    transporter.verify((err, success) => {
        if (err) console.error("Erorrr::", err);
        console.log("Success: ", success);
    });

    const mailOptions = {
        from: `"eVaccination Portal" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Welcome to eVaccination Portal',
        text: mailTemplate
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error occured: ", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Vaccination centre registration email
exports.registrationMail = async (email) => {
    const mailTemplate =
        `
Dear sir/ma'am,

We are pleased to inform you that your application to register a new vaccination centre has been approved. Your centre is now officially registered with eVaccination Portal and is eligible to administer vaccines to the public.
        
As a registered vaccination centre, you are required to adhere to the guidelines and regulations set by the eVaccination Portal to ensure the safety and effectiveness of the vaccination process. We have attached a copy of the guidelines and protocols for your reference.
        
Please note that as a vaccination centre, you are responsible for the proper storage, handling, and administration of the vaccines, as well as the training and supervision of your staff. We strongly recommend that you follow the best practices and standards established by the health authorities to ensure the highest quality of care for your patients.

We would like to thank you for your commitment to the public health and your contribution is greatly appreciated, and we are confident that together, we can make a significant impact in the fight against the diseases.

If you have any questions or concerns regarding the registration process or the vaccination guidelines, please do not hesitate to contact us. We are here to support you and provide you with the necessary information and resources to ensure a successful vaccination campaign.

Best regards,
eVaccination Portal Team
`;

    // Creating SMTP instance
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 300,
        secure: true,
        logger: true,
        debug: true,
        secureConnection: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: true
        },
    });

    transporter.verify((err, success) => {
        if (err) console.error("Erorrr::", err);
        console.log("Success: ", success);
    });

    const mailOptions = {
        from: `"eVaccination Portal" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Registration Confirmation - New Vaccination Centre',
        text: mailTemplate
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error occured: ", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Submitting booking request mail
exports.bookingRequestMail = async (email, name, centre_name) => {
    const mailTemplate =
        `
Dear ${name},
Thank you for booking your vaccination through eVaccination Portal. You'll be receiving a confirmation mail once your request has been approved by ${centre_name}.

Regards,
eVaccination Portal Team.
`;

    // Creating SMTP instance
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 300,
        secure: true,
        logger: true,
        debug: true,
        secureConnection: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: true
        },
    });

    transporter.verify((err, success) => {
        if (err) console.error("Erorrr::", err);
        console.log("Success: ", success);
    });

    const mailOptions = {
        from: `"eVaccination Portal" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Vaccination Request Submitted',
        text: mailTemplate
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error occured: ", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Request approved email
exports.bookingApprovedMail = async (email, name, centre_name, address, date, bookingId) => {
    const mailTemplate =
        `
Dear ${name},

We're pleased to inform you that your vaccination booking request has been approved. Your appointment is scheduled for ${date} at ${centre_name} located at ${address} with the booking ID ${bookingId}.

We encourage you to arrive at the vaccination center 10-15 minutes prior to your scheduled appointment time. Please bring a valid government-issued ID, such as your passport or driver's license, and your health insurance information, if applicable.

Thank you for your cooperation.

Best Regards,
eVaccination Portal Team.

`;

    // Creating SMTP instance
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 300,
        secure: true,
        logger: true,
        debug: true,
        secureConnection: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: true
        },
    });

    transporter.verify((err, success) => {
        if (err) console.error("Erorrr::", err);
        console.log("Success: ", success);
    });

    const mailOptions = {
        from: `"eVaccination Portal" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Approved Vaccination Booking Request',
        text: mailTemplate
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error occured: ", error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}

// Request declined email
exports.bookingDeclinedMail = async (email, name) => {
    const mailTemplate =
        `
Dear ${name},

We regret to inform you that your vaccination booking request has been declined. Our records indicate that you are not currently eligible for vaccination based on the current prioritization criteria set by the authorities.
        
In case you have any questions or concerns regarding the vaccination process, please do not hesitate to reach out to us. Our team is available to provide you with information and support on how to access the vaccine as soon as you become eligible.
        
Thank you for your understanding and cooperation.
        
Best regards,
eVaccination Portal Team.
`;

    // Creating SMTP instance
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        port: 300,
        secure: true,
        logger: true,
        debug: true,
        secureConnection: false,
        auth: {
            user: process.env.EMAIL,
            pass: process.env.APP_PASSWORD
        },
        tls: {
            rejectUnauthorized: true
        },
    });

    transporter.verify((err, success) => {
        if (err) console.error(err);
    });

    const mailOptions = {
        from: `"eVaccination Portal" <${process.env.EMAIL}>`,
        to: email,
        subject: 'Declined Vaccination Booking Request',
        text: mailTemplate
    };

    await transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log("Error occured: ", error);
        }
    });
}