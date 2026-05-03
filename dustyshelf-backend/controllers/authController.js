const jwt = require('jsonwebtoken');
const { User } = require('../models');
const { admin } = require('../config/firebase');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

exports.register = async (req, res, next) => {
    try {
        const { name, email, password } = req.body;

        const userExists = await User.findOne({ where: { email } });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = await User.create({
            name,
            email,
            password
        });

        res.status(201).json({
            success: true,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id)
        });
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ where: { email } });

        if (user && (await user.matchPassword(password))) {
            res.json({
                success: true,
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user.id)
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (error) {
        next(error);
    }
};

exports.googleSignIn = async (req, res, next) => {
    try {
        const { idToken, uid, email, name } = req.body;
        
        let decodedUid = uid;
        let decodedEmail = email;
        let decodedName = name;

        // Try to verify token if provided and Firebase Admin is initialized
        if (idToken && admin.apps && admin.apps.length > 0) {
            try {
                const decodedToken = await admin.auth().verifyIdToken(idToken);
                decodedUid = decodedToken.uid;
                decodedEmail = decodedToken.email;
                decodedName = decodedToken.name;
            } catch (err) {
                console.warn("Token verification failed or Admin SDK not initialized, falling back to provided user data.");
            }
        }

        if (!decodedUid || !decodedEmail) {
            res.status(400);
            throw new Error('Valid user data or ID Token is required');
        }

        let user = await User.findOne({ 
            where: { 
                [require('sequelize').Op.or]: [{ firebaseUid: decodedUid }, { email: decodedEmail }] 
            } 
        });

        if (!user) {
            user = await User.create({
                name: decodedName || 'Google User',
                email: decodedEmail,
                firebaseUid: decodedUid
            });
        } else if (!user.firebaseUid) {
            user.firebaseUid = decodedUid;
            await user.save();
        }

        res.json({
            success: true,
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id)
        });
    } catch (error) {
        next(error);
    }
};

exports.getUserProfile = async (req, res, next) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: { exclude: ['password'] }
        });

        if (user) {
            res.json({
                success: true,
                user
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (error) {
        next(error);
    }
};
