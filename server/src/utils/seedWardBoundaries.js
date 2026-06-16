require('dotenv').config();
const mongoose = require('mongoose');
const Ward = require('../models/Ward');

// Approximate boundaries for all 32 Kathmandu Metropolitan City wards
// These are DEMO boundaries for development/presentation purposes
// For production, get official boundaries from KMC GIS department
// Coordinates format: [longitude, latitude] — GeoJSON standard

const KATHMANDU_WARDS = [
  {
    wardNumber: 1,
    name: 'Bouddha',
    center: [85.3625, 27.7215],
    boundary: [[
      [85.3550, 27.7270], [85.3700, 27.7270],
      [85.3700, 27.7160], [85.3550, 27.7160],
      [85.3550, 27.7270],
    ]],
  },
  {
    wardNumber: 2,
    name: 'Chabahil',
    center: [85.3530, 27.7150],
    boundary: [[
      [85.3450, 27.7200], [85.3600, 27.7200],
      [85.3600, 27.7100], [85.3450, 27.7100],
      [85.3450, 27.7200],
    ]],
  },
  {
    wardNumber: 3,
    name: 'Goshala',
    center: [85.3480, 27.7080],
    boundary: [[
      [85.3400, 27.7130], [85.3560, 27.7130],
      [85.3560, 27.7030], [85.3400, 27.7030],
      [85.3400, 27.7130],
    ]],
  },
  {
    wardNumber: 4,
    name: 'Baneshwor',
    center: [85.3278, 27.7095],
    boundary: [[
      [85.3200, 27.7150], [85.3370, 27.7150],
      [85.3370, 27.7040], [85.3200, 27.7040],
      [85.3200, 27.7150],
    ]],
  },
  {
    wardNumber: 5,
    name: 'Tinkune',
    center: [85.3420, 27.6950],
    boundary: [[
      [85.3340, 27.7000], [85.3500, 27.7000],
      [85.3500, 27.6900], [85.3340, 27.6900],
      [85.3340, 27.7000],
    ]],
  },
  {
    wardNumber: 6,
    name: 'Koteshwor',
    center: [85.3456, 27.6867],
    boundary: [[
      [85.3370, 27.6920], [85.3540, 27.6920],
      [85.3540, 27.6810], [85.3370, 27.6810],
      [85.3370, 27.6920],
    ]],
  },
  {
    wardNumber: 7,
    name: 'Sinamangal',
    center: [85.3510, 27.7020],
    boundary: [[
      [85.3440, 27.7070], [85.3600, 27.7070],
      [85.3600, 27.6970], [85.3440, 27.6970],
      [85.3440, 27.7070],
    ]],
  },
  {
    wardNumber: 8,
    name: 'Gaushala',
    center: [85.3390, 27.7170],
    boundary: [[
      [85.3310, 27.7220], [85.3470, 27.7220],
      [85.3470, 27.7120], [85.3310, 27.7120],
      [85.3310, 27.7220],
    ]],
  },
  {
    wardNumber: 9,
    name: 'Baluwatar',
    center: [85.3210, 27.7250],
    boundary: [[
      [85.3130, 27.7300], [85.3290, 27.7300],
      [85.3290, 27.7200], [85.3130, 27.7200],
      [85.3130, 27.7300],
    ]],
  },
  {
    wardNumber: 10,
    name: 'Maharajgunj',
    center: [85.3260, 27.7350],
    boundary: [[
      [85.3180, 27.7410], [85.3350, 27.7410],
      [85.3350, 27.7290], [85.3180, 27.7290],
      [85.3180, 27.7410],
    ]],
  },
  {
    wardNumber: 11,
    name: 'Lazimpat',
    center: [85.3185, 27.7200],
    boundary: [[
      [85.3100, 27.7260], [85.3270, 27.7260],
      [85.3270, 27.7140], [85.3100, 27.7140],
      [85.3100, 27.7260],
    ]],
  },
  {
    wardNumber: 12,
    name: 'Thamel',
    center: [85.3123, 27.7154],
    boundary: [[
      [85.3040, 27.7210], [85.3210, 27.7210],
      [85.3210, 27.7100], [85.3040, 27.7100],
      [85.3040, 27.7210],
    ]],
  },
  {
    wardNumber: 13,
    name: 'Kalimati',
    center: [85.2985, 27.7005],
    boundary: [[
      [85.2900, 27.7060], [85.3070, 27.7060],
      [85.3070, 27.6950], [85.2900, 27.6950],
      [85.2900, 27.7060],
    ]],
  },
  {
    wardNumber: 14,
    name: 'Swayambhu',
    center: [85.2905, 27.7147],
    boundary: [[
      [85.2820, 27.7200], [85.2990, 27.7200],
      [85.2990, 27.7090], [85.2820, 27.7090],
      [85.2820, 27.7200],
    ]],
  },
  {
    wardNumber: 15,
    name: 'Dallu',
    center: [85.2960, 27.7230],
    boundary: [[
      [85.2870, 27.7290], [85.3050, 27.7290],
      [85.3050, 27.7170], [85.2870, 27.7170],
      [85.2870, 27.7290],
    ]],
  },
  {
    wardNumber: 16,
    name: 'Balaju',
    center: [85.2989, 27.7367],
    boundary: [[
      [85.2900, 27.7430], [85.3080, 27.7430],
      [85.3080, 27.7300], [85.2900, 27.7300],
      [85.2900, 27.7430],
    ]],
  },
  {
    wardNumber: 17,
    name: 'Nagarjun',
    center: [85.2750, 27.7420],
    boundary: [[
      [85.2650, 27.7500], [85.2860, 27.7500],
      [85.2860, 27.7340], [85.2650, 27.7340],
      [85.2650, 27.7500],
    ]],
  },
  {
    wardNumber: 18,
    name: 'Ichangu Narayan',
    center: [85.2620, 27.7310],
    boundary: [[
      [85.2520, 27.7380], [85.2730, 27.7380],
      [85.2730, 27.7240], [85.2520, 27.7240],
      [85.2520, 27.7380],
    ]],
  },
  {
    wardNumber: 19,
    name: 'Kirtipur',
    center: [85.2790, 27.6785],
    boundary: [[
      [85.2690, 27.6850], [85.2900, 27.6850],
      [85.2900, 27.6720], [85.2690, 27.6720],
      [85.2690, 27.6850],
    ]],
  },
  {
    wardNumber: 20,
    name: 'Kalanki',
    center: [85.2875, 27.6945],
    boundary: [[
      [85.2790, 27.7000], [85.2970, 27.7000],
      [85.2970, 27.6890], [85.2790, 27.6890],
      [85.2790, 27.7000],
    ]],
  },
  {
    wardNumber: 21,
    name: 'Thankot',
    center: [85.2580, 27.6920],
    boundary: [[
      [85.2470, 27.7000], [85.2700, 27.7000],
      [85.2700, 27.6840], [85.2470, 27.6840],
      [85.2470, 27.7000],
    ]],
  },
  {
    wardNumber: 22,
    name: 'Naikap',
    center: [85.2730, 27.7100],
    boundary: [[
      [85.2640, 27.7160], [85.2830, 27.7160],
      [85.2830, 27.7040], [85.2640, 27.7040],
      [85.2640, 27.7160],
    ]],
  },
  {
    wardNumber: 23,
    name: 'Sitapaila',
    center: [85.2870, 27.7190],
    boundary: [[
      [85.2780, 27.7250], [85.2970, 27.7250],
      [85.2970, 27.7130], [85.2780, 27.7130],
      [85.2780, 27.7250],
    ]],
  },
  {
    wardNumber: 24,
    name: 'Shankhamul',
    center: [85.3340, 27.6880],
    boundary: [[
      [85.3250, 27.6940], [85.3440, 27.6940],
      [85.3440, 27.6820], [85.3250, 27.6820],
      [85.3250, 27.6940],
    ]],
  },
  {
    wardNumber: 25,
    name: 'Minbhawan',
    center: [85.3375, 27.6980],
    boundary: [[
      [85.3290, 27.7040], [85.3470, 27.7040],
      [85.3470, 27.6920], [85.3290, 27.6920],
      [85.3290, 27.7040],
    ]],
  },
  {
    wardNumber: 26,
    name: 'Thapagaun',
    center: [85.3440, 27.6800],
    boundary: [[
      [85.3350, 27.6860], [85.3540, 27.6860],
      [85.3540, 27.6740], [85.3350, 27.6740],
      [85.3350, 27.6860],
    ]],
  },
  {
    wardNumber: 27,
    name: 'Pashupati',
    center: [85.3480, 27.7100],
    boundary: [[
      [85.3390, 27.7160], [85.3580, 27.7160],
      [85.3580, 27.7040], [85.3390, 27.7040],
      [85.3390, 27.7160],
    ]],
  },
  {
    wardNumber: 28,
    name: 'Jorpati',
    center: [85.3730, 27.7300],
    boundary: [[
      [85.3640, 27.7370], [85.3830, 27.7370],
      [85.3830, 27.7230], [85.3640, 27.7230],
      [85.3640, 27.7370],
    ]],
  },
  {
    wardNumber: 29,
    name: 'Kageshwori',
    center: [85.3810, 27.7450],
    boundary: [[
      [85.3710, 27.7530], [85.3920, 27.7530],
      [85.3920, 27.7370], [85.3710, 27.7370],
      [85.3710, 27.7530],
    ]],
  },
  {
    wardNumber: 30,
    name: 'Tokha',
    center: [85.3350, 27.7530],
    boundary: [[
      [85.3240, 27.7620], [85.3470, 27.7620],
      [85.3470, 27.7440], [85.3240, 27.7440],
      [85.3240, 27.7620],
    ]],
  },
  {
    wardNumber: 31,
    name: 'Budhanilkantha',
    center: [85.3610, 27.7620],
    boundary: [[
      [85.3490, 27.7720], [85.3740, 27.7720],
      [85.3740, 27.7520], [85.3490, 27.7520],
      [85.3490, 27.7720],
    ]],
  },
  {
    wardNumber: 32,
    name: 'Gokarneshwor',
    center: [85.3900, 27.7580],
    boundary: [[
      [85.3780, 27.7680], [85.4030, 27.7680],
      [85.4030, 27.7480], [85.3780, 27.7480],
      [85.3780, 27.7680],
    ]],
  },
];

