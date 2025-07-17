let stepIndex = 0;
let currentScenarioSteps = [];
let isWaitingForHuman = false;

// --- SCENARIO DEFINITIONS WITH EXPLANATIONS ---
const scenarios = {
    supplyChainCrisis: [
        { text: "‼️ SUPPLY CHAIN ALERT: Supply Chain Monitor detects a fire at a key microchip supplier's factory via news feeds.", bubble: ["supply-chain-monitor", "Tier-1 supplier offline!"], agent: "supply-chain-monitor", type: 'event', handoffTo: "production-planner", explanation: "<h3>Proactive Global Monitoring</h3><p>The agent continuously scans global news, weather, and logistics data for events that could impact the supply chain, providing warnings hours or days before official notice.</p><ul><li><b>vs. Manual:</b> A procurement team would likely only learn of this when the supplier sends a formal email, losing valuable time.</li><li><b>vs. RPA:</b> An RPA bot cannot read and understand unstructured news articles to identify a business risk.</li></ul>" },
        { text: "🎯 Production Planner assesses the impact: estimates that the current chip inventory will only sustain production for 72 hours.", bubble: ["production-planner", "72 hours of production left."], agent: "production-planner", handoffTo: "supply-chain-monitor", explanation: "<h3>Automated Impact Assessment</h3><p>The agent immediately cross-references the supplier disruption with real-time factory inventory levels and production schedules to quantify the immediate business impact.</p><ul><li><b>vs. Manual:</b> This analysis would require a team to manually check inventory databases and production plans, taking several hours.</li></ul>" },
        { text: "📡 Supply Chain Monitor identifies and vets three alternative suppliers, comparing their cost, capacity, and lead times.", bubble: ["supply-chain-monitor", "Vetting alternate suppliers..."], agent: "supply-chain-monitor", explanation: "<h3>Dynamic Sourcing & Vetting</h3><p>The agent doesn't just know there's a problem; it actively seeks solutions. It queries a database of potential suppliers and evaluates them against multiple criteria to find the best alternatives.</p><ul><li><b>vs. Chatbot:</b> A chatbot could list supplier names, but it cannot analyze their real-time capacity or vet them against quality control standards.</li></ul>" },
        { type: 'human_approval', text: 'The best alternative supplier is 15% more expensive. The Planner recommends proceeding to avoid a costly factory shutdown. Please approve.', options: [{text: '✅ Approve Higher Cost', branch: 'approveCost'}, {text: '❌ Pause Production Line', branch: 'pauseProduction'}], explanation: "<h3>Human-in-the-Loop Strategic Decision</h3><p>For a decision with major financial implications, the agentic system presents a clear, data-backed recommendation to a human manager for the final call, acting as a strategic advisor.</p><ul><li><b>vs. RPA:</b> An RPA bot would fail at this point. It cannot weigh the strategic trade-off between higher component cost and a full production halt.</li></ul>" }
    ],
    predictiveMaintenance: [
        { text: "‼️ PREDICTIVE ALERT: Quality Control agent detects a subtle vibration anomaly in a critical welding robot on Assembly Line 3.", bubble: ["quality-control", "Vibration anomaly on Robot #7."], agent: "quality-control", type: 'event', handoffTo: "engineering-ops", explanation: "<h3>Early Anomaly Detection</h3><p>The agent analyzes high-frequency sensor data from factory equipment, identifying microscopic deviations from normal operation that are precursors to a mechanical failure.</p><ul><li><b>vs. Rule-Based System:</b> A traditional system only triggers an alarm after a part has already failed. The agent predicts the failure *before* it happens.</li></ul>" },
        { text: "⚙️ Engineering Ops agent cross-references the vibration signature with its knowledge base and predicts a 95% probability of a bearing failure within 48 hours.", bubble: ["engineering-ops", "Bearing failure imminent."], agent: "engineering-ops", handoffTo: "production-planner", explanation: "<h3>Automated Diagnosis & Prediction</h3><p>The agent diagnoses the specific type of impending failure by matching the sensor data to a library of known fault patterns, and it provides a specific timeframe for action.</p><ul><li><b>vs. Manual:</b> This automates the complex work of a senior maintenance engineer, eliminating the need for manual inspection and guesswork.</li></ul>" },
        { text: "🎯 Production Planner initiates the 'Scheduled Maintenance' playbook, finding a 2-hour window during the next shift change to perform the repair.", bubble: ["production-planner", "Scheduling repair window."], agent: "production-planner", handoffTo: "logistics-coordinator", explanation: "<h3>Intelligent Scheduling</h3><p>The agent analyzes the master production schedule to find the least disruptive time to take the robot offline, minimizing impact on production targets.</p><ul><li><b>vs. Manual:</b> A manager would have to manually coordinate with the production floor, potentially choosing a suboptimal time that impacts output.</li></ul>" },
        { text: "COLLABORATIVE ACTION: Logistics Coordinator orders the replacement bearing to be delivered to Line 3, while Engineering Ops assigns a maintenance technician.", agent: ['logistics-coordinator', 'engineering-ops'], bubble: ["logistics-coordinator", "Part ordered. Tech assigned."], explanation: "<h3>Synchronized Resource Allocation</h3><p>The system executes the maintenance plan by coordinating multiple agents in parallel. It handles parts procurement and human resource allocation simultaneously to ensure the repair is done efficiently.</p><ul><li><b>vs. Siloed Teams:</b> This avoids the delays of the planner having to call logistics, who then has to call maintenance. The response is instant and unified.</li></ul>" }
    ],
    newModelRollout: [
        { text: "PROACTIVE GOAL: The Planner agent is tasked with the goal: 'Retool Assembly Line 2 for the new 'Electron' EV model by Q4'.", bubble: ["production-planner", "Initiating 'Electron' rollout."], agent: "production-planner", type: 'optimized', handoffTo: "engineering-ops", explanation: "<h3>Complex Goal Decomposition</h3><p>The agent takes a high-level, complex business goal and autonomously breaks it down into a sequence of logical sub-tasks and dependencies.</p><ul><li><b>vs. Virtual Assistant:</b> A virtual assistant could set a calendar reminder, but it cannot understand the intricate steps involved in retooling a factory line.</li></ul>" },
        { text: "⚙️ Engineering Ops agent analyzes the 'Electron' CAD models and generates a list of 37 required new robotic end-effectors and software updates.", bubble: ["engineering-ops", "Generating retooling BOM."], agent: "engineering-ops", handoffTo: "supply-chain-monitor", explanation: "<h3>Automated Bill of Materials (BOM) Generation</h3><p>The agent can interpret technical design documents (CAD files) to automatically generate a precise list of all necessary hardware and software changes, eliminating human error.</p><ul><li><b>vs. Manual:</b> This automates a highly detailed and error-prone task that would normally take engineers weeks to complete.</li></ul>" },
        { text: "📡 Supply Chain Monitor sources vendors for the new equipment and negotiates delivery timelines to align with the Q4 goal.", bubble: ["supply-chain-monitor", "Sourcing new equipment..."], agent: "supply-chain-monitor", handoffTo: "production-planner", explanation: "<h3>Goal-Oriented Negotiation</h3><p>The agent's negotiation with suppliers is driven by the master goal. It prioritizes delivery timelines to ensure the Q4 deadline is met, even if it means slightly adjusting other parameters like cost.</p><ul><li><b>vs. RPA:</b> An RPA bot could send a purchase order, but it cannot dynamically negotiate with a supplier to align with a strategic project deadline.</li></ul>" },
        { text: "🔁 Factory Optimizer runs a digital twin simulation of the new assembly line, identifying a potential bottleneck that reduces throughput by 12%.", bubble: ["factory-optimizer", "Simulation found a bottleneck!"], agent: "factory-optimizer", type: 'learning', handoffTo: "engineering-ops", explanation: "<h3>Virtual Simulation & Optimization</h3><p>Before any physical changes are made, the Optimizer agent simulates the entire new process in a virtual environment (a 'digital twin') to identify and fix problems before they can cause real-world delays.</p><ul><li><b>vs. All Others:</b> This proactive, simulation-based optimization is a uniquely powerful capability, saving millions by preventing costly real-world errors and redesigns.</li></ul>" }
    ],
    // Branches for human choice
    approveCost: [
      { text: "HUMAN INPUT: ✅ Higher cost approved. Supply Chain Monitor is placing a high-priority order with the alternative supplier.", bubble: ["supply-chain-monitor", "Placing emergency order."], agent: "supply-chain-monitor", type: 'optimized', explanation: "<h3>Action from Approval</h3><p>With human oversight, the agentic system executes the approved strategy, automatically handling the procurement and logistics of the emergency order to prevent a production stoppage.</p>" }
    ],
    pauseProduction: [
      { text: "HUMAN INPUT: ❌ Cost increase rejected. Production Planner is initiating a controlled shutdown of Line 3 to conserve remaining chips for other lines.", bubble: ["production-planner", "Initiating controlled shutdown."], agent: "production-planner", explanation: "<h3>Dynamic Re-Planning to New Goal</h3><p>When its primary recommendation is rejected, the system understands the new implicit goal ('minimize cost') and pivots to an entirely different strategy, orchestrating a controlled shutdown to conserve resources.</p>" }
    ]
};

