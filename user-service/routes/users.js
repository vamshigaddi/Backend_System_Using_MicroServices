// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/Users');  // Import the User model

// // User Registration Route
// router.post('/register', async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         // Check if user already exists
//         let user = await User.findOne({ email });
//         if (user) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create a new user
//         user = new User({
//             username,
//             email,
//             password: hashedPassword
//         });

//         // Save user to the database
//         await user.save();

//         res.status(201).json({ message: 'User registered successfully', user });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// // User Login Route
// router.post('/login', async (req, res) => {
//     console.log("Login request received:", req.body);  // Log the request body
//     const { email, password } = req.body;

//     try {
//         // Check if user exists
//         let user = await User.findOne({ email });
//         if (!user) {
//             console.log("User not found");  // Log if user is not found
//             return res.status(400).json({ message: 'Invalid email or password' });
//         }

//         // Compare password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             console.log("Password does not match");  // Log if password does not match
//             return res.status(400).json({ message: 'Invalid email or password' });
//         }

//         // Create JWT token
//         const token = jwt.sign({ id: user._id }, 'secret_key', { expiresIn: '1h' });
//         res.status(200).json({ message: 'Login successful', token });
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ message: 'Server error' });
//     }
// });

// module.exports = router;


// const express = require('express');
// const router = express.Router();
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const User = require('../models/Users'); // Import the User model

// // Middleware for JWT validation
// const verifyToken = (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (!token) {
//         return res.status(401).json({ error: 'Unauthorized' });
//     }

//     jwt.verify(token, 'secret_key', (err, decoded) => {
//         if (err) {
//             return res.status(401).json({ error: 'Unauthorized' });
//         }
//         req.user = decoded;
//         next();
//     });
// };

// // User Registration Route
// router.post('/register', async (req, res) => {
//     const { username, email, password } = req.body;

//     try {
//         // Check if user already exists
//         let existingUser = await User.findOne({ email });
//         if (existingUser) {
//             return res.status(400).json({ error: 'Email already exists' });
//         }

//         // Hash the password
//         const hashedPassword = await bcrypt.hash(password, 10);

//         // Create a new user
//         const newUser = new User({
//             username,
//             email,
//             password: hashedPassword
//         });

//         // Save user to the database
//         await newUser.save();

//         let token;
//         try {
//             token = jwt.sign(
//                 {
//                     userId: newUser.id,
//                     email: newUser.email
//                 },
//                 "secretkeyappearshere",
//                 { expiresIn: "1h" }
//             );
//         } catch (err) {
//             const error =
//                 new Error("Error! Something went wrong.");
//             return next(error);
//         }
//         // Save user to the database
//         // await newUser.save();

//         res.status(201).json({ message: 'User registered successfully',token: token});
//     } catch (err) {
//         console.error(err.message);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });





// // User Login Route
// router.post('/login', async (req, res) => {
//     console.log("Login request received:", req.body);  // Log the request body
//     const { email, password } = req.body;

//     try {
//         // Check if user exists
//         let user = await User.findOne({ email });
//         console.log("Found user:", user);  // Log found user details
//         if (!user) {
//             console.log("User not found");  // Log if user is not found
//             return res.status(401).json({ error: 'Invalid credentials' });
//         }

//         // Compare password
//         const isMatch = await bcrypt.compare(password, user.password);
//         if (!isMatch) {
//             console.log("Password does not match");  // Log if password does not match
//             return res.status(401).json({ error: 'Invalid credentials' });
//         }

//         // Create JWT token
//         const token = jwt.sign({userId: existingUser.id,email: existingUser.email}, 'secret_key',{ expiresIn: "1h" }); // Make sure to use the same secret
//         res.status(200).json({ userId:existingUser.id,message: 'Login successful', token });
//     } catch (err) {
//         console.error("Error during login:", err.message);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });


// // Protected Route to Get User Details
// router.get('/user', verifyToken, async (req, res) => {
//     try {
//         // Fetch user details using decoded token
//         //const user = await User.findById(req.user.id).select('-password'); // Exclude password
//         const user = await User.findOne({ email: req.user.email });
//         if (!user) {
//             return res.status(404).json({ error: 'User not found' });
//         }
//         res.status(200).json({ username: user.username, email: user.email });
//     } catch (error) {
//         console.error(error.message);
//         res.status(500).json({ error: 'Internal server error' });
//     }
// });

// module.exports = router;











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
