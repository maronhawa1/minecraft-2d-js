const TOOL_RULES = {
  axe: ["tree", "leaves"],
  pickaxe: ["gold", "diamond", "coal"],
  shovel: ["dirt", "soil", "ground"],
};

const TYPE_ICONS = {
  ground: "./images/ground.png",
  soil: "./images/soil.jpg",
  gold: "./images/rock1.jpg",
  diamond: "./images/rock2.jpg",
  coal: "./images/rock3.jpg",
  tree: "./images/wood.jpg",
  leaves: "./images/leave.jpg",
};

const rockMap = {
  "./images/rock1.jpg": "gold",
  "./images/rock2.jpg": "diamond",
  "./images/rock3.jpg": "coal",
};

let selectedTool = "shovel";
let inventory = {};
let placingType = null;
const COLS = 25;
const rockTypes = [
  "./images/rock1.jpg",
  "./images/rock2.jpg",
  "./images/rock3.jpg",
];
const howBtn = document.getElementById("how-btn");
const closeBtn = document.getElementById("close-btn");

if (howBtn) {
  howBtn.onclick = function () {
    document.getElementById("how-modal").classList.remove("hidden");
  };
}

if (closeBtn) {
  closeBtn.onclick = function () {
    document.getElementById("how-modal").classList.add("hidden");
  };
}

// עצים רנדומליים — לא קרובים לקצה ולא קרובים אחד לשני
const treePositions = [];
let maxTries = 100;

while (treePositions.length < 3 && maxTries > 0) {
  const pos = Math.floor(Math.random() * (COLS - 6)) + 3;
  let tooClose = false;

  for (let i = 0; i < treePositions.length; i++) {
    if (Math.abs(treePositions[i] - pos) < 6) {
      tooClose = true;
      break;
    }
  }

  if (!tooClose) treePositions.push(pos);
  maxTries--;
}

function createBlock(src, type) {
  const img = document.createElement("img");
  img.src = src;
  img.className = "block";
  img.dataset.type = type;
  img.dataset.mined = "";

  img.onclick = function () {
    const currentType = img.dataset.type;

    if (placingType !== null) {
      if (img.dataset.mined === "true" || currentType === "air") {
        img.src = TYPE_ICONS[placingType];
        img.dataset.type = placingType;
        img.dataset.mined = "";
        img.style.opacity = "1";
        inventory[placingType]--;
        if (inventory[placingType] <= 0) {
          delete inventory[placingType];
          placingType = null;
        }
        renderInventory();
      }
      return;
    }

    if (img.dataset.mined === "true") return;
    if (currentType === "air") return;

    const tools = TOOL_RULES[selectedTool];
    for (let i = 0; i < tools.length; i++) {
      if (tools[i] === currentType) {
        inventory[currentType] = (inventory[currentType] || 0) + 1;
        img.dataset.mined = "true";
        img.style.opacity = "0";
        renderInventory();
        break;
      }
    }
  };

  return img;
}

function renderInventory() {
  const invEl = document.getElementById("inventory");
  invEl.innerHTML = "";

  for (const type in inventory) {
    const slot = document.createElement("div");
    slot.className = placingType === type ? "inv-slot selected" : "inv-slot";

    const icon = document.createElement("img");
    icon.src = TYPE_ICONS[type] || "";
    icon.className = "inv-icon";

    const label = document.createElement("span");
    label.className = "inv-label";
    label.textContent = type;

    const count = document.createElement("span");
    count.className = "inv-count";
    count.textContent = inventory[type];

    slot.appendChild(icon);
    slot.appendChild(label);
    slot.appendChild(count);

    slot.onclick = (function (t) {
      return function () {
        placingType = t;
        renderInventory();
      };
    })(type);

    invEl.appendChild(slot);
  }
}

const buttons = document.getElementsByClassName("tool-btn");
for (let i = 0; i < buttons.length; i++) {
  buttons[i].onclick = function () {
    selectedTool = this.dataset.tool;
    placingType = null;
    for (let j = 0; j < buttons.length; j++) {
      buttons[j].classList.remove("active");
    }
    this.classList.add("active");
    renderInventory();
  };
}

const ground = document.getElementById("ground");

// 1. שמיים + עצים
for (let row = 0; row < 10; row++) {
  for (let col = 0; col < COLS; col++) {
    let isGzaa = false;
    let isLeaf = false;

    for (let t = 0; t < treePositions.length; t++) {
      const tp = treePositions[t];
      if (col === tp && row >= 6) isGzaa = true;
      if (col >= tp - 1 && col <= tp + 1 && row >= 2 && row < 6) isLeaf = true;
    }

    if (isGzaa) {
      ground.appendChild(createBlock("./images/wood.jpg", "tree"));
    } else if (isLeaf) {
      ground.appendChild(createBlock("./images/leave.jpg", "leaves"));
    } else {
      ground.appendChild(createBlock("./images/sky.png", "air"));
    }
  }
}

// 2. עשב
for (let i = 0; i < COLS; i++) {
  ground.appendChild(createBlock("./images/ground.png", "ground"));
}

// 3. עפר + אבנים
let count = 0;
while (count < COLS * 10) {
  if (count % 10 === 0) {
    const src1 = rockTypes[Math.floor(Math.random() * rockTypes.length)];
    const src2 = rockTypes[Math.floor(Math.random() * rockTypes.length)];
    ground.appendChild(createBlock(src1, rockMap[src1]));
    ground.appendChild(createBlock(src2, rockMap[src2]));
    count += 2;
  } else {
    ground.appendChild(createBlock("./images/soil.jpg", "soil"));
    count++;
  }
}
document.getElementById("reset-btn").onclick = function () {
  location.reload();
};
