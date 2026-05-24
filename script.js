let currentSet = "第5彈";
let currentSlot = "A";

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

function searchCards() {

  const inputs = getInputs();

  const sequences =
    CARD_DATA[currentSet][currentSlot];

  const results = sequences.filter(seq => {

    for (let i = 0; i <= seq.length - inputs.length; i++) {

      const match = inputs.every((card, index) =>
        seq[i + index] === card
      );

      if (match) {
        return true;
      }
    }

    return false;
  });

  const targetCard =
    document.getElementById("targetCard").value.trim();

  let fastest = null;

  if (targetCard) {

    results.forEach(seq => {

      for (let i = 0; i <= seq.length - inputs.length; i++) {

        const match = inputs.every((card, index) =>
          seq[i + index] === card
        );

        if (match) {

          const targetIndex =
            seq.indexOf(targetCard, i);

          if (targetIndex !== -1) {

            const distance =
              targetIndex - (i + inputs.length) + 1;

            if (distance >= 1) {

              if (
                fastest === null ||
                distance < fastest
              ) {
                fastest = distance;
              }
            }
          }
        }
      }

    });
  }

  let jumpMessages = [];

  JUMP_POINTS[currentSet][currentSlot].forEach(jump => {

    if (inputs.includes(jump.from)) {

      const typeText =
        jump.type === "fixed"
          ? "固定跳序"
          : "可能跳序";

      jumpMessages.push(
        `${typeText}：${jump.from} 之後可能跳到 ${jump.to}`
      );
    }

  });

  jumpMessages = [...new Set(jumpMessages)];

  const resultBox =
    document.getElementById("result");

  resultBox.innerHTML = `
    <p>目前槽位：${currentSlot}槽</p>

    <p>剩餘可能序列：${results.length}</p>

    ${
      fastest !== null
        ? `<p>目標卡最快還需：${fastest}道</p>`
        : targetCard
          ? `<p>目前可能序列中找不到目標卡</p>`
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
      results.length > 0
        ? results.map(seq => {

            let startIndex = 0;

            for (let i = 0; i <= seq.length - inputs.length; i++) {

              const match = inputs.every((card, index) =>
                seq[i + index] === card
              );

              if (match) {
                startIndex = i;
                break;
              }
            }

            const preview =
              seq.slice(startIndex, startIndex + 20);

            return `
              <p>${preview.join(" → ")}</p>
            `;

          }).join("")
        : `<p>沒有符合的卡序</p>`
    }
  `;
}

function updateCardList(value) {

  const keyword = value.trim();

  const cardSet = new Set();

  if (keyword === "") {

    document.getElementById(
      "cardList"
    ).innerHTML = "";

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

searchCards();