const seedWards = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    let created = 0;
    let updated = 0;

    for (const wardData of KATHMANDU_WARDS) {
      const existing = await Ward.findOne({ wardNumber: wardData.wardNumber });

      if (existing) {
        // Update existing ward with boundary
        existing.name = wardData.name;
        existing.centerCoordinates = {
          type: 'Point',
          coordinates: wardData.center,
        };
        existing.boundary = {
          type: 'Polygon',
          coordinates: wardData.boundary,
        };
        existing.isActive = true;
        await existing.save();
        console.log(`🔄 Updated: Ward ${wardData.wardNumber} — ${wardData.name}`);
        updated++;
      } else {
        // Create new ward
        await Ward.create({
          wardNumber: wardData.wardNumber,
          name:       wardData.name,
          city:       'Kathmandu',
          isActive:   true,
          centerCoordinates: {
            type:        'Point',
            coordinates: wardData.center,
          },
          boundary: {
            type:        'Polygon',
            coordinates: wardData.boundary,
          },
        });
        console.log(`✨ Created: Ward ${wardData.wardNumber} — ${wardData.name}`);
        created++;
      }
    }

    console.log('\n========================================');
    console.log(`✅ Done! Created: ${created} | Updated: ${updated}`);
    console.log('⚠️  Note: These are APPROXIMATE boundaries');
    console.log('   for demo/development purposes only.');
    console.log('   Get official boundaries from KMC GIS');
    console.log('   department for production use.');
    console.log('========================================\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

seedWards();
