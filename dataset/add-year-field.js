// add-year-field.js
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/safetywatch');

const Crime = mongoose.model('Crime', new mongoose.Schema({
  occurred: String, date: String, year: Number
}));

async function addYears() {
  const crimes = await Crime.find();
  let fixed = 0;

  for (const crime of crimes) {
    // Try occurred field first (03/02/2020), then date field (2019-05-03)
    let year = null;

    if (crime.occurred) {
      const match = crime.occurred.match(/(\d{4})/);
      if (match) year = parseInt(match[1]);
    }

    if (!year && crime.date) {
      const match = crime.date.match(/(\d{4})/);
      if (match) year = parseInt(match[1]);
    }

    if (year && year > 2000 && year < 2030) {
      await Crime.findByIdAndUpdate(crime._id, { year });
      fixed++;
    }
  }

  // Verify
  const sample = await Crime.aggregate([
    { $group: { _id: '$year', count: { $sum: 1 } } },
    { $sort: { _id: 1 } }
  ]);
  console.log(`✅ Fixed ${fixed} crimes with year`);
  console.log('📅 Yearly breakdown:', JSON.stringify(sample));
  mongoose.connection.close();
}

addYears().catch(console.error);
