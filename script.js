const SHEET_URL = 'https://script.google.com/macros/s/AKfycbzWzqoEbtRupmawN4YAJJ68U6lckzN7Xz3JgtBMj9AuirPTxVIPkwftUGcya1P2vjT2/exec';

async function fetchTeamsData() {
  try {
    const response = await fetch(SHEET_URL);
    if (!response.ok) throw new Error('Network response was not ok');
    const teams = await response.json();
    
    if (teams.length === 0) {
      throw new Error('No valid team data found');
    }
    
    renderTeams(teams);
  } catch (error) {
    console.error('Error loading team data:', error);
    showErrorUI();
  }
}
function parseCSVData(csv) {
  const lines = csv.split('\n').filter(line => line.trim() !== '');
  
  // Find the header row
  const headerRow = lines.find(line => 
    line.includes('Column 1') || 
    line.includes('Points') || 
    line.includes('Match Wins')
  );
  
  if (!headerRow) return [];
  
  const headerIndex = lines.indexOf(headerRow);
  const dataRows = lines.slice(headerIndex + 1);
  
  return dataRows
    .map(row => {
      const columns = row.split(',');
      
      // Skip rows that are not team data
      if (columns.length < 5 || 
          columns[0].trim() === '' || 
          isNaN(columns[4]) || // MMR should be a number
          columns[0].includes('=') || // Skip ND=Not Decided
          columns[0].includes('Formula') || // Skip formula rows
          columns[0].includes('Last Updated')) { // Skip date row
        return null;
      }
      
      return {
        name: columns[0].trim(),
        wins: parseInt(columns[3]) || 0,
        losses: 'N/A', // Default value since sheet doesn't track losses
        points: parseInt(columns[1]) || 0, // Added points from column 2
        mmr: parseInt(columns[4]) || 0
      };
    })
    .filter(team => team !== null);
}

function renderTeams(teams) {
  // Sort by MMR descending
  teams.sort((a, b) => b.mmr - a.mmr);
  
  // Update top teams section with podium layout
  const topContainer = document.getElementById("top-teams");
  const topTeams = teams.slice(0, 3);
  
  // Reorder for display: [2nd, 1st, 3rd]
  const podiumOrder = [1, 0, 2]; // Indexes for 2nd, 1st, 3rd place
  
  topContainer.innerHTML = podiumOrder.map(position => {
    const team = topTeams[position];
    if (!team) return '';
    
    const placeClass = position === 1 ? 'first-place' : 
                      position === 0 ? 'second-place' : 'third-place';
    const placeText = position === 1 ? '1st' : 
                      position === 0 ? '2nd' : '3rd';
    
    return `
      <div class="team-card ${placeClass}">
        <div class="rank-badge">${placeText}</div>
        <h3>${team.name}</h3>
        <p>Wins: ${team.wins}</p>
        <p>Points: ${team.points}</p>
        <div class="team-mmr">MMR: ${team.mmr}</div>
      </div>
    `;
  }).join('');
  
  // Update leaderboard table (now includes points column)
  const tableBody = document.querySelector("#leaderboard tbody");
  tableBody.innerHTML = teams.map((team, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>${team.name}</td>
      <td>${team.wins}</td>
      <td>${team.points}</td>
      <td>${team.mmr}</td>
    </tr>
  `).join('');
}

function showErrorUI() {
  const errorHTML = `
    <div class="error-message">
      <p>⚠️ Could not load leaderboard data</p>
      <p>Please try refreshing the page or check back later</p>
      <p>Last updated: ${new Date().toLocaleString()}</p>
    </div>
  `;
  
  document.getElementById("top-teams").innerHTML = errorHTML;
  document.querySelector("#leaderboard tbody").innerHTML = `
    <tr>
      <td colspan="5" class="error-cell">Data unavailable</td>
    </tr>
  `;
}

// Add some basic CSS for error states
const errorStyles = document.createElement('style');
errorStyles.textContent = `
  .error-message {
    color: #ff5555;
    text-align: center;
    padding: 20px;
    border: 1px solid #ff5555;
    border-radius: 8px;
    margin: 20px auto;
    max-width: 500px;
  }
  .error-cell {
    color: #ff5555;
    text-align: center;
    padding: 20px;
  }
`;
document.head.appendChild(errorStyles);

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', fetchTeamsData);