// --- CANVAS & DRAWING FUNCTIONS ---
let dashOffset = 0;
let animationFrameId = null;

function clearCanvas() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  const canvas = document.getElementById('arrowCanvas');
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
}

function drawArrow(fromId, toId, offset) {
  const canvas = document.getElementById('arrowCanvas');
  const container = document.querySelector('.dashboard-container'); 
  canvas.width = container.offsetWidth;
  canvas.height = container.offsetHeight;
  const ctx = canvas.getContext('2d');

  const fromEl = document.getElementById(fromId);
  const toEl = document.getElementById(toId);
  
  const containerPadding = parseFloat(window.getComputedStyle(container).paddingLeft);

  const startX = fromEl.offsetLeft + fromEl.offsetWidth / 2 - containerPadding;
  const startY = fromEl.offsetTop + fromEl.offsetHeight / 2 - containerPadding;
  const endX = toEl.offsetLeft + toEl.offsetWidth / 2 - containerPadding;
  const endY = toEl.offsetTop + toEl.offsetHeight / 2 - containerPadding;

  ctx.setLineDash([10, 5]);
  ctx.lineDashOffset = -offset;
  ctx.strokeStyle = '#0f62fe';
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(startX, startY);
  ctx.lineTo(endX, endY);
  ctx.stroke();

  ctx.setLineDash([]);
  const angle = Math.atan2(endY - startY, endX - startX);
  ctx.beginPath();
  ctx.moveTo(endX, endY);
  ctx.lineTo(endX - 10 * Math.cos(angle - Math.PI / 6), endY - 10 * Math.sin(angle - Math.PI / 6));
  ctx.lineTo(endX - 10 * Math.cos(angle + Math.PI / 6), endY - 10 * Math.sin(angle + Math.PI / 6));
  ctx.closePath();
  ctx.fillStyle = '#0f62fe';
  ctx.fill();
}

