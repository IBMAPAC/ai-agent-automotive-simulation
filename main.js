let stepIndex = 0;
let currentScenarioSteps = [];
let isWaitingForHuman = false;

// --- SCENARIO DEFINITIONS (GLOBAL) ---
const scenarios = {
    supplyChainCrisis: [
        { text: "‼️ SUPPLY CHAIN ALERT: Supply Chain Monitor detects a fire at a key microchip supplier's factory via news feeds.", bubble: ["supply-chain-monitor", "Tier-1 supplier offline!"], agent: "supply-chain-monitor", type: 'event', handoffTo: "production-planner", 
          explanation: "<h3>Proactive Global Monitoring</h3><p>The agent continuously scans global news, weather, and logistics data for events that could impact the supply chain, providing warnings hours or days before official notice.</p><ul><li><b>vs. Manual:</b> A procurement team would likely only learn of this when the supplier sends a formal email, losing valuable time.</li><li><b>vs. RPA:</b> An RPA bot cannot read and understand unstructured news articles to identify a business risk.</li></ul>",
          challenge: "<h3>Data Source Veracity</h3><p>How do you ensure the agent is acting on a credible news source and not a rumor or inaccurate report? A false positive could trigger a costly and unnecessary global supply chain pivot.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx.data</strong> to connect to a curated set of trusted, premium market intelligence APIs.</li><li>Implement a rule in <strong>watsonx.governance</strong> requiring a confidence score above 95% or cross-verification from multiple sources before escalating the alert.</li></ul>"
        },
        { text: "🎯 Production Planner assesses the impact: estimates that the current chip inventory will only sustain production for 72 hours.", bubble: ["production-planner", "72 hours of production left."], agent: "production-planner", handoffTo: "supply-chain-monitor", 
          explanation: "<h3>Automated Impact Assessment</h3><p>The agent immediately cross-references the supplier disruption with real-time factory inventory levels from <strong>IBM Maximo</strong> and production schedules to quantify the immediate business impact.</p><ul><li><b>vs. Manual:</b> This analysis would require a team to manually check inventory databases and production plans, taking several hours.</li></ul>",
          challenge: "<h3>Real-Time Data Integration</h3><p>To be accurate, the impact assessment requires instant access to constantly changing data from multiple siloed systems (e.g., ERP, Inventory Management, MES). A lag or data sync error could make the assessment dangerously incorrect.</p><p><strong>Potential Solutions:</strong></p><ul><li>Leverage <strong>watsonx.data</strong> to provide a single, virtualized access point to all necessary data sources without slow and expensive data movement.</li><li>Use <strong>Instana</strong> to provide full-stack observability on the APIs connecting these systems, immediately flagging any data pipeline failures or performance degradation.</li></ul>"
        },
        { text: "📡 Supply Chain Monitor identifies and vets three alternative suppliers, comparing their cost, capacity, and lead times.", bubble: ["supply-chain-monitor", "Vetting alternate suppliers..."], agent: "supply-chain-monitor", 
          explanation: "<h3>Dynamic Sourcing & Vetting</h3><p>The agent doesn't just know there's a problem; it actively seeks solutions. It queries a database of potential suppliers and evaluates them against multiple criteria to find the best alternatives.</p><ul><li><b>vs. Chatbot:</b> A chatbot could list supplier names, but it cannot analyze their real-time capacity or vet them against quality control standards.</li></ul>",
          challenge: "<h3>Complex Multi-Variable Analysis</h3><p>Comparing suppliers isn't just about cost. The agent must weigh dozens of variables like lead time, quality scores, production capacity, and compliance history. This complex analysis must be both fast and accurate.</p><p><strong>Potential Solutions:</strong></p><ul><li>Build the vetting agent using <strong>watsonx.ai</strong> and specialized <strong>IBM Granite models</strong> trained on your company's historical supplier performance data.</li><li>Use <strong>watsonx.governance</strong> to set clear, weighted objectives for the agent (e.g., 'Lead time is twice as important as cost for this event'), ensuring its recommendations align with strategic priorities.</li></ul>"
        },
        { type: 'human_approval', text: 'The best alternative supplier is 15% more expensive. The Planner recommends proceeding to avoid a costly factory shutdown. Please approve.', options: [{text: '✅ Approve Higher Cost', branch: 'approveCost'}, {text: '❌ Pause Production Line', branch: 'pauseProduction'}], 
          explanation: "<h3>Human-in-the-Loop Strategic Decision</h3><p>For a decision with major financial implications, the agentic system presents a clear, data-backed recommendation to a human manager for the final call, acting as a strategic advisor.</p><ul><li><b>vs. RPA:</b> An RPA bot would fail at this point. It cannot weigh the strategic trade-off between higher component cost and a full production halt.</li></ul>",
          challenge: "<h3>Trust & Explainability</h3><p>For a human to approve this, the agent's recommendation must be fully transparent. Why this specific supplier? What data was used? A black-box recommendation would rightly be rejected, causing delays.</p><p><strong>Potential Solutions:</strong></p><ul><li>Leverage <strong>watsonx.governance</strong> to automatically generate a 'chain-of-thought' audit log and data-provenance report for full, transparent explainability.</li><li>Use <strong>watsonx Orchestrate</strong> to manage the human-in-the-loop workflow, ensuring the recommendation is routed to the correct manager for a timely decision.</li></ul>"
        }
    ],
    predictiveMaintenance: [
        { text: "‼️ PREDICTIVE ALERT: Quality Control agent detects a subtle vibration anomaly in a critical welding robot on Assembly Line 3.", bubble: ["quality-control", "Vibration anomaly on Robot #7."], agent: "quality-control", type: 'event', handoffTo: "engineering-ops", 
          explanation: "<h3>Early Anomaly Detection</h3><p>The agent analyzes high-frequency sensor data from factory equipment, identifying microscopic deviations from normal operation that are precursors to a mechanical failure.</p><ul><li><b>vs. Rule-Based System:</b> A traditional system only triggers an alarm after a part has already failed. The agent predicts the failure *before* it happens.</li></ul>",
          challenge: "<h3>Sensor Data Quality & Volume</h3><p>The system's accuracy depends on high-quality, high-volume sensor data. Faulty sensors or data transmission gaps can lead to missed predictions or false alarms. Managing this massive data stream is a significant challenge.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>Instana</strong> to monitor the health and data output of the IoT sensors and the streaming data pipeline in real-time.</li><li>Leverage <strong>IBM Maximo</strong> to manage the physical asset data, maintenance history, and sensor calibration schedules, ensuring data quality at the source.</li></ul>"
        },
        { text: "⚙️ Engineering Ops agent cross-references the vibration signature with its knowledge base and predicts a 95% probability of a bearing failure within 48 hours.", bubble: ["engineering-ops", "Bearing failure imminent."], agent: "engineering-ops", handoffTo: "production-planner", 
          explanation: "<h3>Automated Diagnosis & Prediction</h3><p>The agent diagnoses the specific type of impending failure by matching the sensor data to a library of known fault patterns, and it provides a specific timeframe for action.</p><ul><li><b>vs. Manual:</b> This automates the complex work of a senior maintenance engineer, eliminating the need for manual inspection and guesswork.</li></ul>",
          challenge: "<h3>Knowledge Base Management</h3><p>The agent's diagnostic accuracy relies on a comprehensive and up-to-date knowledge base of fault patterns and repair procedures. This knowledge base must be carefully managed, versioned, and audited.</p><p><strong>Potential Solutions:</strong></p><ul><li>Manage the diagnostic knowledge base as a governed asset within <strong>watsonx.governance</strong>.</li><li>Use a Retrieval-Augmented Generation (RAG) pattern with <strong>watsonx.ai</strong> to connect the agent to the latest engineering manuals and asset data from <strong>IBM Maximo</strong>.</li></ul>"
        },
        { text: "🎯 Production Planner initiates the 'Scheduled Maintenance' playbook, finding a 2-hour window during the next shift change to perform the repair.", bubble: ["production-planner", "Scheduling repair window."], agent: "production-planner", handoffTo: "logistics-coordinator", 
          explanation: "<h3>Intelligent Scheduling</h3><p>The agent analyzes the master production schedule to find the least disruptive time to take the robot offline, minimizing impact on production targets.</p><ul><li><b>vs. Manual:</b> A manager would have to manually coordinate with the production floor, potentially choosing a suboptimal time that impacts output.</li></ul>",
          challenge: "<h3>Constraint Optimization</h3><p>Finding the 'least disruptive' time is a complex optimization problem. The agent must balance production targets, labor availability, part availability, and energy costs. A simple scheduling approach would be inefficient.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx.ai</strong> to build a sophisticated scheduling model that can optimize for multiple constraints simultaneously.</li><li>Track the cost-benefit of different scheduling options using data from <strong>Apptio</strong> to ensure the chosen window is not just operationally efficient but also financially optimal.</li></ul>"
        },
        { text: "COLLABORATIVE ACTION: Logistics Coordinator orders the replacement bearing to be delivered to Line 3, while Engineering Ops assigns a maintenance technician.", agent: ['logistics-coordinator', 'engineering-ops'], bubble: ["logistics-coordinator", "Part ordered. Tech assigned."], 
          explanation: "<h3>Synchronized Resource Allocation</h3><p>The system executes the maintenance plan by coordinating multiple agents in parallel. It handles parts procurement and human resource allocation simultaneously to ensure the repair is done efficiently.</p><ul><li><b>vs. Siloed Teams:</b> This avoids the delays of the planner having to call logistics, who then has to call maintenance. The response is instant and unified.</li></ul>",
          challenge: "<h3>Workflow Reliability Across Systems</h3><p>This single action requires integrating with multiple enterprise systems: the inventory system (like SAP), the HR system for technician scheduling, and the asset management system (<strong>IBM Maximo</strong>). A failure in any one of these integrations could derail the entire process.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx Orchestrate</strong> to build and manage the end-to-end maintenance workflow, providing a reliable, monitored, and auditable process that connects all necessary applications.</li></ul>"
        }
    ],
    newModelRollout: [
        { text: "PROACTIVE GOAL: The Planner agent is tasked with the goal: 'Retool Assembly Line 2 for the new 'Electron' EV model by Q4'.", bubble: ["production-planner", "Initiating 'Electron' rollout."], agent: "production-planner", type: 'optimized', handoffTo: "engineering-ops", 
          explanation: "<h3>Complex Goal Decomposition</h3><p>The agent takes a high-level, complex business goal and autonomously breaks it down into a sequence of logical sub-tasks and dependencies.</p><ul><li><b>vs. Virtual Assistant:</b> A virtual assistant could set a calendar reminder, but it cannot understand the intricate steps involved in retooling a factory line.</li></ul>",
          challenge: "<h3>Project Governance & Value Alignment</h3><p>How do you ensure this agent-initiated project, which will consume millions in resources, is perfectly aligned with the company's strategic and financial goals? A misaligned project would be a colossal waste.</p><p><strong>Potential Solutions:</strong></p><ul><li>Define high-level business objectives and budget constraints within <strong>watsonx.governance</strong> to act as guardrails for all agent-led initiatives.</li><li>Use <strong>Apptio</strong> to model the projected cost and business value of the rollout plan before any resources are committed, ensuring financial alignment.</li></ul>"
        },
        { text: "⚙️ Engineering Ops agent analyzes the 'Electron' CAD models and generates a list of 37 required new robotic end-effectors and software updates.", bubble: ["engineering-ops", "Generating retooling BOM."], agent: "engineering-ops", handoffTo: "supply-chain-monitor", 
          explanation: "<h3>Automated Bill of Materials (BOM) Generation</h3><p>The agent can interpret technical design documents (CAD files) to automatically generate a precise list of all necessary hardware and software changes, eliminating human error.</p><ul><li><b>vs. Manual:</b> This automates a highly detailed and error-prone task that would normally take engineers weeks to complete.</li></ul>",
          challenge: "<h3>Specialized Data Interpretation</h3><p>Interpreting complex, proprietary CAD files requires a highly specialized AI model. A generic Large Language Model would fail at this task, potentially generating a dangerously incorrect Bill of Materials (BOM).</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx.ai</strong> to fine-tune a foundation model (like an <strong>IBM Granite model</strong>) on your company's private library of engineering schematics and CAD files, creating a specialized and accurate tool.</li><li>Store and access these proprietary design files securely via <strong>watsonx.data</strong>.</li></ul>"
        },
        { text: "📡 Supply Chain Monitor sources vendors for the new equipment and negotiates delivery timelines to align with the Q4 goal.", bubble: ["supply-chain-monitor", "Sourcing new equipment..."], agent: "supply-chain-monitor", handoffTo: "production-planner", 
          explanation: "<h3>Goal-Oriented Negotiation</h3><p>The agent's negotiation with suppliers is driven by the master goal. It prioritizes delivery timelines to ensure the Q4 deadline is met, even if it means slightly adjusting other parameters like cost.</p><ul><li><b>vs. RPA:</b> An RPA bot could send a purchase order, but it cannot dynamically negotiate with a supplier to align with a strategic project deadline.</li></ul>",
          challenge: "<h3>Dynamic & Stateful Interaction</h3><p>A negotiation is a multi-turn conversation that requires remembering context and adapting on the fly. How do you build an agent that can reliably engage in these complex, stateful interactions with external parties?</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx Orchestrate</strong> to build the conversational workflow, allowing the agent to manage the state of the negotiation, connect to different communication channels (email, supplier portals), and escalate to a human if it encounters an unexpected query.</li></ul>"
        },
        { text: "🔁 Factory Optimizer runs a digital twin simulation of the new assembly line, identifying a potential bottleneck that reduces throughput by 12%.", bubble: ["factory-optimizer", "Simulation found a bottleneck!"], agent: "factory-optimizer", type: 'learning', handoffTo: "engineering-ops", 
          explanation: "<h3>Virtual Simulation & Optimization</h3><p>Before any physical changes are made, the Optimizer agent simulates the entire new process in a virtual environment (a 'digital twin') to identify and fix problems before they can cause real-world delays.</p><ul><li><b>vs. All Others:</b> This proactive, simulation-based optimization is a uniquely powerful capability, saving millions by preventing costly real-world errors and redesigns.</li></ul>",
          challenge: "<h3>Digital Twin Accuracy & Fidelity</h3><p>A digital twin simulation is only useful if it accurately reflects the real-world factory. Building and maintaining this high-fidelity model, which incorporates both physical and operational data, is extremely difficult.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx.ai</strong> to build the core simulation models and continuously update them with real-time operational data from <strong>Instana</strong> and asset data from <strong>IBM Maximo</strong>, ensuring the twin doesn't drift from reality.</li></ul>"
        }
    ],
    // Branches for human choice
    approveCost: [
      { text: "HUMAN INPUT: ✅ Higher cost approved. Supply Chain Monitor is placing a high-priority order with the alternative supplier.", bubble: ["supply-chain-monitor", "Placing emergency order."], agent: "supply-chain-monitor", type: 'optimized', 
        explanation: "<h3>Action from Approval</h3><p>With human oversight, the agentic system executes the approved strategy, automatically handling the procurement and logistics of the emergency order to prevent a production stoppage.</p>",
        challenge: "<h3>Audit & Compliance</h3><p>Approving an out-of-budget, emergency expenditure requires a clear and immutable audit trail. Who approved it? When? And based on what information? This needs to be tracked for financial compliance.</p><p><strong>Potential Solutions:</strong></p><ul><li>The entire decision process, from initial alert to human approval, is logged immutably within <strong>watsonx.governance</strong>, providing a complete, auditable record for financial and compliance teams.</li></ul>"
      }
    ],
    pauseProduction: [
      { text: "HUMAN INPUT: ❌ Cost increase rejected. Production Planner is initiating a controlled shutdown of Line 3 to conserve remaining chips for other lines.", bubble: ["production-planner", "Initiating controlled shutdown."], agent: "production-planner", 
        explanation: "<h3>Dynamic Re-Planning to New Goal</h3><p>When its primary recommendation is rejected, the system understands the new implicit goal ('minimize cost') and pivots to an entirely different strategy, orchestrating a controlled shutdown to conserve resources.</p>",
        challenge: "<h3>Cascading Impact Analysis</h3><p>Shutting down one production line has cascading effects on others, as well as on logistics and financials. The agent must be able to model these second-order impacts to ensure its 'controlled shutdown' plan is truly the optimal choice.</p><p><strong>Potential Solutions:</strong></p><ul><li>Use <strong>watsonx.ai</strong> to run a new simulation of the shutdown plan to model its downstream effects before execution.</li><li>Leverage <strong>Turbonomic</strong> to analyze the resource impact, ensuring that conserved resources are optimally re-allocated to other production lines.</li></ul>"
      }
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
  // Updated icons for automotive agents
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

// --- UI & STATE MANAGEMENT FUNCTIONS ---
function updateExplanation(htmlContent) {
    const explanationContainer = document.getElementById('explanation-text');
    explanationContainer.innerHTML = htmlContent;
}

function updateChallenges(htmlContent) {
    const challengesContainer = document.getElementById('challenges-text');
    challengesContainer.innerHTML = htmlContent;
}

function handleHumanChoice(branchName) {
  const humanInputContainer = document.getElementById('humanInputContainer');
  humanInputContainer.innerHTML = '';
  isWaitingForHuman = false;
  document.getElementById('nextStepBtn').disabled = false;
  
  const nextSteps = scenarios[branchName];
  // Corrected Logic: Replaces the human approval step (1) with the new steps.
  currentScenarioSteps.splice(stepIndex, 1, ...nextSteps);
  nextStep();
}

function askForHumanInput(step) {
  isWaitingForHuman = true;
  document.getElementById('nextStepBtn').disabled = true;

  updateExplanation(step.explanation);
  updateChallenges(step.challenge);

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
  updateChallenges(step.challenge || '<p>No specific challenges highlighted for this step.</p>');


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
      // Find the parent agent card
      const cardEl = document.getElementById(agentName);
      if (cardEl) {
        const statusEl = cardEl.querySelector(".status");
        
        // Activate the card and status
        cardEl.classList.add("active");
        statusEl.textContent = "Active";
        statusEl.className = "status active";

        // Revert to idle after a delay
        setTimeout(() => {
          cardEl.classList.remove("active");
          statusEl.textContent = "Idle";
          statusEl.className = "status idle";
        }, 2500);
      }
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
    updateChallenges('<h3>Post-Scenario Review</h3><p>After a scenario, the full trace of agent actions, decisions, and tool usage would be reviewed by an AgentOps team to ensure performance, manage costs, and identify areas for improvement.</p>');
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
  updateChallenges('<p>This panel will highlight the operational challenges and risks associated with each agent action.</p>');
  document.querySelectorAll(".status").forEach(s => { s.textContent = "Idle"; s.className = "status idle"; });
  document.querySelectorAll('.agent-card').forEach(c => c.classList.remove('active'));

  const scenarioName = type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
  log.innerHTML = `<p>[ Scenario loaded: <b>${scenarioName}</b>. Click 'Next Step' to begin. ]</p>`;
}

function setupScenarioButtons() {
    const buttonContainer = document.querySelector('.header-container div');
    if (!buttonContainer) return;
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
}

document.addEventListener('DOMContentLoaded', () => {
    setupScenarioButtons();
    
    const firstButton = document.querySelector('.scenario-btn');
    if (firstButton) {
        runScenario('supplyChainCrisis', firstButton);
    }
});
