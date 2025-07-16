const express = require('express');
const router = express.Router();
const Report = require('../models/Report');
const { verifyToken } = require('../middleware/authMiddleware');

// This will handle POST requests to /api/reports
router.post('/', verifyToken, async (req, res) => {
    try {
        console.log('Received report request:', req.body);
        console.log('User from token:', req.user);

        const { messageId, reportType, additionalDetails, reportedUser, messageContent } = req.body;
        
        if (!messageId || !reportType || !reportedUser || !messageContent) {
            return res.status(400).json({ 
                error: 'Missing required fields',
                received: { messageId, reportType, reportedUser, messageContent }
            });
        }

        const report = new Report({
            messageId,
            reportedBy: req.user.id,
            reportedUser,
            reason: reportType,
            description: additionalDetails || '',
            messageContent,
            timestamp: new Date(),
            status: 'pending'
        });

        console.log('Attempting to save report:', report);

        const savedReport = await report.save();
        console.log('Report saved successfully:', savedReport);

        res.status(201).json({ 
            message: 'Report submitted successfully',
            reportId: savedReport._id 
        });

    } catch (error) {
        console.error('Error saving report:', error);
        res.status(500).json({ 
            error: 'Failed to submit report',
            details: error.message 
        });
    }
});

module.exports = router; 