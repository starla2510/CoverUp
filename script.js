// CLASS PEMAIN (PARENT)
class Pemain {
  #id;
  #kata;
  #sudahDibuka = false;
  #tereliminasi = false;





  
  constructor(id, kata) {
    this.#id = id;
    this.#kata = kata;
  }

  getId() {
    return this.#id;
  }

  getNama() {
    return `Player ${this.#id}`;
  }

  getKata() {
    return this.#kata;
  }

  sudahDibuka() {
    return this.#sudahDibuka;
  }

  bukaKartu() {
    this.#sudahDibuka = true;
  }

  sudahKeluar() {
    return this.#tereliminasi;
  }

  eliminasi() {
    this.#tereliminasi = true;
  }




  getRole() {
    return "Unknown";
  }

  getRoleClass() {
    return "";
  }

  getPesan() {
    return "ingat kata ini baik-baik";
  }
}



//-




class Civilian extends Pemain {
  getRole() {
    return "Civilian";
  }

  getRoleClass() {
    return "role-civilian";
  }
}

class MrWhite extends Pemain {
  getRole() {
    return "Mr.White";
  }

  getRoleClass() {
    return "role-mrwhite";
  }
}

class Undercover extends Pemain {
  constructor(id) {
    super(id, "?????");
  }

  getRole() {
    return "Undercover";
  }

  getRoleClass() {
    return "role-undercover";
  }

  getPesan() {
    return "kamu adalah undercover, coba tebak kata dari pemain lain";
  }
}

// GAME

class Permainan {
  #daftarPemain = [];

  buatGame(jumlahPemain, kataCivilian, kataMrWhite) {
    this.#daftarPemain = [];

    const posisi = [...Array(jumlahPemain).keys()];

    posisi.sort(() => Math.random() - 0.5);

    const posisiMrWhite1 = posisi[0];
    const posisiMrWhite2 = posisi[1];
    const posisiUndercover = posisi[2];

    for (let i = 0; i < jumlahPemain; i++) {
      const id = i + 1;






      if (i === posisiUndercover) {
        this.#daftarPemain.push(new Undercover(id));
      } else if (i === posisiMrWhite1 || i === posisiMrWhite2) {
        this.#daftarPemain.push(new MrWhite(id, kataMrWhite));
      } else {
        this.#daftarPemain.push(new Civilian(id, kataCivilian));
      }
    }
  }

