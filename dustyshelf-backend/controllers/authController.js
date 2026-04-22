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
        const { idToken } = req.body;
        if (!idToken) {
            res.status(400);
            throw new Error('ID Token is required');
        }

        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const { uid, email, name } = decodedToken;

        let user = await User.findOne({ 
            where: { 
                [require('sequelize').Op.or]: [{ firebaseUid: uid }, { email }] 
            } 
        });

        if (!user) {
            user = await User.create({
                name: name || 'Google User',
                email,
                firebaseUid: uid
            });
        } else if (!user.firebaseUid) {
            user.firebaseUid = uid;
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
