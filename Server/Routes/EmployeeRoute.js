import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Employee from "../models/Employee.js";
import ClockRecord from "../models/ClockRecord.js";

const router = express.Router();

// Employee login
router.post("/employeelogin", async (req, res) => {
  const { email, password } = req.body;

  try {
    console.log("Received login request with email:", email);

    // Find user by email
    const user = await Employee.findOne({ email });
    console.log("User found in database:", user);

    if (user) {
      // Compare the entered password with the plain text password stored in the database
      if (password === user.password) {
        // Generate JWT token if the passwords match
        const token = jwt.sign(
          { role: "employee", email: user.email, id: user._id },
          process.env.JWT_SECRET || '1234567uytrewq',  // Default secret if JWT_SECRET is undefined
          { expiresIn: "1d" }
        );
        // console.log("JWT Token generated:", token);

        // Set the JWT token as an HTTP-only cookie
        res.cookie("jwt", token, {
          httpOnly: true,
          maxAge: 3600000, // 1 hour
          secure: process.env.NODE_ENV === "production", // Use secure flag in production
        });

        return res.status(200).json({ loginStatus: true, message: "You are logged in", id: user._id });
      } else {
        return res.status(401).json({ loginStatus: false, error: "Incorrect Email or Password" });
      }
    } else {
      return res.status(404).json({ error: "User not found" });
    }
  } catch (err) {
    console.error("Error during login:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
});


// Fetch employee details by ID
router.get("/detail/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const employee = await Employee.findById(id);
    if (employee) {
      res.json({ success: true, result: employee });
    } else {
      res.status(404).json({ success: false, message: "Employee not found" });
    }
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ success: false, message: "Failed to fetch employee" });
  }
});

// Employee logout
router.get("/logout", (req, res) => {
  res.clearCookie("jwt");
  return res.json({ Status: true });
});

// Check if employee is currently clocked in
router.get("/employee_is_clocked_in/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const result = await ClockRecord.find({ employeeId: id, clockOut: null });

    return res.status(200).json({ clockedIn: result.length > 0 });
  } catch (error) {
    console.error("Error while checking clock-in status:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

// Employee clock-in
router.post("/employee_clockin/:id", async (req, res) => {
  const { id } = req.params;
  const { location, workFromType } = req.body;

  try {
    // Create a new clock record
    const clockRecord = new ClockRecord({
      employee: id,
      clockIn: new Date(),
      location,
      workFromType,
    });

    await clockRecord.save();

    // Update the Employee's clockRecords array
    await Employee.findByIdAndUpdate(
      id,
      { $push: { clockRecords: clockRecord._id } },
      { new: true }
    );

    return res.status(200).json({ status: "success" });
  } catch (error) {
    console.error("Error while clocking in:", error);
    return res.status(500).json({ status: "error", message: "Internal Server Error" });
  }
});

// Employee clock-out
router.post("/employee_clockout/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Find the active clock-in record
    const clockRecord = await ClockRecord.findOne({ employee: id, clockOut: null });
    if (clockRecord) {
      clockRecord.clockOut = new Date();
      await clockRecord.save();

      return res.status(200).json({ success: true });
    } else {
      return res.status(404).json({ success: false, message: "Clock-in record not found" });
    }
  } catch (error) {
    console.error("Error while clocking out:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});


// Fetch employee's calendar (clock-in/out data)
router.get("/calendar/:employeeId", async (req, res) => {
  const { employeeId} = req.params;

  try {
    const clockRecords = await ClockRecord.find({employee: employeeId }).sort({ clockIn: -1 });

    const calendarData = clockRecords.map((record) => {
      const date = record.clockIn.toISOString().slice(0, 10);
      const dayName = new Date(record.clockIn).toLocaleDateString("en-US", { weekday: "long" });

      return {
        date,
        dayName,
        clockIn: record.clockIn,
        clockOut: record.clockOut,
        location: record.location,
        workFromType: record.workFromType,
      };
    });

    res.status(200).json({ success: true, calendarData });
  } catch (error) {
    console.error("Error fetching calendar data:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
});

export { router as employeeRouter };
