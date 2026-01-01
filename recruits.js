: "images/placeholder.png";

const position = p.Position || p.Pos || "";
const height =
  p.Height ||
  p.Ht ||
  p["Height (ft/in)"] ||
  "";

const weight =
  p.Weight ||
  p.Wt ||
  p["Weight (lbs)"] ||
  "";

const writeup =
p.WriteUp ||
@@ -71,20 +61,7 @@ const writeup =
const hudl = p.Hudl || p.HUDL || "";
const twitter = p.Twitter || p.X || "";

card.innerHTML = `
  <img src="${img}" class="recruit-photo" alt="${p.Name}">

  <h3>${p.Name}</h3>

  <p class="meta">
    ${position} • Class of ${p.Class}
  </p>

  ${
    height || weight
      ? `<p class="measurements">${height}${height && weight ? " / " : ""}${weight}${weight ? " lbs" : ""}</p>`
      : ""
  }

${
writeup
@@ -108,4 +85,4 @@ card.innerHTML = `

grid.appendChild(card);
});
}
}
