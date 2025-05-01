const SHEET_URL = 'https://script.google.com/macros/s/AKfycbysxmf4X6FnGQ-hiGYXFmG79gArmRsjLCC2peW6q7KSeCRNwXroxxqHCxOP-au45VOD/exec';
const DEFAULT_LOGO = 'images/default-team-logo.png';

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const teamName = urlParams.get('name');
  
  if (!teamName) {
    window.location.href = 'index.html';
    return;
  }

  // Initialize all elements
  const elements = {
    teamName: document.getElementById('team-name'),
    teamLogo: document.getElementById('team-logo'),
    teamRank: document.getElementById('team-rank'),
    teamWins: document.getElementById('team-wins'),
    teamPoints: document.getElementById('team-points'),
    teamMmr: document.getElementById('team-mmr'),
    teamMapWins: document.getElementById('team-mapwins'),
    playersContainer: document.getElementById('players-container'),
    matchesContainer: document.getElementById('matches-container')
  };

  // Set team name immediately
  const decodedName = decodeURIComponent(teamName);
  elements.teamName.textContent = decodedName;
  document.title = `${decodedName} - VAIL VML`;

  // Set team logo - try team specific first, then default
  const teamLogoName = `images/team-logos/${decodedName.toLowerCase().replace(/\s+/g, '-')}-logo.png`;
  elements.teamLogo.src = teamLogoName;
  elements.teamLogo.onerror = function() {
    this.src = DEFAULT_LOGO;
    this.onerror = null; // Prevent infinite loop if default fails
  };

  // Apply square styling
  elements.teamLogo.style.borderRadius = '0';
  elements.teamLogo.style.border = 'none';
  elements.teamLogo.style.backgroundColor = '#111';
  elements.teamLogo.style.padding = '5px';

  fetchTeamData(decodedName, elements);
});

async function fetchTeamData(teamName, elements) {
  try {
    showLoadingState(elements);
    
    const response = await fetch(`${SHEET_URL}?name=${encodeURIComponent(teamName)}`);
    if (!response.ok) throw new Error('Network response was not ok');
    
    const teamData = await response.json();
    
    if (!teamData) {
      throw new Error('Team not found');
    }
    
    console.log('Team Data:', teamData); // Debug log
    
    renderTeamDetails(teamData, elements);
  } catch (error) {
    console.error('Error loading team data:', error);
    showErrorUI();
    setTimeout(() => window.location.href = 'index.html', 3000);
  }
}

function showLoadingState(elements) {
  if (elements.playersContainer) {
    elements.playersContainer.innerHTML = '<div class="loading-spinner"></div>';
  }
  if (elements.matchesContainer) {
    elements.matchesContainer.innerHTML = '<div class="loading-spinner"></div>';
  }
}

function renderTeamDetails(team, elements) {
  // Map the data to match your spreadsheet columns
  const stats = {
    rank: team.Ranking || team.rank || 'N/A',
    wins: team['Match Wins:'] || team.wins || '0',
    points: team.Points || team.points || '0',
    mmr: team['Total MMR:'] || team.mmr || '0',
    mapWins: team['Map Wins:'] || '0'
  };

  // Update stats display
  if (elements.teamRank) elements.teamRank.textContent = stats.rank;
  if (elements.teamWins) elements.teamWins.textContent = stats.wins;
  if (elements.teamPoints) elements.teamPoints.textContent = stats.points;
  if (elements.teamMmr) elements.teamMmr.textContent = stats.mmr;
  
  // Update map wins
  if (elements.teamMapWins) {
    const mapWinsElement = elements.teamMapWins.querySelector('p');
    if (mapWinsElement) mapWinsElement.textContent = stats.mapWins;
  }

  // Update players section (empty for now)
  updateSection(
    elements.playersContainer, 
    [], 
    'player', 
    () => ''
  );

  // Update matches section (empty for now)
  updateSection(
    elements.matchesContainer, 
    [], 
    'match', 
    () => ''
  );
}

function updateSection(container, items, type, template) {
  if (!container) return;
  
  if (items?.length > 0) {
    container.classList.remove('no-data-message');
    container.innerHTML = items.map(template).join('');
  } else {
    container.classList.add('no-data-message');
    container.innerHTML = `No ${type} data available`;
  }
}

function showErrorUI() {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML = `
      <div class="error-message">
        <h2>Team Not Found</h2>
        <p>We couldn't find the team you're looking for.</p>
        <p>Redirecting you back to the leaderboard...</p>
      </div>
    `;
  }
}