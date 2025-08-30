// Constants for the application
export const houses = ["Ar", "Ta", "Ge", "Cn", "Le", "Vi", "Li", "Sc", "Sg", "Cp", "Aq", "Pi"];
export const planets = ["Su", "Mo", "Ma", "Me", "Ju", "Ve", "Sa", "Ra", "Ke"];
export const divisions = [
  "D-1", "D-9", "D-10", "D-3", "D-4", "D-7", "D-12", 
  "D-27", "D-30", "D-60", "D-5", "D-11", "D-81", 
  "D-108", "D-144"
];

// Column to division mapping (matches exact Excel structure)
export const columnDivisionMap = {
  'B': 'D-1',
  'C': 'D-9',
  'D': 'D-10',
  'E': 'D-2',
  'F': 'D-3',
  'G': 'D-4',
  'H': 'D-7',
  'I': 'D-12',
  'J': 'D-16',
  'K': 'D-20',
  'L': 'D-24',
  'M': 'D-27',
  'N': 'D-30',
  'O': 'D-40',
  'P': 'D-45',
  'Q': 'D-60',
  'R': 'D-5',
  'S': 'D-6',
  'T': 'D-8',
  'U': 'D-11',
  'V': 'D-81',
  'W': 'D-108',
  'X': 'D-144'
};

// Planet name mappings
export const planetMappings = {
  "Body": "Su",
  "Lagna": "Lg",
  "Sun": "Su",
  "Moon": "Mo",
  "Mars": "Ma",
  "Mercury": "Me",
  "Jupiter": "Ju",
  "Venus": "Ve",
  "Saturn": "Sa",
  "Rahu": "Ra",
  "Ketu": "Ke",
  "Bhava Lagna": "BL",
  "Hora Lagna": "HL",
  "Ghati Lagna": "GL",
  "Vighati Lagna": "VL",
  "Varnada Lagna": "VaL",
  "Sree Lagna": "SL",
  "Pranapada Lagna": "PL",
  "Indu Lagna": "IL",
  // Also include short forms for direct matching
  "Su": "Su",
  "Mo": "Mo",
  "Ma": "Ma",
  "Me": "Me",
  "Ju": "Ju",
  "Ve": "Ve",
  "Sa": "Sa",
  "Ra": "Ra",
  "Ke": "Ke",
  "Lg": "Lg",
  "BL": "BL",
  "HL": "HL",
  "GL": "GL",
  "VL": "VL",
  "VaL": "VaL",
  "SL": "SL",
  "PL": "PL",
  "IL": "IL"
};

// House color groups
export const houseGroups = {
  group1: ["Ar", "Cn", "Li", "Cp"], // Dark green group
  group2: ["Ta", "Le", "Sc", "Aq"], // Maroon group
  group3: ["Ge", "Vi", "Sg", "Pi"]  // Purple group
};

// First house of each group should be bold
export const boldHouses = ["Ar", "Ta", "Ge"];

export const getHouseGroupColor = (house) => {
  if (houseGroups.group1.includes(house)) {
    return "bg-[#DCEDC1] text-black"; // DCEDC1 for group1
  }
  if (houseGroups.group2.includes(house)) {
    return "bg-[#93C5FD] text-black"; // 93C5FD (blue-300) for group2
  }
  if (houseGroups.group3.includes(house)) {
    return "bg-[#FFAAA5] text-black"; // FFAAA5 for group3
  }
  return ""; // No background color for other houses
};

export const getHouseTextStyle = (house) => {
  return boldHouses.includes(house) ? "font-bold" : "";
};

// Badge color mapping - now dynamic based on element group
export const getBadgeColor = (badge, elementName) => {
  if (!badge || !elementName) {
    return "bg-gray-100 text-gray-800";
  }
  
  // Extract house from element name (e.g., "as-8-cp" -> "cp")
  const houseMatch = elementName.match(/-([a-z]{2})$/i);
  if (!houseMatch) {
    return "bg-gray-100 text-gray-800";
  }
  
  const house = houseMatch[1].charAt(0).toUpperCase() + houseMatch[1].charAt(1).toLowerCase(); // "cp" -> "Cp"
  
  // Use the same color logic as house groups
  if (houseGroups.group1.includes(house)) {
    return "bg-[#DCEDC1] text-black"; // Ar group color
  }
  if (houseGroups.group2.includes(house)) {
    return "bg-[#93C5FD] text-black"; // Ta group color (blue)
  }
  if (houseGroups.group3.includes(house)) {
    return "bg-[#FFAAA5] text-black"; // Ge group color
  }
  
  return "bg-gray-100 text-gray-800"; // fallback
};

// Get house group color for number boxes - requires actual house data, not fixed mapping
export const getNumberBoxHouseColor = (number, houseData = null) => {
  // If we have actual house data, use it to determine the color
  if (houseData && houseData[number]) {
    const house = houseData[number];
    return getHouseGroupColor(house);
  }
  
  // For now, return a neutral color until we have proper house mapping
  // This prevents incorrect color assignments
  return "#F3F4F6"; // Light gray - neutral color
};

// Function to extract house from degree value (e.g. "11Ta34" -> "Ta")
export const extractHouseFromDegree = (value) => {
  if (!value) return null;
  const match = value.toString().match(/\d+([A-Za-z]{2})\d+/);
  return match ? match[1] : null;
};

// Get division name from column index (0-based)
export const getDivisionFromColumn = (colIndex) => {
  const colLetter = String.fromCharCode(65 + colIndex); // Convert 0 to 'A', 1 to 'B', etc.
  return columnDivisionMap[colLetter];
};