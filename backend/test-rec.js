require('dotenv').config();
const mongoose = require('mongoose');

// Mock axios BEFORE requiring controller
const axios = require('axios');
axios.post = async () => {
    return { data: { recommendations: [{ title: 'Test', description: 'Desc', type: 'general', priority: 'high', reasoning: 'reason' }] } };
};

mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/pcdp').then(async () => {
    try {
        const User = require('./models/User');
        const student = await User.findOne({ role: 'student' });
        if (!student) return console.log('no student');

        // Replace insertMany to just log what's being inserted
        const Recommendation = require('./models/Recommendation');
        Recommendation.insertMany = async (arr) => {
            console.log('INSERTING:', JSON.stringify(arr, null, 2));
            // Throw error if "general" is found
            const hasGeneral = arr.some(r => r.type === 'general');
            if (hasGeneral) throw new Error("Validation Error: 'general' is not a valid enum value for path 'type'");
            return arr;
        };

        const req = { user: { id: student._id } };
        const res = { status: (c) => ({ json: (d) => console.log('Response:', c, d) }) };
        const next = (e) => console.log('Next error:', e.message || e);
        const ctrl = require('./controllers/recommendationController');
        await ctrl.generateRecommendations(req, res, next);
    } catch (e) {
        console.error('Error outer:', e);
    } finally {
        process.exit();
    }
}).catch(console.error);
