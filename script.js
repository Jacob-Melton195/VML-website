const teams = [
  {
    name: "Team Alpha",
    logo: "images/team1_logo.png",
    mmr: 1425,
    desc: "Strategic and precise. Known for dominating objective-based matches."
  },
  {
    name: "Shadow Core",
    logo: "images/team2_logo.png",
    mmr: 1510,
    desc: "Masters of stealth and clutch plays. Rising stars in the VML scene."
  },
  {
    name: "Crimson Vipers",
    logo: "images/team3_logo.png",
    mmr: 1380,
    desc: "Aggressive and coordinated. Their fast-paced style keeps opponents guessing."
  },
  {
    name: "Frost Syndicate",
    logo: "images/team4_logo.png",
    mmr: 1295,
    desc: "Tactical defense and icy precision."
  },
  {
    name: "Nebula Hawks",
    logo: "images/team5_logo.png",
    mmr: 1340,
    desc: "Surprising mobility and cross-map coordination."
  }
];

// Sort by MMR (desc)
teams.sort((a, b) => b.mmr - a.mmr);

// Top 3 in team cards
const topContainer = document.getElementById("top-teams");
teams.slice(0, 3).forEach(team => {
  const card = document.createElement("div");
  card.className = "team-card";
  card.innerHTML = `
    <img src="${team.logo}" alt="Logo for ${team.name}, a VML competitive team" class="team-logo" />
    <h3>${team.name}</h3>
    <p>${team.desc}</p>
    <div class="team-mmr">MMR: ${team.mmr}</div>
  `;
  topContainer.appendChild(card);
});

// All teams to leaderboard
const tableBody = document.querySelector("#leaderboard tbody");
teams.forEach((team, index) => {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${index + 1}</td>
    <td>${team.name}</td>
    <td>${team.mmr}</td>
  `;
  tableBody.appendChild(row);
});
