// fix-coordinates.js
const mongoose = require('mongoose');
mongoose.connect('mongodb://127.0.0.1:27017/safetywatch');

const Crime = mongoose.model('Crime', new mongoose.Schema({
  station: String, latitude: Number, longitude: Number
}));

// ACCURATE Delhi Police Station Coordinates
const STATION_COORDS = {
  // Already working
  "RANI BAGH":        [28.7041, 77.1025],
  "GULABIBAGH":       [28.6692, 77.2267],
  "MAYURVIHAR":       [28.6139, 77.2993],
  "GEETA COLONY":     [28.6513, 77.2720],
  "RANJIT NAGAR":     [28.6472, 77.1731],
  "SHAHDARA":         [28.6705, 77.3201],
  "CONNAUGHT PLACE":  [28.6315, 77.2193],
  "KAROL BAGH":       [28.6518, 77.1901],
  "LAJPAT NAGAR":     [28.5665, 77.2431],
  "ROHINI":           [28.7495, 77.0677],
  "DWARKA":           [28.5921, 77.0460],
  "SAKET":            [28.5244, 77.2066],
  "HAUZ KHAS":        [28.5494, 77.2001],
  "JANAKPURI":        [28.6289, 77.0832],
  "PITAMPURA":        [28.7014, 77.1311],
  "SHALIMAR BAGH":    [28.7165, 77.1551],
  "ASHOK VIHAR":      [28.6921, 77.1812],
  "MODEL TOWN":       [28.7110, 77.1921],
  "CIVIL LINES":      [28.6812, 77.2251],
  "TIMARPUR":         [28.6971, 77.2181],
  "WELCOME":          [28.6801, 77.2951],
  "SEELAMPUR":        [28.6672, 77.3145],
  "NAND NAGRI":       [28.7101, 77.3201],
  "VIVEK VIHAR":      [28.6721, 77.3151],
  "GANDHI NAGAR":     [28.6621, 77.2851],
  "KRISHNA NAGAR":    [28.6571, 77.2801],
  "LAXMI NAGAR":      [28.6311, 77.2781],
  "PREET VIHAR":      [28.6451, 77.2951],
  "PATPARGANJ":       [28.6221, 77.3101],
  "KALYAN PURI":      [28.6181, 77.3151],
  "TRILOK PURI":      [28.6251, 77.3201],
  "MANDAWALI":        [28.6301, 77.3051],
  "KHUREJI":          [28.6481, 77.3101],
  "FARSH BAZAR":      [28.6651, 77.3001],
  "SHASTRI PARK":     [28.6731, 77.2851],
  "DARYAGANJ":        [28.6421, 77.2451],
  "CHANDNI MAHAL":    [28.6571, 77.2351],
  "JAMA MASJID":      [28.6501, 77.2331],
  "PAHARGANJ":        [28.6451, 77.2151],
  "RAJENDER NAGAR":   [28.6381, 77.1901],
  "PATEL NAGAR":      [28.6471, 77.1751],
  "KIRTI NAGAR":      [28.6541, 77.1501],
  "TILAK NAGAR":      [28.6421, 77.0951],
  "VIKASPURI":        [28.6341, 77.0701],
  "UTTAM NAGAR":      [28.6181, 77.0531],
  "BINDAPUR":         [28.6081, 77.0451],
  "MOHAN GARDEN":     [28.6141, 77.0581],
  "NAJAFGARH":        [28.6081, 76.9801],
  "SAGARPUR":         [28.6041, 77.0901],
  "PALAM":            [28.5831, 77.0751],
  "IGI AIRPORT":      [28.5562, 77.1000],
  "VASANT VIHAR":     [28.5591, 77.1671],
  "MEHRAULI":         [28.5201, 77.1851],
  "MALVIYA NAGAR":    [28.5341, 77.1951],
  "GREATER KAILASH":  [28.5401, 77.2381],
  "DEFENCE COLONY":   [28.5741, 77.2351],
  "LODI COLONY":      [28.5841, 77.2251],
  "JANGPURA":         [28.5851, 77.2501],
  "NIZAMUDDIN":       [28.5881, 77.2551],
  "NEW FRIENDS COLONY":[28.5621, 77.2851],
  "SARITA VIHAR":     [28.5321, 77.2951],
  "BADARPUR":         [28.5031, 77.2951],
  "GOVIND PURI":      [28.5371, 77.2721],
  "OKHLA":            [28.5431, 77.2841],
  "KALKAJI":          [28.5381, 77.2571],
  "SANGAM VIHAR":     [28.5121, 77.2401],
  "AMBEDKAR NAGAR":   [28.5181, 77.2271],
  "TUGHLAKABAD":      [28.4871, 77.2551],
  "FATEHPUR BERI":    [28.4671, 77.1951],
  "NEB SARAI":        [28.5001, 77.2001],
  "SOUTH CAMPUS":     [28.5541, 77.2071],
  "VASANT KUNJ":      [28.5201, 77.1571],

  // NEW - Previously Missing
  "LODHI COLONY":         [28.5934, 77.2239],
  "MANDIR MARG":          [28.6361, 77.2021],
  "TUGLAK ROAD":          [28.6051, 77.2071],
  "PANDAV NAGAR":         [28.6401, 77.2901],
  "GHAZIPUR":             [28.6281, 77.3251],
  "BHALSWA DAIRY":        [28.7381, 77.1651],
  "CHITRANJAN PARK":      [28.5451, 77.2451],
  "SAMAYPURBADLI":        [28.7321, 77.0851],
  "ROHINI NORTH":         [28.7651, 77.0651],
  "KARAWAL NAGAR":        [28.7451, 77.3151],
  "VIJAY VIHAR":          [28.7151, 77.0951],
  "MAHENDRA PARK":        [28.7021, 77.1851],
  "SUBHASH PLACE":        [28.6951, 77.1451],
  "PUNJABI BAGH":         [28.6671, 77.1301],
  "MUKHERJI NAGAR":       [28.7031, 77.2051],
  "SHAHBAD DAIRY":        [28.7551, 77.1051],
  "CHHAWLA":              [28.6031, 77.0051],
  "HARI NAGAR":           [28.6271, 77.1101],
  "DARYA GANJ":           [28.6421, 77.2451],
  "FARASH BAZAR":         [28.6651, 77.3001],
  "HARSH VIHAR":          [28.7201, 77.3101],
  "ANAND PARBAT":         [28.6491, 77.1851],
  "KALYANPURI":           [28.6181, 77.3151],
  "BHAJANPURI":           [28.6551, 77.3251],
  "KOTALA MUBARAK PUR":   [28.5791, 77.2141],
  "RAJOURI GARDEN":       [28.6491, 77.1201],
  "PREETVIHAR":           [28.6451, 77.2951],
  "ROHINI SOUTH":         [28.7251, 77.0751],
  "MUNDKA":               [28.6851, 76.9951],
  "PARLIAMENT STREET":    [28.6261, 77.2111],
  "INDERPURI":            [28.6341, 77.1651],
  "MANGOLPURI":           [28.7131, 77.0751],
  "LAHORI GATE":          [28.6591, 77.2271],
  "JAMIA NAGAR":          [28.5601, 77.2951],
  "BABA HARI DAS NAGAR":  [28.6951, 77.0551],
  "MOTI NAGAR":           [28.6551, 77.1501],
  "KHYALA":               [28.6421, 77.0801],
  "MAYA PURI":            [28.6271, 77.1151],
  "BHARAT NAGAR":         [28.6881, 77.1731],
  "PRASHANT VIHAR":       [28.7281, 77.1251],
  "DELHI CANTT":          [28.5981, 77.1351],
  "SUNLIGHT COLONY":      [28.5811, 77.2701],
  "HAUZQAZI":             [28.6531, 77.2271],
  "NEW ASHOK NAGAR":      [28.6081, 77.3101],
  "VASANT KUNJ SOUTH":    [28.5101, 77.1571],
  "RAJINDER NAGAR":       [28.6381, 77.1901],
  "SHAKARPUR":            [28.6451, 77.2851],
  "BEGUM PUR":            [28.7181, 77.1651],
  "AMAR COLONY":          [28.5611, 77.2431],
  "G.T.B. ENCLAVE":       [28.6951, 77.3051],
  "ADRASH NAGAR":         [28.6981, 77.1781],
  "BADAR PUR":            [28.5031, 77.2951],
  "PARSHAD NAGAR":        [28.6471, 77.1731],
  "NANGLOI":              [28.6731, 77.0551],
  "VIKAS PURI":           [28.6341, 77.0701],
  "BAWANA":               [28.7931, 77.0351],
  "SUBZIMANDI":           [28.6751, 77.2051],
  "VASANT KUNJ NORTH":    [28.5301, 77.1571],
  "SAFDARJUNG ENCLAVE":   [28.5681, 77.1951],
  "BARA HINDU RAO":       [28.6681, 77.2151],
  "KAPASHERA":            [28.5651, 77.0651],
  "CHANAKYAPURI":         [28.5951, 77.1871],
  "BURARI":               [28.7351, 77.2151],
  "ROOP NAGAR":           [28.6851, 77.2051],
  "KESHAV PURAM":         [28.7001, 77.1551],
  "NIHAL VIHAR":          [28.6651, 77.0451],
  "KAMLA MARKET":         [28.6451, 77.2251],
  "KN KATJU MARG":        [28.7151, 77.1151],
  "DABRI":                [28.6071, 77.0851],
  "RANHOLA":              [28.6651, 77.0251],
  "MIANWALI NAGAR":       [28.6751, 77.0351],
  "JYOTI NAGAR":          [28.6851, 77.2951],
  "NARELA":               [28.8551, 77.0951],
  "MADHUVIHAR":           [28.6251, 77.3151],
  "JANAK PURI":           [28.6289, 77.0832],
  "DWARKA SEC-23":        [28.5651, 77.0451],
  "DWARKA NORTH":         [28.6051, 77.0451],
  "MAURICE NAGAR":        [28.6881, 77.2151],
  "KASHMERE GATE":        [28.6681, 77.2291],
  "JAHANGIR PURI":        [28.7301, 77.1651],
  "SEEMAPURI":            [28.6831, 77.3151],
  "DWARKA SOUTH":         [28.5651, 77.0351],
  "NANDNAGARI":           [28.7101, 77.3201],
  "NEW USMANPUR":         [28.6951, 77.2951],
  "SWARUP NAGAR":         [28.7151, 77.1851],
  "MANSAROVAR PARK":      [28.6831, 77.3051],
  "H. N. DIN":            [28.6451, 77.2351],
  "JAFFARPUR KALAN":      [28.5951, 76.9751],
  "SONIA VIHAR":          [28.7251, 77.2751],
  "I.P. ESTATE":          [28.6321, 77.2451],
  "GOKULPURI":            [28.7001, 77.3051],
  "MAURYA ENCLAVE":       [28.7151, 77.1351],
  "NARAINA":              [28.6271, 77.1551],
  "KHAJURIKHAS":          [28.7351, 77.3251],
  "ANANDVIHAR":           [28.6451, 77.3151],
  "KANJHAWALA":           [28.7451, 77.0251],
  "SAROJINI NAGAR":       [28.5771, 77.1951],
  "NABI KARIM":           [28.6471, 77.2151],
  "PULPRAHLAD PUR":       [28.5031, 77.2651],
  "SADAR BAZAR":          [28.6631, 77.1951],
  "BARAKHAMBA ROAD":      [28.6321, 77.2251],
  "PASCHIM VIHAR":        [28.6681, 77.0851],
  "JAGATPURI":            [28.6551, 77.2951],
  "ZAFRABAD":             [28.6851, 77.2951],
  "TILAK MARG":           [28.6261, 77.2371],
  "SARAI ROHILLA":        [28.6651, 77.1851],
  "PALAM VILLAGE":        [28.5831, 77.0651],
  "VIVEKVIHAR":           [28.6721, 77.3151],
  "SULTAN PURI":          [28.7151, 77.0651],
  "AMAN VIHAR":           [28.6951, 77.0751],
  "D.B.G ROAD":           [28.6751, 77.2151],
  "ALIPUR":               [28.8051, 77.1351],

  "DEFAULT": [28.6139, 77.2090]
};


