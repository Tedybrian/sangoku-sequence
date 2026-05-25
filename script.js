let currentSet = "第5彈";
let currentSlot = "A";

const CARD_COLORS = {
  "#9781DE": ["劉羽禪", "魯肅", "大喬", "呂玲綺", "祝融"],
  "#ffd966": ["少年曹操", "許褚", "甘寧", "馬超"],
  "#2894FF": ["關羽", "王異", "步練師", "徐晃", "于禁"]
};

function getCardColor(card) {
  for (const color in CARD_COLORS) {
    if (CARD_COLORS[color].includes(card)) {
      return color;
    }
  }

  return "#f1f1f1";
}

function formatCard(card) {
  const color = getCardColor(card);

  return `
    <span style="
      color: ${color};
      font-weight: ${color === "#f1f1f1" ? "normal" : "bold"};
    ">
      ${card}
    </span>
  `;
}

function switchSlot(slot) {
  currentSlot = slot;
  searchCards();
}

function getInputs() {
  return [
    document.getElementById("card1").value.trim(),
    document.getElementById("card2").value.trim(),
    document.getElementById("card3").value.trim()
  ].filter(Boolean);
}

function findMatches(sequences, inputs) {
  const matches = [];

  sequences.forEach((seq, seqIndex) => {
    for (let i = 0; i <= seq.length - inputs.length; i++) {
      const match = inputs.every((card, index) =>
        seq[i + index] === card
      );

      if (match) {
        matches.push({
          seq,
          seqIndex,
          startIndex: i
        });
      }
    }
  });

  return matches;
}

function searchCards() {
  const inputs = getInputs();

  if (inputs.length === 0) {
    document.getElementById("result").innerHTML = "";
    return;
  }

  const sequences = CARD_DATA[currentSet][currentSlot];

  const matches = findMatches(sequences, inputs);

  const targetCard =
    document.getElementById("targetCard").value.trim();

  let fastest = null;

  if (targetCard) {
    matches.forEach(match => {
      const { seq, startIndex } = match;

      const targetIndex =
        seq.indexOf(targetCard, startIndex + inputs.length);

      if (targetIndex !== -1) {
        const distance =
          targetIndex - (startIndex + inputs.length) + 1;

        if (distance >= 1) {
          if (fastest === null || distance < fastest) {
            fastest = distance;
          }
        }
      }
    });
  }

  let jumpMessages = [];

  JUMP_POINTS[currentSet][currentSlot].forEach(jump => {
    const trigger = jump.trigger || [jump.from];
    const jumpTo = jump.jumpTo || [jump.to];

    const isTriggered = trigger.every(card =>
      inputs.includes(card)
    );

    if (isTriggered) {
      const typeText =
        jump.type === "fixed"
          ? "固定跳序"
          : "可能跳序";

      jumpMessages.push(
        `${typeText}：${trigger.join(" → ")} 之後可能跳到 ${jumpTo.join(" → ")}`
      );
    }
  });

  jumpMessages = [...new Set(jumpMessages)];

  const resultBox =
    document.getElementById("result");

  resultBox.innerHTML = `
    <p>目前槽位：${currentSlot}槽</p>

    <p>命中位置數：${matches.length}</p>

    ${
      fastest !== null
        ? `<p>目標卡最快還需：${fastest}道</p>`
        : targetCard
          ? `<p>目前命中位置後面找不到目標卡</p>`
          : ""
    }

    ${
      jumpMessages.length > 0
        ? jumpMessages
            .map(msg => `<p>⚠️ ${msg}</p>`)
            .join("")
        : ""
    }

    <hr>

    ${
      matches.length > 0
        ? `
          <div style="
            display: flex;
            flex-wrap: wrap;
            gap: 16px;
            align-items: flex-start;
          ">
            ${
              matches.map(match => {
                const { seq, seqIndex, startIndex } = match;

                const preview =
                  seq.slice(startIndex, startIndex + 20);

                return `
                  <div style="
                    width: 180px;
                    padding: 12px;
                    border: 1px solid #555;
                    border-radius: 8px;
                    background-color: #242424;
                  ">

                    <div style="
                      margin-bottom: 8px;
                      color: #aaa;
                      font-size: 13px;
                    ">
                      序列${seqIndex + 1}｜位置${startIndex + 1}
                    </div>

                    ${
                      preview.map((card, index) => `
                        <div style="
                          display: flex;
                          gap: 12px;
                          padding: 4px 0;
                          align-items: center;
                          white-space: nowrap;
                        ">

                          <span style="
                            width: 28px;
                            color: #aaa;
                            text-align: right;
                            flex-shrink: 0;
                          ">
                            ${index + 1}.
                          </span>

                          <span>
                            ${formatCard(card)}
                          </span>

                        </div>
                      `).join("")
                    }

                  </div>
                `;
              }).join("")
            }
          </div>
        `
        : `<p>沒有符合的卡序</p>`
    }
  `;
}

function updateCardList(value) {
  const keyword = value.trim();

  const cardSet = new Set();

  if (keyword === "") {
    document.getElementById("cardList").innerHTML = "";
    return;
  }

  Object.values(CARD_DATA).forEach(setData => {
    Object.values(setData).forEach(slotData => {
      slotData.forEach(seq => {
        seq.forEach(card => {
          if (card.includes(keyword)) {
            cardSet.add(card);
          }
        });
      });
    });
  });

  const cardList =
    document.getElementById("cardList");

  cardList.innerHTML =
    Array.from(cardSet)
      .map(card =>
        `<option value="${card}"></option>`
      )
      .join("");

  if (cardSet.has(keyword)) {
    setTimeout(() => {
      clearCardList();
    }, 100);
  }
}

function clearCardList() {
  document.getElementById("cardList").innerHTML = "";
}

function clearInputs() {
  document.getElementById("card1").value = "";
  document.getElementById("card2").value = "";
  document.getElementById("card3").value = "";
  document.getElementById("targetCard").value = "";

  clearCardList();
  searchCards();
}

searchCards();