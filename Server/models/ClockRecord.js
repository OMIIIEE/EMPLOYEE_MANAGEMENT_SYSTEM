import mongoose from 'mongoose';

const clockRecordSchema = new mongoose.Schema(
  {
    clockIn: { type: Date, required: true },
    clockOut: { type: Date },
    location: { type: String },
    workFromType: { type: String, enum: ['office', 'remote', 'hybrid'], default: 'office' },
    employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },  // Associate with Employee
  },
  { timestamps: true }
);

const ClockRecord = mongoose.model('ClockRecord', clockRecordSchema);

export default ClockRecord;