async function fixCoordinates() {
  const crimes = await Crime.find({ station: { $exists: true, $ne: null } });
  console.log(`🔧 Fixing ${crimes.length} crime coordinates...`);

  let fixed = 0, fallback = 0;

  for (const crime of crimes) {
    const stationKey = crime.station?.toUpperCase().trim();
    const coords = STATION_COORDS[stationKey] || STATION_COORDS['DEFAULT'];

    // Add small jitter (50-100m) so pins don't all stack
    const jitter = () => (Math.random() - 0.5) * 0.003;

    await Crime.findByIdAndUpdate(crime._id, {
      latitude: parseFloat((coords[0] + jitter()).toFixed(6)),
      longitude: parseFloat((coords[1] + jitter()).toFixed(6))
    });

    if (STATION_COORDS[stationKey]) fixed++;
    else fallback++;
  }

  console.log(`✅ Fixed: ${fixed} with real coords`);
  console.log(`⚠️ Fallback (centre Delhi): ${fallback}`);
  console.log(`📍 Rani Bagh now at: ${STATION_COORDS['RANI BAGH']}`);

  // Show which stations are missing coords
  const crimes2 = await Crime.find({ station: { $exists: true } });
  const missing = [...new Set(
    crimes2
      .filter(c => !STATION_COORDS[c.station?.toUpperCase()?.trim()])
      .map(c => c.station)
  )];

  if (missing.length > 0) {
    console.log(`\n⚠️ Missing coords for these stations (add manually):`);
    missing.forEach(s => console.log(`  "${s?.toUpperCase()}": [lat, lng],`));
  }

  mongoose.connection.close();
}

fixCoordinates().catch(console.error);
