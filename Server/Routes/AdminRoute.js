import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import Admin from "../models/Admin.js";
import Employee from "../models/Employee.js";
import Category from "../models/Category.js";

dotenv.config();

const router = express.Router();

// Admin Registration
router.post("/register_admin", async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if the admin already exists
    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res
        .status(409)
        .json({ success: false, message: "Admin with this email already exists" });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new admin
    const newAdmin = new Admin({
      email,
      password: hashedPassword,
    });

    // Save the admin to the database
    await newAdmin.save();

    res
      .status(201)
      .json({ success: true, message: "Admin registered successfully" });
  } catch (error) {
    console.error("Error registering admin:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to register admin" });
  }
});


// Admin login
router.post("/adminlogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Admin.findOne({ email });

    if (user) {
      const passwordsMatch = await bcrypt.compare(password, user.password);
      if (passwordsMatch) {
        const token = jwt.sign(
          { role: "admin", email: user.email, id: user._id },
          process.env.JWT_SECRET,
          { expiresIn: "1d" }
        );

        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 3600000,
          secure: true,
        });

        return res
          .status(200)
          .json({ loginStatus: true, message: "You are logged in" });
      } else {
        return res
          .status(401)
          .json({ loginStatus: false, error: "Incorrect Email or Password" });
      }
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});

// Add Category
router.post("/add_category", async (req, res) => {
  const { name } = req.body;

  try {
    const category = new Category({ name });
    await category.save();
    res.status(200).json({ success: true, message: "Category added successfully" });
  } catch (error) {
    console.error("Error adding category:", error);
    res.status(500).json({ success: false, message: "Failed to add category" });
  }
});

// Get Categories
router.get("/category", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json({ success: true, categories });
  } catch (error) {
    console.error("Error displaying categories:", error);
    res.json({ success: false, message: "Failed to load categories" });
  }
});

// Add Employee
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/images");
  },
  filename: (req, file, cb) => {
    cb(
      null,
      file.fieldname + "_" + Date.now() + path.extname(file.originalname)
    );
  },
});
const upload = multer({ storage: storage });


// add emplyee
router.post("/add_employee", upload.single("image"), async (req, res) => {
  try {
    // Directly store the password as entered (no hashing)
    const employee = new Employee({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,  // Storing the password directly (no hash)
      address: req.body.address,
      salary: req.body.salary,
      image: req.file.filename,
      category:req.body.category_id,
    });

    await employee.save();
    res.status(200).json({ success: true, message: "Employee added successfully" });
  } catch (error) {
    console.error("Error adding employee:", error);
    res.status(500).json({ success: false, message: "Failed to add employee" });
  }
});


// Get Employees
router.get("/employee", async (req, res) => {
  try {
    const employees = await Employee.find().populate('category');
    res.json({ success: true, employees });
  } catch (error) {
    console.error("Error fetching employees:", error);
    res.json({ success: false, message: "Failed to fetch employees" });
  }
});

// Edit Employee
router.get("/employee/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const employee = await Employee.findById(id).populate('category');
    res.json({ success: true, employee });
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.json({ success: false, message: "Failed to fetch employee" });
  }
});

router.put("/edit_employee/:id", async (req, res) => {
  const id = req.params.id;
  const { name, email, salary, address, category_id } = req.body;

  try {
    const updatedEmployee = await Employee.findByIdAndUpdate(id, {
      name,
      email,
      salary,
      address,
      category: category_id,
    });
    res.json({ success: true, message: "Employee updated successfully" });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ success: false, message: "Failed to update employee" });
  }
});

// Delete Employee
router.delete("/delete_employee/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const employee = await Employee.findByIdAndDelete(id);
    if (employee && employee.image) {
      fs.unlinkSync(`public/images/${employee.image}`);
    }
    res.status(200).json({ success: true, message: "Employee deleted" });
  } catch (error) {
    console.error("Error deleting employee:", error);
    res.status(500).json({ success: false, message: "Failed to delete employee" });
  }
});

// Admin count
router.get('/admin_count', async (req, res) => {
  try {
    const adminCount = await Admin.countDocuments();
    res.json({ Status: true, Result: adminCount });
  } catch (error) {
    console.error("Error fetching admin count:", error);
    res.json({ Status: false, Error: "Failed to fetch admin count" });
  }
});

// Employee count
router.get('/employee_count', async (req, res) => {
  try {
    const employeeCount = await Employee.countDocuments();
    res.json({ Status: true, Result: employeeCount });
  } catch (error) {
    console.error("Error fetching employee count:", error);
    res.json({ Status: false, Error: "Failed to fetch employee count" });
  }
});

// Salary count
router.get('/salary_count', async (req, res) => {
  try {
    const salaryCount = await Employee.aggregate([{ $group: { _id: null, totalSalary: { $sum: "$salary" }}}]);
    res.json({ Status: true, Result: salaryCount });
  } catch (error) {
    console.error("Error fetching salary count:", error);
    res.json({ Status: false, Error: "Failed to fetch salary count" });
  }
});

// Admin records
router.get('/admin_records', async (req, res) => {
  try {
    const admins = await Admin.find();
    res.json({ Status: true, Result: admins });
  } catch (error) {
    console.error("Error fetching admin records:", error);
    res.json({ Status: false, Error: "Failed to fetch admin records" });
  }
});

// Logout
router.get('/logout', (req, res) => {
  res.clearCookie('jwt');
  return res.json({ Status: true });
});

// Edit Admin
router.put("/edit_admin/:id", async (req, res) => {
  const id = req.params.id;
  const { email } = req.body;

  try {
    const updatedAdmin = await Admin.findByIdAndUpdate(id, { email });
    res.json({ success: true, message: "Admin updated successfully" });
  } catch (error) {
    console.error("Error updating admin:", error);
    res.status(500).json({ success: false, message: "Failed to update admin" });
  }
});

export {router as adminRoutes};
