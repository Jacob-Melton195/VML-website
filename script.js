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
      
   
      if (columns.length < 5 || 
          columns[0].trim() === '' || 
          isNaN(columns[4]) || 
          columns[0].includes('=') || 
          columns[0].includes('Formula') || 
          columns[0].includes('Last Updated')) { 
        return null;
      }
      
      return {
        name: columns[0].trim(),
        wins: parseInt(columns[3]) || 0,
        losses: 'N/A', 
        points: parseInt(columns[1]) || 0, 
        mmr: parseInt(columns[4]) || 0
      };
    })
    .filter(team => team !== null);
}

function renderTeams(teams) {
  const topContainer = document.getElementById("top-teams");
  const topTeams = teams.slice(0, 3);
  
  // Reorder for display: [2nd, 1st, 3rd] to show as [left, center, right]
  const podiumOrder = [1, 0, 2]; // Indexes for 2nd, 1st, 3rd place positions
  
  topContainer.innerHTML = podiumOrder.map((position, displayIndex) => {
    const team = topTeams[position];
    if (!team) return '';
    
    // Determine placement class and rank text based on original position
    let placeClass, rankText;
    if (position === 0) { // Original 1st place
      placeClass = 'first-place';
      rankText = '1st';
    } else if (position === 1) { // Original 2nd place
      placeClass = 'second-place';
      rankText = '2nd';
    } else { // Original 3rd place
      placeClass = 'third-place';
      rankText = '3rd';
    }
  
    return `
      <div class="team-card ${placeClass}">
        <div class="rank-badge">${rankText}</div>
        <h3>${team.name}</h3>
        <p>Wins: ${team.wins}</p>
        <p>Points: ${team.points}</p>
        <div class="team-mmr">MMR: ${team.mmr}</div>
      </div>
    `;
  }).join('');

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

document.addEventListener('DOMContentLoaded', fetchTeamsData);