  getSemuaPemain() {
    return [...this.#daftarPemain];
  }

  cariPemain(id) {
    return this.#daftarPemain.find((p) => p.getId() === id);
  }

  semuaSudahDibuka() {
    return this.#daftarPemain.every((p) => p.sudahDibuka());
  }





  
    cekPemenang() {
    const aktif = this.#daftarPemain.filter((p) => !p.sudahKeluar());

    const impostor = aktif.filter(
      (p) => p instanceof MrWhite || p instanceof Undercover,
    ).length;

    const civilian = aktif.filter((p) => p instanceof Civilian).length;

    if (impostor === 0) {
      return "civilian";
    }

    if (impostor >= civilian) {
      return "impostor";
    }

    return null;
  }
}

// INSTANCE GAME

const permainan = new Permainan();


// ELEMENT HTML

const setupSection = document.getElementById("setup-section");

const gameSection = document.getElementById("game-section");

const playerContainer = document.getElementById("player-container");

const btnMulai = document.getElementById("btn-mulai");

const btnMulaiVoting = document.getElementById("btn-mulai-voting");

const popupKata = document.getElementById("popup-kata");

const popupEliminasi = document.getElementById("popup-eliminasi");

const popupGameover = document.getElementById("popup-gameover");

// MULAI GAME

btnMulai.addEventListener("click", () => {
  const jumlahPemain = parseInt(document.getElementById("jumlah-pemain").value);

  if (!jumlahPemain || jumlahPemain < 6 || jumlahPemain > 12) {
    alert("Jumlah pemain 6 - 12");
    return;
  }

  fetch("wordbank.json")
    .then((res) => res.json())
    .then((data) => {
      const kataRandom = data[Math.floor(Math.random() * data.length)];

      permainan.buatGame(jumlahPemain, kataRandom.civilian, kataRandom.MrWhite);

      // Mengubah background menjadi BG_1.jpg (tirai terbuka)
      document.body.classList.add("game-started");

      setupSection.classList.add("hidden");
      gameSection.classList.remove("hidden");
      renderPlayer();
    });
});

// RENDER PLAYER

function renderPlayer() {
  playerContainer.innerHTML = "";

  permainan.getSemuaPemain().forEach((player) => {
    const card = document.createElement("div");

    card.className = "player-card";

    if (player.sudahDibuka()) {
      card.classList.add("opened");
    }

    if (player.sudahKeluar()) {
      card.classList.add("eliminated");
    }

    let status = "Belum Dibuka";

    if (player.sudahKeluar()) {
      status = "Tereliminasi";
    } else if (player.sudahDibuka()) {
      status = "✓ Sudah Dilihat";
    }

    card.innerHTML = `
      <h3>${player.getNama()}</h3>

      <p class="player-status">
        ${status}
      </p>

      <button
        class="btn btn-primary"
        ${player.sudahDibuka() ? "disabled" : ""}
      >
        Lihat Kata
      </button>
    `;

    const tombol = card.querySelector("button");

    tombol.addEventListener("click", () => {
      bukaPopupKata(player.getId());
    });

    playerContainer.appendChild(card);
  });

  btnMulaiVoting.disabled = !permainan.semuaSudahDibuka();
}

// POPUP KATA

function bukaPopupKata(id) {
  const pemain = permainan.cariPemain(id);

  document.getElementById("popup-player-name").textContent = pemain.getNama();

  document.getElementById("popup-kata-text").textContent = pemain.getKata();

  document.getElementById("popup-keterangan").textContent = pemain.getPesan();

  popupKata.classList.add("active");

  pemain.bukaKartu();

  renderPlayer();
}

// TUTUP POPUP KATA

document.getElementById("btn-tutup-kata").addEventListener("click", () => {
  popupKata.classList.remove("active");
});

// MULAI VOTING

btnMulaiVoting.addEventListener("click", () => {
  votingAktif = true;

  playerContainer.innerHTML = "";

  permainan.getSemuaPemain().forEach((player) => {
    const card = document.createElement("div");

    card.className =
      "player-card" + (player.sudahKeluar() ? " eliminated" : "");

    card.innerHTML = `
      <h3>${player.getNama()}</h3>

      <button
        class="btn"
      >
        Vote
      </button>
    `;

    const tombol = card.querySelector("button");

    tombol.disabled = player.sudahKeluar();

    tombol.addEventListener("click", () => {
      eliminasiPemain(player.getId());
    });

    playerContainer.appendChild(card);
  });

  btnMulaiVoting.style.display = "none";
});

// ELIMINASI




function eliminasiPemain(id) {
  const pemain = permainan.cariPemain(id);

  pemain.eliminasi();

  document.getElementById("nama-eliminasi").textContent = pemain.getNama();

  const role = document.getElementById("role-eliminasi");

  role.textContent = pemain.getRole();

  role.className = "role-badge " + pemain.getRoleClass();

  popupEliminasi.classList.add("active");
}

// TUTUP POPUP ELIMINASI

document.getElementById("btn-tutup-eliminasi").addEventListener("click", () => {
  popupEliminasi.classList.remove("active");

  const hasil = permainan.cekPemenang();

  if (hasil) {
    tampilkanGameOver(hasil);
    return;
  }

  btnMulaiVoting.click();
});

// GAME OVER

function tampilkanGameOver(pemenang) {
  popupGameover.classList.add("active");

  document.getElementById("judul-pemenang").textContent =
    pemenang === "civilian" ? "🎉 Civilians Menang!" : "😈 Impostor Menang!";

  document.getElementById("deskripsi-pemenang").textContent =
    pemenang === "civilian"
      ? "Semua impostor berhasil ditemukan"
      : "Impostor berhasil bertahan";

  const reveal = document.getElementById("reveal-container");

  reveal.innerHTML = "";

  permainan.getSemuaPemain().forEach((pemain) => {
    const item = document.createElement("div");

    item.className = "reveal-item";

    item.innerHTML = `
        <span>${pemain.getNama()}</span>

        <span class="
          role-badge
          ${pemain.getRoleClass()}
        ">
          ${pemain.getRole()}
        </span>
      `;

    reveal.appendChild(item);
  });
}

// MAIN LAGI

document.getElementById("btn-main-lagi").addEventListener("click", () => {
  location.reload();
});
