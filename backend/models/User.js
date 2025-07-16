const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

// Define User Schema
const userSchema = new mongoose.Schema(
    {
        username: { 
            type: String, 
            unique: true, 
            required: true, 
            trim: true 
        },
        firstName: { 
            type: String, 
            required: true 
        },
        lastName: { 
            type: String, 
            required: true 
        },
        email: { 
            type: String, 
            unique: true, 
            required: true 
        },
        password: { 
            type: String, 
            required: true 
        },
        course: { 
            type: String 
        },
        rollNo: { 
            type: String 
        },
        role: { 
            type: String, 
            enum: ["user", "admin"], 
            default: "user" 
        },
        lastLogin: { 
            type: Date 
        },
    },
    { 
        timestamps: true, 
        toJSON: { virtuals: true }, 
        toObject: { virtuals: true } 
    }
);

// Virtual field for full name
userSchema.virtual("fullName").get(function () {
    return `${this.firstName} ${this.lastName}`;
});

// Password hashing middleware
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next();
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

// Password comparison method
userSchema.methods.comparePassword = async function (enteredPassword) {
    return bcrypt.compare(enteredPassword, this.password);
};

// Create User Model
const User = mongoose.model("User", userSchema);

module.exports = User;
