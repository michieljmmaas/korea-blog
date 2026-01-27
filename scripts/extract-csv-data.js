const fs = require('fs');
const csv = require('csv-parser');

// Array to store the parsed data
const locations = [];

// Read and parse the CSV file
fs.createReadStream('scripts/geo.csv')
  .pipe(csv())
  .on('data', (row) => {
    // Add each row to the locations array
    locations.push({
      latitude: parseFloat(row.latitude),
      longitude: parseFloat(row.longitude),
      time: row.time,
      description: '' // Empty description field
    });
  })
  .on('end', () => {
    console.log('CSV file successfully processed');
    
    // Group locations by date
    const groupedByDate = {};
    
    locations.forEach((location) => {
      // Extract date from time string (format: "20/11/2025 02:41")
      const date = location.time.split(' ')[0];
      
      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }
      
      groupedByDate[date].push(location);
    });
    
    // Create the YAML front matter
    
    let yamlContent = "";
    // Iterate through each date
    Object.keys(groupedByDate).sort().forEach((date) => {
      const [day, month, year] = date.split("/");
      let datestr = year + "-" + month + "-" + day;


      yamlContent += `${datestr}:\n`;
      
      // Add all locations for this date
      groupedByDate[date].forEach((location) => {
        yamlContent += `  - coordinates:\n`;
        yamlContent += `      latitude: ${location.latitude}\n`;
        yamlContent += `      longitude: ${location.longitude}\n`;
        yamlContent += `    time: "${location.time}"\n`;
        yamlContent += `    description: "${location.description}"\n`;
      });
    });
      
    // Write to markdown file
    fs.writeFileSync('scripts/locations.yml', yamlContent);
    console.log('Markdown file created: scripts/locations.yml');
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
  });