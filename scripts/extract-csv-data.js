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

    // Timezone offset: Taiwan is UTC+8, Netherlands is UTC+1 (winter) or UTC+2 (summer)
    // Assuming the data was recorded in Taiwan time but stored as Dutch time
    // We need to add 7 hours (or 6 hours during Dutch summer time)
    const TIMEZONE_OFFSET_HOURS = 7; // Adjust this if needed

    // Adjust timestamps for timezone
    locations.forEach((location) => {
      // Parse the original time
      const [datePart, timePart] = location.time.split(' ');
      const [day, month, year] = datePart.split('/').map(Number);
      const [hour, minute] = timePart.split(':').map(Number);

      // Create date object and add timezone offset
      const originalDate = new Date(year, month - 1, day, hour, minute);
      originalDate.setHours(originalDate.getHours() + TIMEZONE_OFFSET_HOURS);

      // Format back to string with corrected time
      const correctedDay = String(originalDate.getDate()).padStart(2, '0');
      const correctedMonth = String(originalDate.getMonth() + 1).padStart(2, '0');
      const correctedYear = originalDate.getFullYear();
      const correctedHour = String(originalDate.getHours()).padStart(2, '0');
      const correctedMinute = String(originalDate.getMinutes()).padStart(2, '0');

      location.time = `${correctedDay}/${correctedMonth}/${correctedYear} ${correctedHour}:${correctedMinute}`;
    });

    console.log(`Applied timezone offset of +${TIMEZONE_OFFSET_HOURS} hours`);

    // Group locations by date (using corrected timestamps)
    const groupedByDate = {};

    locations.forEach((location) => {
      // Extract date from corrected time string
      const date = location.time.split(' ')[0];

      if (!groupedByDate[date]) {
        groupedByDate[date] = [];
      }

      groupedByDate[date].push(location);
    });

    // Function to calculate distance between two coordinates in meters (Haversine formula)
    function getDistance(lat1, lon1, lat2, lon2) {
      const R = 6371e3; // Earth's radius in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) *
        Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    }

    // Function to parse time string to comparable format
    function parseTime(timeStr) {
      // Format: "20/11/2025 02:41"
      const [datePart, timePart] = timeStr.split(' ');
      const [day, month, year] = datePart.split('/');
      const [hour, minute] = timePart.split(':');
      return new Date(year, month - 1, day, hour, minute);
    }

    // Function to filter locations that are too close
    function filterCloseLocations(locations, minDistance = 50) {
      if (locations.length === 0) return [];

      // Sort by time first
      locations.sort((a, b) => parseTime(a.time) - parseTime(b.time));

      const filtered = [locations[0]]; // Always keep the first location

      for (let i = 1; i < locations.length; i++) {
        const lastKept = filtered[filtered.length - 1];
        const current = locations[i];

        const distance = getDistance(
          lastKept.latitude,
          lastKept.longitude,
          current.latitude,
          current.longitude
        );

        // Only keep if distance is greater than minimum distance
        if (distance >= minDistance) {
          filtered.push(current);
        }
      }

      return filtered;
    }

    // Create the YAML content
    let yamlContent = "";
    let totalOriginal = 0;
    let totalFiltered = 0;

    let seed = {
      "2025-11-21": {
        19: "Fo Guang Shan Buddha Museum",
        43: "National Kaohsiung Center for the Arts",
        53: "Liuhe Night Market"
      }
    }

    // Iterate through each date
    Object.keys(groupedByDate).forEach((date) => {
      let index = 0;
      const [day, month, year] = date.split("/");
      let datestr = year + "-" + month + "-" + day;

      // Filter locations for this date (minimum 50 meters apart)
      const originalCount = groupedByDate[date].length;
      const filteredLocations = filterCloseLocations(groupedByDate[date], 50);

      totalOriginal += originalCount;
      totalFiltered += filteredLocations.length;

      console.log(`${datestr}: ${originalCount} -> ${filteredLocations.length} locations (removed ${originalCount - filteredLocations.length})`);

      yamlContent += `${datestr}:\n`;

      // Add all filtered locations for this date
      filteredLocations.forEach((location) => {
        let description = "";
        if (seed[datestr] !== undefined) {
          if (seed[datestr][index] !== undefined) {
            description = seed[datestr][index];
          }
        }

        yamlContent += `  - coordinates:\n`;
        yamlContent += `      latitude: ${location.latitude}\n`;
        yamlContent += `      longitude: ${location.longitude}\n`;
        yamlContent += `    time: "${location.time}"\n`;
        yamlContent += `    description: "${description}"\n`;
        yamlContent += `    index: ${index}\n`;
        index++;
      });
    });

    console.log(`\nTotal: ${totalOriginal} -> ${totalFiltered} locations (removed ${totalOriginal - totalFiltered})`);

    // Write to YAML file
    fs.writeFileSync('content/locations/locations.yaml', yamlContent);
    console.log('YAML file created');
  })
  .on('error', (error) => {
    console.error('Error reading CSV file:', error);
  });