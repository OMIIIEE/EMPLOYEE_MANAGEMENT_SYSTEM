import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const employeeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    address: { type: String },
    salary: { type: Number },
    image: { type: String },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category',required:true },
    clockRecords: [
      {
        type: mongoose.Schema.Types.ObjectId, // Reference to the ClockRecord model
        ref: 'ClockRecord'
      }
    ],
    role: { type: String, enum: ['employee', 'admin'], default: 'employee' }, // Role field
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Method to generate a JWT token for authentication
employeeSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    { id: this._id, email: this.email, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );
  return token;
};

const Employee = mongoose.model('Employee', employeeSchema);

export default Employee;



// import mongoose from 'mongoose';

// import jwt from 'jsonwebtoken';
// import bcrypt from "bcrypt"

// const employeeSchema = new mongoose.Schema(
//   {
//     name: { type: String, required: true },
//     email: { type: String, required: true, unique: true },
//     password: { type: String, required: true },
//     address: { type: String },
//     salary: { type: Number },
//     image: { type: String },
//     category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
//     clockRecords: [
//       {
//         type: mongoose.Schema.Types.ObjectId, // Reference to the ClockRecord model
//         ref: 'ClockRecord'
//       }
//     ],
//     role: { type: String, enum: ['employee', 'admin'], default: 'employee' }, // Role field
//   },
//   { timestamps: true } // Automatically adds createdAt and updatedAt fields
// );

// // Pre-save hook to hash the password before saving the employee
// employeeSchema.pre('save', async function (next) {
//   if (this.isModified('password')) {
//     this.password = await bcrypt.hash(this.password, 10);
//   }
//   next();
// });

// // Method to check if the entered password matches the hashed password
// employeeSchema.methods.matchPassword = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// // Method to generate a JWT token for authentication
// employeeSchema.methods.generateAuthToken = function () {
//   const token = jwt.sign(
//     { id: this._id, email: this.email, role: this.role },
//     process.env.JWT_SECRET,
//     { expiresIn: '1d' }
//   );
//   return token;
// };

// const Employee = mongoose.model('Employee', employeeSchema);

// export default Employee;