function startArrowAnimation(fromId, toId) {
  dashOffset = 0;
  const animate = () => {
    dashOffset += 0.5;
    clearCanvas();
    drawArrow(fromId, toId, dashOffset);
    animationFrameId = requestAnimationFrame(animate);
  };
  animate();
}

function showBubble(agent, msg) {
  const icons = { 'supply-chain-monitor': '📡 ', 'quality-control': '🔬 ', 'production-planner': '🎯 ', 'logistics-coordinator': '🚚 ', 'engineering-ops': '⚙️ ', 'factory-optimizer': '🔁 '};
  const bubble = document.getElementById("bubble-" + agent);
  if (!bubble) return;
  bubble.textContent = '';
  bubble.className = 'bubble typing';
  setTimeout(() => {
    bubble.textContent = icons[agent] + msg;
    bubble.className = 'bubble show';
    setTimeout(() => { bubble.className = 'bubble shrink-out'; }, 2500);
  }, 800);
}

// --- HUMAN INTERACTION & EXPLANATION FUNCTIONS ---
function updateExplanation(htmlContent) {
    const explanationContainer = document.getElementById('explanation-text');
    explanationContainer.innerHTML = htmlContent;
}

function handleHumanChoice(branchName) {
  const humanInputContainer = document.getElementById('humanInputContainer');
  humanInputContainer.innerHTML = '';
  isWaitingForHuman = false;
  document.getElementById('nextStepBtn').disabled = false;
  
  const nextSteps = scenarios[branchName];
  currentScenarioSteps.splice(stepIndex, 0, ...nextSteps);
  nextStep();
}

