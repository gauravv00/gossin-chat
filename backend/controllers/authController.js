const bcrypt = require("bcrypt");
const User = require("../models/User");
const OTP = require("../models/OTP");
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../utils/emailService');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET;

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('\n=== Login Attempt ===');
        console.log('Email:', email);
        
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            console.log('Invalid password');
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        const token = jwt.sign(
            { 
                id: user._id,
                username: user.username,
                email: user.email 
            },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        console.log('Generated token:', token.substring(0, 20) + '...');

        res.json({ 
            message: 'Login successful',
            user: {
                id: user._id.toString(),
                username: user.username,
                email: user.email
            },
            token: token
        });

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};

const verify = (req, res) => {
    res.json({ 
        user: req.user,
        verified: true
    });
};

// Generate 6-digit OTP
function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
}

const initiateSignup = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('\n=== Signup Initiation ===');
        console.log('Email:', email);

        // Generate OTP
        const otp = generateOTP();
        console.log('Generated OTP:', otp);

        // Delete any existing OTP for this email
        await OTP.deleteOne({ email });

        // Create new OTP document
        const otpDoc = new OTP({
            email,
            otp: otp.toString()
        });

        const savedOTP = await otpDoc.save();
        console.log('Saved OTP document:', {
            id: savedOTP._id,
            email: savedOTP.email,
            otp: savedOTP.otp,
            createdAt: savedOTP.createdAt
        });

        // Send OTP
        await sendOTP(email, otp);
        console.log('OTP sent successfully to email\n');
        
        res.status(200).json({ message: 'OTP sent successfully' });
    } catch (error) {
        console.error('Signup init error:', error);
        res.status(500).json({ error: 'Failed to initiate signup process' });
    }
};

const verifyAndSignup = async (req, res) => {
    try {
        const { email, otp, ...userData } = req.body;
        console.log('\n=== OTP Verification & Signup ===');
        console.log('Email:', email);
        console.log('Password length:', userData.password?.length);

        // Find the stored OTP
        const storedOTPDoc = await OTP.findOne({ email });
        
        if (!storedOTPDoc) {
            console.log('No OTP found for email:', email);
            return res.status(400).json({ 
                error: 'OTP expired or not found'
            });
        }

        console.log('Found stored OTP document:', {
            id: storedOTPDoc._id,
            email: storedOTPDoc.email,
            storedOTP: storedOTPDoc.otp,
            createdAt: storedOTPDoc.createdAt
        });

        // Direct string comparison
        const receivedOTP = otp.toString().trim();
        const storedOTP = storedOTPDoc.otp.toString().trim();
        
        console.log('OTP Comparison:', {
            stored: storedOTP,
            received: receivedOTP,
            match: receivedOTP === storedOTP
        });

        if (receivedOTP !== storedOTP) {
            console.log('OTP mismatch\n');
            return res.status(400).json({ 
                error: 'Invalid OTP'
            });
        }

        console.log('OTP verified successfully\n');

        // Create new user (password will be hashed by the model middleware)
        const user = new User({
            username: userData.username,
            firstName: userData.firstName,
            lastName: userData.lastName,
            email: email,
            password: userData.password, // Don't hash here, let the model handle it
            course: userData.course,
            rollNo: userData.rollNo
        });

        // Save the user
        const savedUser = await user.save();
        console.log('User created successfully:', {
            email: savedUser.email,
            passwordHashLength: savedUser.password.length
        });

        // Delete the OTP document
        await OTP.deleteOne({ email });

        res.status(201).json({ 
            message: 'User created successfully',
            debug: {
                email: savedUser.email,
                passwordHashLength: savedUser.password.length
            }
        });

    } catch (error) {
        console.error('Signup verification error:', error);
        res.status(500).json({ 
            error: error.message || 'Signup failed',
            debug: error.stack
        });
    }
};

module.exports = {
    login,
    verify,
    initiateSignup,
    verifyAndSignup
};
