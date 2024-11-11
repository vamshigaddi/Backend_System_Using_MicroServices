const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt'); // bcrypt for password hashing
const jwt = require('jsonwebtoken');
const User = require('../models/Users'); // Assuming this is the correct path
const { emitEvent,isRabbitMQConnected } = require('../rabbitmq'); // Import emitEvent here


// Login Route
router.post("/login", async (req, res, next) => {
    const { email, password } = req.body;

    // Check if user exists
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
        if (!existingUser) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed! User not found.",
            });
        }
    } catch (err) {
        console.error('Error finding user:', err);
        const error = new Error("Error! Something went wrong while finding user.");
        return next(error);
    }

    // Compare password
    let isPasswordCorrect;
    try {
        isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        if (!isPasswordCorrect) {
            return res.status(401).json({
                success: false,
                message: "Authentication failed! Incorrect password.",
            });
        }
    } catch (err) {
        console.error('Error comparing passwords:', err);
        return next(new Error("Error! Something went wrong while comparing passwords."));
    }

    // Create JWT token
    let token;
    try {
        token = jwt.sign(
            { userId: existingUser.id, email: existingUser.email },
            process.env.JWT_SECRET || "secretkeyappearshere", // Use environment variable for secret
            { expiresIn: "1h" }
        );
    } catch (err) {
        console.error('Error creating JWT token:', err);
        return next(new Error("Error! Something went wrong while creating token."));
    }

    res.status(200).json({
        success: true,
        message: 'Successfully logged in',
        data: { userId: existingUser.id, email: existingUser.email, token: token },
    });
});

router.post("/register", async (req, res, next) => {
    const { username, email, password } = req.body;

    // Check if the email already exists
    let existingUser;
    try {
        existingUser = await User.findOne({ email: email });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'Email already exists, please use a different email',
            });
        }
    } catch (err) {
        console.error('Error finding user:', err);  // Log the actual error
        return next(new Error("Error! Something went wrong."));
    }

    // Hash the password before saving
    let hashedPassword;
    try {
        hashedPassword = await bcrypt.hash(password, 12); // Hash with salt rounds (12)
    } catch (err) {
        console.error('Error hashing password:', err);
        return next(new Error("Error! Something went wrong while hashing password."));
    }

    // Create new user with hashed password
    const newUser = new User({ username, email, password: hashedPassword });

    try {
        await newUser.save();
        console.log('User successfully saved');

        // Emit "User Registered" event to RabbitMQ
        const userRegisteredEvent = { event: "User Registered", data: { userId: newUser._id, email: newUser.email,username:newUser.username } };
        await emitEvent('user-registered', userRegisteredEvent); // Emit to 'user-registered' queue


    } catch (err) {
        console.error('Error saving user:', err);  // Log the actual error
        return next(new Error("Error! Something went wrong while saving user."));
    }

    // Create JWT token
    let token;
    const secretKey = process.env.JWT_SECRET || "yourhardcodedsecret";
    try {
        token = jwt.sign(
            { userId: newUser.id, email: newUser.email },
            secretKey,
            { expiresIn: "1h" }
        );
    } catch (err) {
        console.error('Error creating JWT token:', err);  // Log the actual error
        return next(new Error("Error! Something went wrong while creating token."));
    }

    res.status(201).json({
        success: true,
        message: 'Successfully registered',
        data: { userId: newUser.id, email: newUser.email,username:newUser.username, token: token },
    });
});

router.put('/update-profile', async (req, res, next) => {
    const { userId, username, email, password } = req.body;
    
    try {
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        // Update user fields
        if (username) user.username = username;
        if (email) user.email = email;
        //if (password) user.password = password;
        if (password) {
            // Hash new password before saving
            user.password = await bcrypt.hash(password, 12);
        }

        await user.save();

        // Emit "User Profile Updated" event
        // Emit to your message broker (RabbitMQ, Kafka, etc.)
        //console.log('User Profile Updated:', user);

        // Emit "User Profile Updated" event
        const userProfileUpdatedEvent = { event: "User Profile Updated", data: { userId: user.id, email: user.email } };
        await emitEvent('User-Profile-Updated', userProfileUpdatedEvent); // Emit to 'user-registered' queue

        res.status(200).json({
            success: true,
            message: 'Profile updated successfully',
        });
    } catch (err) {
        console.error('Error updating profile:', err);
        res.status(500).json({
            success: false,
            message: 'Error updating profile',
        });
    }
});

// Get all users
router.get('/', async (req, res) => {
    try {
        const users = await User.find(); // Fetch all users
        res.status(200).json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({
            success: false,
            message: 'Error fetching users',
        });
    }
});


// Get user by ID
router.get('/:id', async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      res.json(user);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });



// User Data Route (to check the JWT token)
router.get('/users-data',
    (req, res) => {
        const token =
            req.headers
                .authorization.split(' ')[1];
        //Authorization: 'Bearer TOKEN'
        if (!token) {
            res.status(200)
                .json(
                    {
                        success: false,
                        message: "Error!Token was not provided."
                    }
                );
        }
        //Decoding the token
        const decodedToken =
            jwt.verify(token, "secretkeyappearshere");
        res.status(200).json(
            {
                success: true,
                data: {
                    userId: decodedToken.userId,
                    email: decodedToken.email
                }
            }
        );
    })


module.exports = router;