function askForHumanInput(step) {
  isWaitingForHuman = true;
  document.getElementById('nextStepBtn').disabled = true;

  updateExplanation(step.explanation);

  const humanInputContainer = document.getElementById('humanInputContainer');
  humanInputContainer.innerHTML = `<p>${step.text}</p>`;
  
  step.options.forEach(option => {
    const btn = document.createElement('button');
    btn.textContent = option.text;
    btn.onclick = () => handleHumanChoice(option.branch);
    humanInputContainer.appendChild(btn);
  });
}

function executeStep(step) {
  clearCanvas();
  const log = document.getElementById("scenarioLog");

  if (step.type === 'human_approval') {
    askForHumanInput(step);
    return;
  }
  
  updateExplanation(step.explanation || '<p>The agents are processing the next action...</p>');

  const logEntry = document.createElement('div');
  logEntry.textContent = step.text;
  if (step.type === 'event') { logEntry.className = 'log-event'; }
  else if (step.type === 'learning') { logEntry.className = 'log-learning'; }
  else if (step.type === 'optimized') { logEntry.className = 'log-optimized'; }
  log.appendChild(logEntry);

  if (step.bubble) showBubble(step.bubble[0], step.bubble[1]);
  if (step.handoffTo) startArrowAnimation(step.agent, step.handoffTo);

  const agents = Array.isArray(step.agent) ? step.agent : [step.agent];
  agents.forEach(agentName => {
    if (agentName) {
      const statusEl = document.getElementById(agentName).querySelector(".status");
      statusEl.textContent = "Active";
      statusEl.className = "status active";
      setTimeout(() => {
        statusEl.textContent = "Idle";
        statusEl.className = "status idle";
      }, 2500);
    }
  });
}

function nextStep() {
  if (isWaitingForHuman) return;

  if (stepIndex < currentScenarioSteps.length) {
    executeStep(currentScenarioSteps[stepIndex]);
    stepIndex++;
  } else {
    document.getElementById('nextStepBtn').disabled = true;
    const log = document.getElementById("scenarioLog");
    const endMessage = document.createElement('p');
    endMessage.className = 'log-end';
    endMessage.innerHTML = '🏁 End of Scenario 🏁';
    if (!log.querySelector('.log-end')) {
        log.appendChild(endMessage);
    }
    updateExplanation('<h3>Scenario Complete</h3><p>The agentic system has successfully achieved its goal. It can now be tasked with a new objective or continue monitoring for new events.</p>');
  }
}

function runScenario(type, btnElement) {
  document.querySelectorAll('.scenario-btn').forEach(btn => btn.classList.remove('btn-active'));
  if (btnElement) btnElement.classList.add('btn-active');

  stepIndex = 0;
  isWaitingForHuman = false;
  currentScenarioSteps = scenarios[type];

  document.getElementById('humanInputContainer').innerHTML = '';
  document.getElementById('nextStepBtn').disabled = false;
  const log = document.getElementById("scenarioLog");
  log.innerHTML = "";
  clearCanvas();
  updateExplanation('<p>Select a scenario and click "Next Step" to begin. This panel will update to explain the value of each agent action.</p>');
  document.querySelectorAll(".status").forEach(s => { s.textContent = "Idle"; s.className = "status idle"; });
  
  const scenarioName = type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  log.innerHTML = `<p>[ Scenario loaded: <b>${scenarioName}</b>. Click 'Next Step' to begin. ]</p>`;
}

document.addEventListener('DOMContentLoaded', () => {
    const buttonContainer = document.querySelector('.header-container div');
    buttonContainer.innerHTML = '';

    Object.keys(scenarios).forEach(key => {
        if (!key.startsWith('approve') && !key.startsWith('pause')) {
            const btn = document.createElement('button');
            btn.className = 'scenario-btn';
            
            let emoji = '⚙️';
            if (key === 'supplyChainCrisis') emoji = '🔥';
            if (key === 'predictiveMaintenance') emoji = '🔧';
            if (key === 'newModelRollout') emoji = '🚗';
            let name = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());

            btn.innerHTML = `${emoji} ${name}`;
            btn.onclick = () => runScenario(key, btn);
            buttonContainer.appendChild(btn);
        }
    });
    
    const firstButton = document.querySelector('.scenario-btn');
    if (firstButton) {
        // Correctly get the scenario key from the button's onclick handler or another attribute
        // For simplicity, we'll hardcode the default scenario key here
        runScenario('supplyChainCrisis', firstButton);
    }
});
