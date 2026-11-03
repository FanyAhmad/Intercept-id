/* ==========================================================
   news.js
   Membaca data/news.json, lalu menyusun halaman News:
   satu blok per kegiatan, isinya deretan foto.

   Alurnya:
     1. fetch()        -> minta file JSON ke server
     2. response.json() -> ubah teks JSON jadi objek JavaScript (parse)
     3. buat elemen    -> untuk tiap kegiatan, buat judul + deretan foto
     4. pasang ke halaman

   Urutan tampil = urutan di news.json.
   Kegiatan terbaru ditaruh PALING ATAS di file JSON.

   Catatan: file ini memakai assetPath() dari main.js,
   jadi main.js harus dimuat lebih dulu (lihat urutan <script> di news.html).
   ========================================================== */

// Lokasi file data. Path relatif, dihitung dari news.html.
const NEWS_JSON = "data/news.json";

// Ikon gambar kecil untuk kotak placeholder.
// Isinya konstan (bukan dari JSON), jadi aman dipasang lewat innerHTML.
const IKON_FOTO =
  '<svg class="photo-placeholder-icon" viewBox="0 0 36 30" width="36" height="30" ' +
  'fill="none" stroke="currentColor" stroke-width="1" aria-hidden="true">' +
  '<rect x="0.5" y="0.5" width="35" height="29"></rect>' +
  '<path d="M1 24 L11 14 L18 21 L24 15 L35 25"></path>' +
  '<circle cx="26" cy="7" r="2.2"></circle></svg>';


// Kotak pengganti kalau foto belum ada atau gagal dimuat.
function buatPlaceholder() {
  const kotak = document.createElement("div");
  kotak.className = "photo-placeholder";
  kotak.innerHTML =
    IKON_FOTO + '<span class="photo-placeholder-label">Placeholder foto</span>';
  return kotak;
}


// Satu foto = satu <figure> berisi <img>.
// namaFile  : nama di JSON, misalnya "kegiatan-1/foto-1.webp"
// urutan    : posisi foto (mulai 0), dipakai untuk teks alt
// total     : jumlah foto di kegiatan itu
function buatKartuFoto(namaFile, namaKegiatan, urutan, total) {
  const kartu = document.createElement("figure");
  kartu.className = "photo-card";

  // assetPath("photo", ...) dari main.js: menambah folder assets/photo/
  // dan menolak nama yang berbahaya (misalnya yang memakai "..").
  const path = typeof assetPath === "function" ? assetPath("photo", namaFile) : null;
  if (!path) {
    kartu.appendChild(buatPlaceholder());
    return kartu;
  }

  const img = document.createElement("img");
  img.alt = "Foto " + (urutan + 1) + " dari " + total + ", kegiatan " + namaKegiatan;
  img.loading = "lazy";   // foto di luar layar baru dimuat saat mendekat

  // Kalau file tidak ada (404), ganti dengan kotak placeholder.
  // Pasang listener SEBELUM mengisi src supaya error tidak terlewat.
  img.addEventListener("error", () => {
    console.warn("Foto tidak ditemukan:", path);
    img.replaceWith(buatPlaceholder());
  });
  img.src = path;

  kartu.appendChild(img);
  return kartu;
}


// Satu kegiatan = judul + deretan foto.
function buatKegiatan(kegiatan) {
  const grup = document.createElement("section");
  grup.className = "news-group";

  // textContent (bukan innerHTML) supaya teks dari JSON tidak pernah
  // dibaca sebagai HTML. Ini kebiasaan yang aman untuk data dari file.
  const judul = document.createElement("h2");
  judul.className = "news-title";
  judul.textContent = kegiatan.nama;
  grup.appendChild(judul);

  const daftarFoto = Array.isArray(kegiatan.foto) ? kegiatan.foto : [];

  if (daftarFoto.length === 0) {
    const pesan = document.createElement("p");
    pesan.className = "news-status";
    pesan.textContent = "Foto belum tersedia.";
    grup.appendChild(pesan);
    return grup;
  }

  // Wadah yang bisa digeser menyamping.
  // tabindex=0 + role=region: pengguna keyboard bisa fokus ke sini
  // lalu menggeser dengan tombol panah kiri/kanan.
  const galeri = document.createElement("div");
  galeri.className = "gallery";
  galeri.tabIndex = 0;
  galeri.setAttribute("role", "region");
  galeri.setAttribute("aria-label", "Foto kegiatan " + kegiatan.nama);

  daftarFoto.forEach((namaFile, i) => {
    galeri.appendChild(buatKartuFoto(namaFile, kegiatan.nama, i, daftarFoto.length));
  });

  grup.appendChild(galeri);
  return grup;
}


// Tampilkan satu kalimat pesan di dalam wadah (kosong, error, dll).
function tampilkanPesan(wadah, teks) {
  const p = document.createElement("p");
  p.className = "news-status";
  p.textContent = teks;
  wadah.replaceChildren(p);
}


// Fungsi utama.
// async/await: "tunggu sampai fetch selesai, baru lanjut ke baris berikutnya".
async function muatNews() {
  const wadah = document.getElementById("news-list");
  if (!wadah) return;   // bukan halaman news, tidak ada yang dikerjakan

  try {
    const respons = await fetch(NEWS_JSON);
    if (!respons.ok) {
      throw new Error("Gagal memuat " + NEWS_JSON + " (status " + respons.status + ")");
    }

    // Kalau isi JSON salah ketik (koma kurang, tanda kutip hilang, dll),
    // baris di bawah ini melempar error dan ditangkap oleh catch.
    const data = await respons.json();

    // Ambil hanya entri yang punya nama.
    const daftar = Array.isArray(data.kegiatan)
      ? data.kegiatan.filter((k) => k && k.nama)
      : [];

    if (daftar.length === 0) {
      tampilkanPesan(wadah, "Belum ada kegiatan.");
      return;
    }

    wadah.replaceChildren();   // hapus teks "Memuat..."
    daftar.forEach((kegiatan) => wadah.appendChild(buatKegiatan(kegiatan)));

  } catch (err) {
    // Detail error ada di console (F12). Pengunjung cukup melihat pesan singkat.
    console.error(err);
    tampilkanPesan(wadah, "Daftar kegiatan belum bisa dimuat. Coba muat ulang halaman.");
  }
}

document.addEventListener("DOMContentLoaded", muatNews);