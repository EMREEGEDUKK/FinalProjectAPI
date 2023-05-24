const nodeMailer = require('nodemailer');
const {createToken} = require('./jwt');


const sendEmail = async (email) => {
    const transporter = nodeMailer.createTransport({
        service: 'gmail',
        secure: true,
        auth: {
            user: process.env.SMTP_EMAIL,
            pass: process.env.SMTP_PASSWORD
}});

    const message = {
        from: process.env.SMTP_EMAIL,
        to: email,
        subject: 'Account Verification',
        text: `Please click on the link to verify your account: http://localhost:5000/verify/${createToken(email)}`
    };

    await transporter.sendMail(message,(err,info) => {
        if(err){
            console.log(err);
            } else {
                console.log(info);
        }});

    
}

module.exports = {
    sendEmail
}