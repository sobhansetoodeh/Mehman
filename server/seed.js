const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcrypt');

mongoose.connect('mongodb://localhost:27017/guesthouse');

async function seed() {
  const passwordHash1 = await bcrypt.hash('123456', 10);
  const passwordHash2 = await bcrypt.hash('654321', 10);
  const passwordHash3 = await bcrypt.hash('36353236', 10);

  await User.create([
    {
      username: 'herasat1',
      passwordHash: passwordHash1,
      role: 'herasat',
      fullName: 'سبحان ستوده',
      nationalId: '3580890867',
      position: 'کارشناس حراست',
      personnelCode: '123009',
      phone: '09337994865'
    },
    {
      username: 'tashrifat1',
      passwordHash: passwordHash2,
      role: 'tashrifat',
      fullName: 'علی کیخا',
      nationalId: '0987654321',
      position: 'رئیس اداره تشریفات',
      personnelCode: '2002',
      phone: '09120000002'
    },
    {
    username: 'admin',
    passwordHash: passwordHash3,
    role: 'admin',
    fullName: 'مدیر سامانه',
    nationalId: '1111111111',
    position: 'مدیر سیستم',
    personnelCode: '0001',
    phone: '0915000000'
  }
  ]);
  console.log('New users created!');
  process.exit();
}

seed();