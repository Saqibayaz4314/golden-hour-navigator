const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const Hospital = require('./models/Hospital');
const Doctor   = require('./models/Doctor');
const User     = require('./models/User');

const HOSPITALS = [
  // --- Sukkur Hospitals ---
  {
    name: 'Civil Hospital Sukkur',
    type: 'Public',
    address: 'Minara Road, Sukkur',
    phone: '071-9310111',
    location: { type: 'Point', coordinates: [68.8574, 27.7052] },
    specialties: ['General', 'Trauma', 'Maternity', 'Cardiac'],
    resources: {
      beds_total: 400, beds_available: 50,
      beds_status: 'green', oxygen_status: 'yellow',
      icu_available: true,
      critical_medicines: ['Morphine', 'Adrenaline', 'Atropine'],
    },
    reliability_score: 85,
  },
  {
    name: 'Hira Medical Center',
    type: 'Private',
    address: 'Military Road, Sukkur',
    phone: '071-5632123',
    location: { type: 'Point', coordinates: [68.8650, 27.7150] },
    specialties: ['Maternity', 'General', 'Neurology'],
    resources: {
      beds_total: 100, beds_available: 25,
      beds_status: 'green', oxygen_status: 'green',
      icu_available: true,
      critical_medicines: ['Morphine', 'Saline'],
    },
    reliability_score: 95,
  },
  
  // --- Khairpur Hospitals ---
  {
    name: 'KMC (Khairpur Medical College Hospital)',
    type: 'Public',
    address: 'Khairpur Mirs',
    phone: '0243-9280145',
    location: { type: 'Point', coordinates: [68.7551, 27.5256] },
    specialties: ['General', 'Trauma', 'Cardiac', 'Burns'],
    resources: {
      beds_total: 350, beds_available: 12,
      beds_status: 'yellow', oxygen_status: 'green',
      icu_available: true,
      critical_medicines: ['TPA', 'Adrenaline'],
    },
    reliability_score: 79,
  },
  {
    name: 'GIMSS (Gambat Institute)',
    type: 'Public',
    address: 'Gambat, Khairpur District',
    phone: '0243-720101',
    location: { type: 'Point', coordinates: [68.5200, 27.3500] },
    specialties: ['Cardiac', 'Neurology', 'Trauma', 'General'],
    resources: {
      beds_total: 500, beds_available: 80,
      beds_status: 'green', oxygen_status: 'green',
      icu_available: true,
      critical_medicines: ['Heparin', 'Morphine', 'Norepinephrine'],
    },
    reliability_score: 98, // Very reputed
  },

  // --- Lahore Hospitals (Keeping a few for variety) ---
  {
    name: 'Jinnah Hospital',
    type: 'Public',
    address: 'Jail Road, Lahore',
    phone: '042-99203392',
    location: { type: 'Point', coordinates: [74.3188, 31.5204] },
    specialties: ['Cardiac', 'Trauma', 'General', 'Neurology'],
    resources: {
      beds_total: 200, beds_available: 0,
      beds_status: 'red', oxygen_status: 'green',
      icu_available: true,
      critical_medicines: ['Morphine', 'Atropine'],
    },
    reliability_score: 92,
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB Atlas');

    await Hospital.deleteMany();
    await Doctor.deleteMany();
    await User.deleteMany();

    const hospitals = await Hospital.insertMany(HOSPITALS);
    console.log(`✅ Inserted ${hospitals.length} hospitals (Sukkur, Khairpur, Lahore)`);

    const [civil, hira, kmc, gimss, jinnah] = hospitals;

    const DOCTORS = [
      {
        name: 'Dr. Ali Raza',
        specialty: 'Trauma',
        qualifications: ['MBBS', 'FCPS (Surgery)'],
        experience_years: 15,
        phone: '0300-1112223',
        rating: 4.8,
        bio: 'Senior Trauma Surgeon at Civil Hospital Sukkur.',
        is_available: true,
        current_hospital: civil._id,
        hospital_affiliations: [
          {
            hospital_id: civil._id,
            hospital_name: civil.name,
            hospital_address: civil.address,
            is_on_duty: true,
            schedule: [{ days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'], time_from: '08:00', time_to: '14:00' }],
          },
          {
            hospital_id: hira._id,
            hospital_name: hira.name,
            hospital_address: hira.address,
            is_on_duty: false,
            schedule: [{ days: ['Mon', 'Wed', 'Fri'], time_from: '17:00', time_to: '20:00' }],
          },
        ],
      },
      {
        name: 'Dr. Sana Baloch',
        specialty: 'Maternity',
        qualifications: ['MBBS', 'MCPS', 'FCPS (Obs & Gynae)'],
        experience_years: 12,
        phone: '0333-4445556',
        rating: 4.9,
        bio: 'Gynaecologist specializing in high-risk pregnancies.',
        is_available: true,
        current_hospital: hira._id,
        hospital_affiliations: [
          {
            hospital_id: hira._id,
            hospital_name: hira.name,
            hospital_address: hira.address,
            is_on_duty: true,
            schedule: [{ days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], time_from: '10:00', time_to: '16:00' }],
          },
          {
            hospital_id: civil._id,
            hospital_name: civil.name,
            hospital_address: civil.address,
            is_on_duty: false,
            schedule: [{ days: ['Thu', 'Sat'], time_from: '08:00', time_to: '12:00' }],
          }
        ],
      },
      {
        name: 'Dr. Zulfiqar Ali',
        specialty: 'Cardiac',
        qualifications: ['MBBS', 'FCPS (Cardiology)', 'Fellowship Interventional Cardiology'],
        experience_years: 20,
        phone: '0311-9998887',
        rating: 5.0,
        bio: 'Renowned Cardiologist at GIMSS Gambat.',
        is_available: true,
        current_hospital: gimss._id,
        hospital_affiliations: [
          {
            hospital_id: gimss._id,
            hospital_name: gimss.name,
            hospital_address: gimss.address,
            is_on_duty: true,
            schedule: [{ days: ['Mon', 'Tue', 'Wed', 'Thu'], time_from: '09:00', time_to: '15:00' }],
          },
          {
            hospital_id: kmc._id,
            hospital_name: kmc.name,
            hospital_address: kmc.address,
            is_on_duty: false,
            schedule: [{ days: ['Fri', 'Sat'], time_from: '09:00', time_to: '13:00' }],
          }
        ],
      },
      {
        name: 'Dr. Muneeb',
        specialty: 'Neurology',
        qualifications: ['MBBS', 'FCPS'],
        experience_years: 8,
        phone: '0345-1239876',
        rating: 4.5,
        bio: 'Neurologist handling stroke and emergency neurology.',
        is_available: false,
        current_hospital: null,
        hospital_affiliations: [
          {
            hospital_id: kmc._id,
            hospital_name: kmc.name,
            hospital_address: kmc.address,
            is_on_duty: false,
            schedule: [{ days: ['Mon', 'Wed'], time_from: '08:00', time_to: '14:00' }],
          }
        ],
      }
    ];

    const docs = await Doctor.insertMany(DOCTORS);
    console.log(`✅ Inserted ${docs.length} doctors with rich schedules`);

    // Demo users
    await User.create({ name: 'Admin',        email: 'admin@ghn.com',     password: 'admin123', role: 'admin',          hospital: gimss._id });
    await User.create({ name: 'Civil Staff',  email: 'staff@civil.com',   password: 'staff123', role: 'hospital_staff', hospital: civil._id });
    await User.create({ name: 'KMC Staff',    email: 'staff@kmc.com',     password: 'staff123', role: 'hospital_staff', hospital: kmc._id   });
    console.log('✅ Created demo users');
    console.log('\n Credentials:');
    console.log('  admin@ghn.com    / admin123');
    console.log('  staff@civil.com  / staff123');
    console.log('  staff@kmc.com    / staff123');

    console.log('\n🚑 Seed complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  }
}

seed();
