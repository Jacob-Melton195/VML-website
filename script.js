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

function renderTeams(teams) {
  const sortedTeams = [...teams].sort((a, b) => b.mmr - a.mmr);

  const topContainer = document.getElementById("top-teams");
  const [firstPlace, secondPlace, thirdPlace] = sortedTeams.slice(0, 3);

  topContainer.innerHTML = `
    <!-- Second Place (Left) -->
    ${secondPlace ? `
      <div class="team-card second-place">
        <div class="rank-badge">2nd</div>
        <h3>${secondPlace.name}</h3>
        <p>Wins: ${secondPlace.wins}</p>
        <p>Points: ${secondPlace.points}</p>
        <div class="team-mmr">MMR: ${secondPlace.mmr}</div>
      </div>
    ` : ''}
    
    <!-- First Place (Center) -->
    ${firstPlace ? `
      <div class="team-card first-place">
        <div class="rank-badge">1st</div>
        <h3>${firstPlace.name}</h3>
        <p>Wins: ${firstPlace.wins}</p>
        <p>Points: ${firstPlace.points}</p>
        <div class="team-mmr">MMR: ${firstPlace.mmr}</div>
      </div>
    ` : ''}
    
    <!-- Third Place (Right) -->
    ${thirdPlace ? `
      <div class="team-card third-place">
        <div class="rank-badge">3rd</div>
        <h3>${thirdPlace.name}</h3>
        <p>Wins: ${thirdPlace.wins}</p>
        <p>Points: ${thirdPlace.points}</p>
        <div class="team-mmr">MMR: ${thirdPlace.mmr}</div>
      </div>
    ` : ''}
  `;

  const tableBody = document.querySelector("#leaderboard tbody");
  tableBody.innerHTML = sortedTeams.map((team, index) => `
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

document.addEventListener('DOMContentLoaded', fetchTeamsData);